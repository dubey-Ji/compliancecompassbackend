import { Op, Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import db from "../models/index.js";
import logger from "../utils/logger.js";

const Project = db.Project;
const Control = db.Control;
const ProjectControl = db.ProjectControl;
const Evidence = db.Evidence;
const ControlSystemMapping = db.ControlSystemMapping;
const SystemUsed = db.SystemUsed;
const IntegrationCatalog = db.IntegrationCatalog;
const Integration = db.Integration;
const IntegrationEvidence = db.IntegrationEvidence;

const ALLOWED_STATUSES = ["not_started", "in_progress", "passed", "failed"];
const ALLOWED_SEVERITIES = ["High", "Medium", "Low"];
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE = 1;
const DEFAULT_VERDICT = "no_run";

const MACHINE_VERDICT_TONES = {
  pass: "text-green-700 bg-green-50 border border-green-200",
  fail: "text-red-700 bg-red-50 border border-red-200",
  no_run: "text-slate-600 bg-slate-100 border border-slate-200",
};

const normalizeVerdict = (value) => {
  if (!value) return DEFAULT_VERDICT;
  const normalized = String(value).trim().toLowerCase();
  if (normalized.includes("pass")) return "pass";
  if (normalized.includes("fail")) return "fail";
  if (normalized === "no_run" || normalized === "no run") return "no_run";
  return DEFAULT_VERDICT;
};

const formatAutomationVerdict = (value) => {
  const normalized = normalizeVerdict(value);
  switch (normalized) {
    case "pass":
      return "PASS";
    case "fail":
      return "FAIL";
    default:
      return "NO RUN";
  }
};

const formatIntegrationCallout = (systemKey) =>
  systemKey ? `Connect ${systemKey} to unlock automation.` : null;

/**
 * Parse and validate query parameters
 */
const parseFilters = (filters) => {
  const parsed = {};

  // Page
  const page = parseInt(filters.page, 10);
  parsed.page = isNaN(page) || page < 1 ? DEFAULT_PAGE : page;

  // PageSize
  const pageSize = parseInt(filters.pageSize, 10);
  parsed.pageSize =
    isNaN(pageSize) || pageSize < 1
      ? DEFAULT_PAGE_SIZE
      : Math.min(pageSize, MAX_PAGE_SIZE);

  // Status - can be comma-separated or single value
  if (filters.status) {
    const statusArray = Array.isArray(filters.status)
      ? filters.status
      : filters.status.split(",").map((s) => s.trim());
    const validStatuses = statusArray.filter((s) =>
      ALLOWED_STATUSES.includes(s)
    );
    if (validStatuses.length > 0) {
      parsed.status = validStatuses;
    }
  }

  // Severity
  if (filters.severity && ALLOWED_SEVERITIES.includes(filters.severity)) {
    parsed.severity = filters.severity;
  }

  // Category
  if (filters.category) {
    parsed.category = filters.category.trim();
  }

  // Automatable
  if (filters.automatable !== undefined && filters.automatable !== null) {
    const automatableStr = String(filters.automatable).toLowerCase();
    if (automatableStr === "true") {
      parsed.automatable = true;
    } else if (automatableStr === "false") {
      parsed.automatable = false;
    }
  }

  // Search
  if (filters.search) {
    parsed.search = filters.search.trim();
  }

  return parsed;
};

/**
 * Get project controls with filters, pagination, and metadata
 */
export const getProjectControls = async ({
  projectId,
  organization_id,
  filters,
}) => {
  // Step 1: Validate project belongs to organization
  const project = await Project.findOne({
    where: {
      id: projectId,
      organization_id,
    },
    attributes: ["id", "name"],
  });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 2: Parse & validate query params
  const parsedFilters = parseFilters(filters);

  // Step 3: Build base query
  const whereClause = {
    project_id: projectId,
  };

  // Apply status filter
  if (parsedFilters.status && parsedFilters.status.length > 0) {
    whereClause.status = {
      [Op.in]: parsedFilters.status,
    };
  }

  // Build control where clause
  const controlWhereClause = {};

  if (parsedFilters.severity) {
    controlWhereClause.severity = parsedFilters.severity;
  }

  if (parsedFilters.category) {
    controlWhereClause.category = parsedFilters.category;
  }

  if (parsedFilters.automatable !== undefined) {
    controlWhereClause.automatable = parsedFilters.automatable;
  }

  if (parsedFilters.search) {
    const searchTerm = `%${parsedFilters.search}%`;
    controlWhereClause[Op.or] = [
      { control_key: { [Op.iLike]: searchTerm } },
      { title: { [Op.iLike]: searchTerm } },
      { description: { [Op.iLike]: searchTerm } },
    ];
  }

  // Step 4: Get total count (for pagination)
  const totalCount = await ProjectControl.count({
    where: whereClause,
    include: [
      {
        model: Control,
        as: "control",
        where: controlWhereClause,
        required: true,
      },
    ],
  });

  // Step 5: Get paginated results
  const offset = (parsedFilters.page - 1) * parsedFilters.pageSize;

  // Define ordering: severity (High -> Low), then status priority, then category
  const projectControls = await ProjectControl.findAll({
    where: whereClause,
    include: [
      {
        model: Control,
        as: "control",
        where: controlWhereClause,
        required: true,
        attributes: [
          "id",
          "control_key",
          "title",
          "category",
          "description",
          "severity",
          "automatable",
          "why_it_matters",
        ],
      },
    ],
    order: [
      [
        Sequelize.literal(`CASE 
        WHEN \`control\`.\`severity\` = 'High' THEN 1 
        WHEN \`control\`.\`severity\` = 'Medium' THEN 2 
        WHEN \`control\`.\`severity\` = 'Low' THEN 3 
        ELSE 4 
      END`),
        "ASC",
      ],
      [
        Sequelize.literal(`CASE 
        WHEN \`ProjectControl\`.\`status\` = 'failed' THEN 1 
        WHEN \`ProjectControl\`.\`status\` = 'in_progress' THEN 2 
        WHEN \`ProjectControl\`.\`status\` = 'not_started' THEN 3 
        WHEN \`ProjectControl\`.\`status\` = 'passed' THEN 4 
        ELSE 5 
      END`),
        "ASC",
      ],
      [Sequelize.col("control.category"), "ASC"],
      [Sequelize.col("control.control_key"), "ASC"],
    ],
    limit: parsedFilters.pageSize,
    offset,
    raw: false,
  });

  // Step 6: Compute evidence metadata for each control
  const projectControlIds = projectControls.map((pc) => pc.id);
  const evidencePresenceMap = new Map();
  const evidenceDetailsMap = new Map();

  if (projectControlIds.length > 0) {
    const evidenceRecords = await Evidence.findAll({
      where: {
        project_control_id: {
          [Op.in]: projectControlIds,
        },
      },
      attributes: [
        "id",
        "project_control_id",
        "file_name",
        "file_type",
        "file_url",
        "uploaded_by",
        "uploaded_at",
        "metadata",
        "created_at",
      ],
      order: [["uploaded_at", "DESC"]],
      raw: true,
    });

    evidenceRecords.forEach((record) => {
      evidencePresenceMap.set(record.project_control_id, true);
      if (!evidenceDetailsMap.has(record.project_control_id)) {
        evidenceDetailsMap.set(record.project_control_id, []);
      }
      evidenceDetailsMap.get(record.project_control_id).push({
        id: record.id,
        type: record.file_type || "file",
        name: record.file_name || record.file_url,
        url: record.file_url,
        addedBy: record.uploaded_by,
        date: record.uploaded_at || record.created_at,
        metadata: record.metadata || {},
      });
    });
  }

  // Step 7: Compute relevantSystems & recommendedIntegrations
  const controlIds = projectControls.map((pc) => pc.control_id);

  // Get control-system mappings for these controls
  const controlSystemMappings = await ControlSystemMapping.findAll({
    where: {
      control_id: {
        [Op.in]: controlIds,
      },
    },
    attributes: ["control_id", "system_key"],
    raw: true,
  });

  // Get organization's systems_used
  const systemsUsed = await SystemUsed.findAll({
    where: {
      organization_id,
    },
    attributes: ["system_key"],
    raw: true,
  });

  const orgSystemKeys = new Set(systemsUsed.map((su) => su.system_key));

  // Build relevantSystems map: control_id -> [system_key, ...]
  const relevantSystemsMap = new Map();
  const controlSystemsMap = new Map();
  controlSystemMappings.forEach(({ control_id, system_key }) => {
    if (!controlSystemsMap.has(control_id)) {
      controlSystemsMap.set(control_id, []);
    }
    controlSystemsMap.get(control_id).push(system_key);

    if (orgSystemKeys.has(system_key)) {
      if (!relevantSystemsMap.has(control_id)) {
        relevantSystemsMap.set(control_id, []);
      }
      relevantSystemsMap.get(control_id).push(system_key);
    }
  });

  // Get integration catalog entries for automated checks
  const relevantSystemKeys = Array.from(orgSystemKeys);
  const integrationCatalogEntries = await IntegrationCatalog.findAll({
    where: {
      system_key: {
        [Op.in]: relevantSystemKeys,
      },
      supports_automated_checks: true,
    },
    attributes: ["integration_key", "system_key"],
    raw: true,
  });

  // Get connected integrations for this org
  const connectedIntegrations = await Integration.findAll({
    where: {
      organization_id,
      status: {
        [Op.ne]: "disconnected",
      },
    },
    attributes: ["integration_key"],
    raw: true,
  });

  const connectedIntegrationKeys = new Set(
    connectedIntegrations.map((ci) => ci.integration_key)
  );

  // Build system -> integration map
  const systemIntegrationMap = new Map();
  integrationCatalogEntries.forEach((entry) => {
    if (!connectedIntegrationKeys.has(entry.integration_key)) {
      if (!systemIntegrationMap.has(entry.system_key)) {
        systemIntegrationMap.set(entry.system_key, []);
      }
      systemIntegrationMap.get(entry.system_key).push(entry.integration_key);
    }
  });

  // Track systems with pending integrations per control
  const pendingSystemsMap = new Map();
  controlSystemMappings.forEach(({ control_id, system_key }) => {
    if (systemIntegrationMap.has(system_key)) {
      if (!pendingSystemsMap.has(control_id)) {
        pendingSystemsMap.set(control_id, []);
      }
      const pendingSystems = pendingSystemsMap.get(control_id);
      if (!pendingSystems.includes(system_key)) {
        pendingSystems.push(system_key);
      }
    }
  });

  // Build recommendedIntegrations map: control_id -> [integration_key, ...]
  const recommendedIntegrationsMap = new Map();
  controlSystemMappings.forEach((mapping) => {
    const integrations = systemIntegrationMap.get(mapping.system_key);
    if (integrations && integrations.length > 0) {
      if (!recommendedIntegrationsMap.has(mapping.control_id)) {
        recommendedIntegrationsMap.set(mapping.control_id, []);
      }
      const existing = recommendedIntegrationsMap.get(mapping.control_id);
      integrations.forEach((intKey) => {
        if (!existing.includes(intKey)) {
          existing.push(intKey);
        }
      });
    }
  });

  // Step 8: Gather integration evidence per control
  const integrationEvidenceByControl = new Map();
  const latestIntegrationEvidenceMap = new Map();
  const integrationIdsForEvidence = new Set();

  if (controlIds.length > 0) {
    const integrationEvidenceRecords = await IntegrationEvidence.findAll({
      where: {
        project_id: projectId,
        control_id: {
          [Op.in]: controlIds,
        },
      },
      attributes: [
        "id",
        "integration_id",
        "control_id",
        "status",
        "raw_result",
        "checked_at",
      ],
      order: [["checked_at", "DESC"]],
      raw: true,
    });

    integrationEvidenceRecords.forEach((record) => {
      if (!record.integration_id) {
        return;
      }
      integrationIdsForEvidence.add(record.integration_id);

      if (!integrationEvidenceByControl.has(record.control_id)) {
        integrationEvidenceByControl.set(record.control_id, []);
      }
      integrationEvidenceByControl.get(record.control_id).push(record);

      if (!latestIntegrationEvidenceMap.has(record.control_id)) {
        latestIntegrationEvidenceMap.set(record.control_id, record);
      }
    });
  }

  const integrationById = new Map();
  if (integrationIdsForEvidence.size > 0) {
    const integrationRecords = await Integration.findAll({
      where: {
        id: {
          [Op.in]: Array.from(integrationIdsForEvidence),
        },
      },
      attributes: [
        "id",
        "system_key",
        "integration_key",
        "status",
        "last_synced_at",
        "metadata",
      ],
      raw: true,
    });

    integrationRecords.forEach((integration) => {
      integrationById.set(integration.id, integration);
    });
  }

  // Step 9: Build response
  const controls = projectControls.map((pc) => {
    const control = pc.control;
    const controlId = control.id;
    const hasEvidence = evidencePresenceMap.has(pc.id) || false;
    const relevantSystems = relevantSystemsMap.get(controlId) || [];
    const recommendedSystems = controlSystemsMap.get(controlId) || [];
    const evidenceList = evidenceDetailsMap.get(pc.id) || [];
    const pendingSystems = pendingSystemsMap.get(controlId) || [];
    const automationEvidence =
      integrationEvidenceByControl.get(controlId) || [];
    const latestAutomationRecord =
      latestIntegrationEvidenceMap.get(controlId) || null;
    const machineVerdict = normalizeVerdict(pc.machine_verdict);
    const automationIntegrations = automationEvidence.map((record) => {
      const integration = integrationById.get(record.integration_id) || {};
      return {
        id: record.integration_id,
        name:
          integration.integration_key ||
          integration.system_key ||
          `integration-${record.integration_id}`,
        status: integration.status || record.status || "unknown",
        systemKey: integration.system_key || null,
        detail:
          record.raw_result?.detail ||
          record.raw_result?.summary ||
          record.raw_result?.message ||
          null,
        lastCheckedAt: record.checked_at,
      };
    });

    const automationStatus = (() => {
      if (!control.automatable) return "Manual Only";
      if (automationIntegrations.length > 0) {
        return latestAutomationRecord
          ? "Automation Active"
          : "Automation Configured";
      }
      if (pendingSystems.length > 0) {
        return "Automation Available";
      }
      return "Manual Only";
    })();

    const automationLevel =
      automationStatus === "Manual Only"
        ? "Manual"
        : automationStatus === "Automation Available"
        ? "Partial"
        : "Full";

    const automationResults = latestAutomationRecord
      ? {
          ran: true,
          verdict: formatAutomationVerdict(latestAutomationRecord.status),
          summary:
            latestAutomationRecord.raw_result?.summary ||
            latestAutomationRecord.raw_result?.detail ||
            null,
          timestamp: latestAutomationRecord.checked_at,
        }
      : {
          ran: false,
          verdict: "NO RUN",
          summary: null,
          timestamp: null,
        };

    return {
      id: control.control_key,
      guidance: null,
      title: control.title,
      category: control.category,
      severity: control.severity,
      description: control.description,
      whyItMatters: control.why_it_matters || null,
      automation: automationLevel,
      automationStatus,
      automationIntegrations,
      automationResults,
      integrationCallout: formatIntegrationCallout(pendingSystems[0]),
      status: pc.status || "not_started",
      automatable: Boolean(control.automatable),
      machine_verdict: machineVerdict,
      machineVerdictTone:
        MACHINE_VERDICT_TONES[machineVerdict] ||
        MACHINE_VERDICT_TONES[DEFAULT_VERDICT],
      has_evidence: hasEvidence,
      hasEvidence,
      evidenceCount: evidenceList.length,
      evidence: evidenceList,
      last_checked_at: pc.last_validated_at || null,
      lastCheckedAt: pc.last_validated_at || null,
      relevantSystems: [...new Set(relevantSystems)].sort(),
      recommendedIntegrations: [
        ...new Set(
          recommendedSystems.length
            ? recommendedSystems
            : recommendedIntegrationsMap.get(controlId) || []
        ),
      ].sort(),
    };
  });

  return {
    project: {
      id: project.id,
      name: project.name,
    },
    filtersApplied: {
      status: parsedFilters.status || null,
      category: parsedFilters.category || null,
      severity: parsedFilters.severity || null,
      automatable:
        parsedFilters.automatable !== undefined
          ? parsedFilters.automatable
          : null,
      search: parsedFilters.search || null,
    },
    controls,
    pagination: {
      page: parsedFilters.page,
      pageSize: parsedFilters.pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / parsedFilters.pageSize),
    },
  };
};

export const getProjects = async ({ organization_id }) => {
  const projects = await Project.findAll({
    where: {
      organization_id,
    },
    attributes: ["id", "name"],
    raw: true,
  });
  return projects;
};

export const getProjectControlsStats = async ({
  projectId,
  organization_id,
}) => {
  const projectControls = await ProjectControl.findAll({
    where: {
      project_id: projectId,
    },
    include: [
      {
        model: Control,
        as: "control",
        attributes: [
          "id",
          "control_key",
          "title",
          "category",
          "severity",
          "automatable",
        ],
      },
    ],
  });
  const stats = {
    totalControls: projectControls.length,
    totalControlsAutomated: projectControls.filter(
      (pc) => pc.control.automatable
    ).length,
    totalControlsManual: projectControls.filter((pc) => !pc.control.automatable)
      .length,
    totalControlsPassed: projectControls.filter((pc) => pc.status === "passed")
      .length,
    totalControlsFailed: projectControls.filter((pc) => pc.status === "failed")
      .length,
    totalControlsInProgress: projectControls.filter(
      (pc) => pc.status === "in_progress"
    ).length,
    totalControlsNotStarted: projectControls.filter(
      (pc) => pc.status === "not_started"
    ).length,
  };
  return stats;
};
