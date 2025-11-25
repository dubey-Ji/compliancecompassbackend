import sequelize from "../config/database.js";
import { Op } from "sequelize";
import Project from "../models/Project.js";
import SystemUsed from "../models/SystemUsed.js";
import SystemCatalog from "../models/SystemCatalog.js";
import Control from "../models/Control.js";
import ControlSystemMapping from "../models/ControlSystemMapping.js";
import ProjectControl from "../models/ProjectControl.js";
import IntegrationCatalog from "../models/IntegrationCatalog.js";
import Integration from "../models/Integration.js";
import AuditLog from "../models/AuditLog.js";
import logger from "../utils/logger.js";
import Organization from "../models/Organization.js";
import OnboardingStep from "../models/OnboardingStep.js";
import * as cache from "../utils/cache.js";
import { STEP_SHORT_LABELS } from "../constant.js";
import User from "../models/User.js";

export const completeOnboarding = async (data) => {
  let {
    organization_id,
    user_id,
    projectName,
    systems = [],
    answers = {},
  } = data;

  // Step 1: Validate Request
  if (!systems || systems.length === 0) {
    throw new Error("systems array is required and must have at least 1 item");
  }

  const systemKeys = systems.map((s) => s.system_key);
  const uniqueSystemKeys = [...new Set(systemKeys)];

  // Validate all system_key values exist in systems_catalog
  const validSystems = await SystemCatalog.findAll({
    where: {
      system_key: {
        [Op.in]: uniqueSystemKeys,
      },
    },
  });

  if (validSystems.length !== uniqueSystemKeys.length) {
    const validKeys = validSystems.map((s) => s.system_key);
    const invalidKeys = uniqueSystemKeys.filter(
      (key) => !validKeys.includes(key)
    );
    throw new Error(
      `Invalid system_key(s): ${invalidKeys.join(
        ", "
      )}. These do not exist in systems_catalog.`
    );
  }

  // Step 2: Start DB Transaction
  const transaction = await sequelize.transaction();

  try {
    // Create a new organization if it doesn't exist

    if (!organization_id) {
      const newOrganization = await Organization.create({
        name: answers.companyName,
        created_by: user_id,
        metadata: {
          companySize: answers.companySize,
          primaryGoal: answers.primaryGoal,
        },
      });
      organization_id = newOrganization.get("id");
      await User.update(
        {
          organization_id: newOrganization.get("id"),
        },
        {
          where: { id: user_id },
          transaction,
        }
      );
    }

    // Step 3: Ensure a Project Exists
    let project = await Project.findOne({
      where: {
        organization_id,
      },
      transaction,
    });

    const projectNameToUse = projectName || "SOC2 Readiness Project";

    if (!project) {
      project = await Project.create(
        {
          organization_id,
          name: projectNameToUse,
          description: "SOC2 Readiness Project",
          owner_user_id: user_id,
        },
        { transaction }
      );
      logger.info(`Created new project: ${project.id}`);
    } else {
      // Update name if different
      if (project.name !== projectNameToUse) {
        await project.update({ name: projectNameToUse }, { transaction });
      }
      logger.info(`Using existing project: ${project.id}`);
    }

    // Step 4: Upsert Systems Used
    const upsertedSystems = [];
    for (const system of systems) {
      const [systemUsed, created] = await SystemUsed.findOrCreate({
        where: {
          organization_id,
          system_key: system.system_key,
        },
        defaults: {
          organization_id,
          system_key: system.system_key,
          display_name: system.display_name || system.system_key,
          value: system.value || {},
        },
        transaction,
      });

      // Update if changed
      if (!created) {
        const needsUpdate =
          systemUsed.display_name !==
            (system.display_name || system.system_key) ||
          JSON.stringify(systemUsed.value) !==
            JSON.stringify(system.value || {});

        if (needsUpdate) {
          await systemUsed.update(
            {
              display_name: system.display_name || system.system_key,
              value: system.value || {},
            },
            { transaction }
          );
        }
      }

      upsertedSystems.push(systemUsed);
    }

    // Step 5: Determine Selected System Keys
    const selectedSystemKeys = uniqueSystemKeys;

    // Step 6: Determine In-Scope Controls
    // Step 6A: Controls mapped to these systems
    const mappedControls = await ControlSystemMapping.findAll({
      where: {
        system_key: {
          [Op.in]: selectedSystemKeys,
        },
      },
      attributes: ["control_id"],
      raw: true,
      transaction,
    });

    const mappedControlIds = [
      ...new Set(mappedControls.map((mc) => mc.control_id)),
    ];

    // Step 6B: Global controls (controls with no mapping)
    const allControls = await Control.findAll({
      attributes: ["id"],
      raw: true,
      transaction,
    });

    const allControlIds = allControls.map((c) => c.id);
    const allMappedControls = await ControlSystemMapping.findAll({
      attributes: ["control_id"],
      raw: true,
      transaction,
    });
    const allMappedControlIds = [
      ...new Set(allMappedControls.map((m) => m.control_id)),
    ];

    const globalControlIds = allControlIds.filter(
      (id) => !allMappedControlIds.includes(id)
    );

    // Step 6C: Final In-Scope Control List
    const inScopeControlIds = [
      ...new Set([...mappedControlIds, ...globalControlIds]),
    ];

    if (inScopeControlIds.length === 0) {
      // Fallback: include all controls
      logger.warn("No in-scope controls found, falling back to all controls");
      const allControlsFallback = await Control.findAll({
        attributes: ["id"],
        raw: true,
        transaction,
      });
      inScopeControlIds.push(...allControlsFallback.map((c) => c.id));
    }

    // Step 7: Create Project Controls
    for (const controlId of inScopeControlIds) {
      await ProjectControl.findOrCreate({
        where: {
          project_id: project.id,
          control_id: controlId,
        },
        defaults: {
          project_id: project.id,
          control_id: controlId,
          status: "not_started",
        },
        transaction,
      });
    }

    const controlsCount = await ProjectControl.count({
      where: {
        project_id: project.id,
      },
      transaction,
    });

    // Step 8: Determine Automatable Controls Count
    // A control is automatable if:
    // 1. The control itself is automatable = true
    // 2. AND it has at least one control_system_mapping entry where system_key ∈ selected systems
    const automatableControlIds = await Control.findAll({
      where: {
        id: {
          [Op.in]: inScopeControlIds,
        },
        automatable: true,
      },
      attributes: ["id"],
      raw: true,
      transaction,
    });

    const automatableControlIdSet = new Set(
      automatableControlIds.map((c) => c.id)
    );

    const relevantMappings = await ControlSystemMapping.findAll({
      where: {
        control_id: {
          [Op.in]: Array.from(automatableControlIdSet),
        },
        system_key: {
          [Op.in]: selectedSystemKeys,
        },
      },
      attributes: ["control_id"],
      raw: true,
      transaction,
    });

    const automatableCount = new Set(relevantMappings.map((m) => m.control_id))
      .size;

    // Step 9: Recommend Integrations
    const recommendedIntegrations = await IntegrationCatalog.findAll({
      where: {
        system_key: {
          [Op.in]: selectedSystemKeys,
        },
        supports_automated_checks: true,
      },
      attributes: ["integration_key", "display_name", "system_key"],
      transaction,
    });

    // Exclude already connected integrations
    const connectedIntegrations = await Integration.findAll({
      where: {
        organization_id,
        integration_key: {
          [Op.in]: recommendedIntegrations.map((ri) => ri.integration_key),
        },
      },
      attributes: ["integration_key"],
      raw: true,
      transaction,
    });

    const connectedIntegrationKeys = connectedIntegrations.map(
      (ci) => ci.integration_key
    );

    const finalRecommendedIntegrations = recommendedIntegrations
      .filter((ri) => !connectedIntegrationKeys.includes(ri.integration_key))
      .map((ri) => ({
        integration_key: ri.integration_key,
        display_name: ri.display_name,
        system_key: ri.system_key,
      }));

    // Step 10: Save Audit Log
    await AuditLog.create(
      {
        organization_id,
        user_id,
        action: "onboarding_completed",
        object_type: "project",
        object_id: project.id,
        metadata: {
          systems: selectedSystemKeys,
          answers,
        },
      },
      { transaction }
    );

    // Step 11: Commit Transaction
    await transaction.commit();

    return {
      projectId: project.id,
      projectName: project.name,
      controlsCount,
      automatableCount,
      recommendedIntegrations: finalRecommendedIntegrations,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error("Onboarding completion error:", error);
    throw error;
  }
};

export const startOnboarding = async (data) => {
  const { user_id, organization_id, minimal = false } = data;

  try {
    // Step 2: Load (cacheable) onboarding configuration
    const cacheKey = "onboarding_steps_v1";
    let onboardingSteps = await cache.get("onboarding", cacheKey);

    if (!onboardingSteps) {
      onboardingSteps = await OnboardingStep.findAll({
        attributes: [
          "id",
          "title",
          "question",
          "options",
          "step_order",
          "help_text",
        ],
        order: [["step_order", "ASC"]],
        raw: true,
      });
      // Cache for 1 hour (3600 seconds)
      await cache.set("onboarding", cacheKey, onboardingSteps, 3600);
      logger.info("Onboarding steps loaded from DB and cached");
    }

    // Cache systems_catalog
    const systemsCatalogKey = "systems_catalog_v1";
    let systemsCatalog = await cache.get("catalog", systemsCatalogKey);

    if (!systemsCatalog) {
      systemsCatalog = await SystemCatalog.findAll({
        attributes: ["system_key", "display_name", "ui_icon", "properties"],
        raw: true,
      });
      // Cache for 1 hour (3600 seconds)
      await cache.set("catalog", systemsCatalogKey, systemsCatalog, 3600);
      logger.info("Systems catalog loaded from DB and cached");
    }

    // Create a map for quick lookup
    const systemsCatalogMap = new Map(
      systemsCatalog.map((sc) => [sc.system_key, sc])
    );

    // Step 3: Fetch optional org-level metadata
    let organization = null;
    let existingSystems = [];
    let connectedIntegrations = [];
    let recommendedIntegrations = [];

    if (organization_id) {
      organization = await Organization.findByPk(organization_id, {
        attributes: ["id", "name", "subdomain", "metadata", "created_at"],
        raw: true,
      });

      if (!organization) {
        logger.warn(
          `Organization ${organization_id} not found for user ${user_id}, treating as null`
        );
      } else {
        // Fetch systems_used
        const systemsUsed = await SystemUsed.findAll({
          where: { organization_id },
          attributes: [
            "id",
            "system_key",
            "display_name",
            "value",
            "created_at",
          ],
          raw: true,
        });

        existingSystems = systemsUsed.map((su) => ({
          id: su.id,
          system_key: su.system_key,
          display_name: su.display_name,
          configured: su.value !== null && JSON.stringify(su.value) !== "{}",
          added_at: su.created_at,
        }));

        // Fetch connected integrations
        const integrations = await Integration.findAll({
          where: { organization_id },
          attributes: ["integration_key", "status", "last_synced_at"],
          raw: true,
        });

        // Enrich with display_name from catalog
        const integrationKeys = integrations.map((i) => i.integration_key);
        const integrationCatalogEntries = await IntegrationCatalog.findAll({
          where: {
            integration_key: {
              [Op.in]: integrationKeys,
            },
          },
          attributes: ["integration_key", "display_name"],
          raw: true,
        });

        const integrationCatalogMap = new Map(
          integrationCatalogEntries.map((ic) => [ic.integration_key, ic])
        );

        connectedIntegrations = integrations.map((int) => ({
          integration_key: int.integration_key,
          display_name:
            integrationCatalogMap.get(int.integration_key)?.display_name ||
            int.integration_key,
          status: int.status,
          last_synced_at: int.last_synced_at,
        }));

        // Step 6: Compose recommendedIntegrations
        const systemKeysFromUsed = existingSystems.map((es) => es.system_key);
        if (systemKeysFromUsed.length > 0) {
          const recommended = await IntegrationCatalog.findAll({
            where: {
              system_key: {
                [Op.in]: systemKeysFromUsed,
              },
              supports_automated_checks: true,
            },
            attributes: [
              "integration_key",
              "display_name",
              "supports_automated_checks",
            ],
            raw: true,
          });

          // Exclude already connected
          const connectedKeys = new Set(
            connectedIntegrations.map((ci) => ci.integration_key)
          );

          recommendedIntegrations = recommended
            .filter((r) => !connectedKeys.has(r.integration_key))
            .map((r) => ({
              integration_key: r.integration_key,
              display_name: r.display_name,
              supports_automated_checks: r.supports_automated_checks,
            }))
            .sort((a, b) => {
              // Simple heuristic: recommended flag (if available) then by name
              return a.display_name.localeCompare(b.display_name);
            });
        }
      }
    }

    // Step 4: Build UI-friendly onboardingSteps objects
    const enrichedSteps = onboardingSteps.map((step) => {
      if (minimal) {
        return {
          id: step.id,
          title: step.title,
          step_order: step.step_order,
        };
      }

      // Enrich options with catalog data
      const enrichedOptions = (step.options || []).map((option) => {
        const optionKey = option.key || option.system_key || option.value;
        const catalogEntry = systemsCatalogMap.get(optionKey);

        return {
          key: optionKey,
          label: option.label || catalogEntry?.display_name || optionKey,
          hint: option.hint || catalogEntry?.properties?.hint || null,
          icon: option.icon || catalogEntry?.ui_icon || null,
          meta: option.meta || null,
        };
      });

      const shortLabel = STEP_SHORT_LABELS[step.id] || step.title.split(" ")[0];
      return {
        id: step.id,
        shortLabel,
        title: step.title,
        question: step.question,
        options: enrichedOptions,
        step_order: step.step_order,
        help_text: step.help_text || null,
      };
    });

    // Step 7: Compute progress object
    let progress = { status: "not_started" };

    if (organization) {
      // Find primary project
      const primaryProject = await Project.findOne({
        where: { organization_id },
        attributes: ["id"],
        raw: true,
      });

      if (primaryProject) {
        const controlsCount = await ProjectControl.count({
          where: { project_id: primaryProject.id },
        });

        if (controlsCount > 0) {
          const passedCount = await ProjectControl.count({
            where: {
              project_id: primaryProject.id,
              status: "passed",
            },
          });

          const readinessPercent = Math.round(
            (passedCount / controlsCount) * 100
          );

          progress = {
            status: "in_progress",
            controlsCount,
            passedCount,
            readinessPercent,
          };
        }
      }
    }

    // Step 8: Audit & analytics
    await AuditLog.create({
      organization_id: organization?.id || null,
      user_id,
      action: "onboarding_started",
      metadata: {
        source: "web",
        minimal,
      },
    });

    // Emit telemetry event (placeholder - implement with Mixpanel/Segment)
    logger.info("Telemetry: onboarding_started", {
      userId: user_id,
      orgExists: !!organization,
      stepCount: enrichedSteps.length,
    });

    // Build response
    return {
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
            subdomain: organization.subdomain,
          }
        : null,
      project: null, // As per requirements
      onboardingSteps: enrichedSteps,
      existingSystems,
      connectedIntegrations,
      recommendedIntegrations,
      progress,
    };
  } catch (error) {
    logger.error("Onboarding start error:", error);
    throw error;
  }
};
