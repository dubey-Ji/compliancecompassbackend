import Organization from './Organization.js';
import User from './User.js';
import Project from './Project.js';
import SystemUsed from './SystemUsed.js';
import Integration from './Integration.js';
import Control from './Control.js';
import ProjectControl from './ProjectControl.js';
import Evidence from './Evidence.js';
import IntegrationEvidence from './IntegrationEvidence.js';
import Framework from './Framework.js';
import FrameworkControl from './FrameworkControl.js';
import ControlMapping from './ControlMapping.js';
import Audit from './Audit.js';
import Subscription from './Subscription.js';
import Policy from './Policy.js';
import ServiceAccount from './ServiceAccount.js';
import PrivilegedAccount from './PrivilegedAccount.js';
import Incident from './Incident.js';
import BackupRecord from './BackupRecord.js';
import Vendor from './Vendor.js';
import Report from './Report.js';
import AuditLog from './AuditLog.js';
import SystemCatalog from './SystemCatalog.js';
import IntegrationCatalog from './IntegrationCatalog.js';
import ControlSystemMapping from './ControlSystemMapping.js';
import OnboardingStep from './OnboardingStep.js';

// Organization associations
Organization.hasMany(User, { foreignKey: 'organization_id', as: 'users' });
Organization.hasMany(Project, { foreignKey: 'organization_id', as: 'projects' });
Organization.hasMany(SystemUsed, { foreignKey: 'organization_id', as: 'systemsUsed' });
Organization.hasMany(Integration, { foreignKey: 'organization_id', as: 'integrations' });
Organization.hasMany(Audit, { foreignKey: 'organization_id', as: 'audits' });
Organization.hasMany(Subscription, { foreignKey: 'organization_id', as: 'subscriptions' });
Organization.hasMany(Policy, { foreignKey: 'organization_id', as: 'policies' });
Organization.hasMany(ServiceAccount, { foreignKey: 'organization_id', as: 'serviceAccounts' });
Organization.hasMany(PrivilegedAccount, { foreignKey: 'organization_id', as: 'privilegedAccounts' });
Organization.hasMany(Incident, { foreignKey: 'organization_id', as: 'incidents' });
Organization.hasMany(BackupRecord, { foreignKey: 'organization_id', as: 'backupRecords' });
Organization.hasMany(Vendor, { foreignKey: 'organization_id', as: 'vendors' });
Organization.hasMany(AuditLog, { foreignKey: 'organization_id', as: 'auditLogs' });
Organization.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Project.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
SystemUsed.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Integration.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Audit.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Subscription.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Policy.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
ServiceAccount.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
PrivilegedAccount.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Incident.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
BackupRecord.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Vendor.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
AuditLog.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// Project associations
Project.hasMany(ProjectControl, { foreignKey: 'project_id', as: 'projectControls' });
Project.hasMany(IntegrationEvidence, { foreignKey: 'project_id', as: 'integrationEvidence' });
Project.hasMany(Policy, { foreignKey: 'project_id', as: 'policies' });
Project.hasMany(Incident, { foreignKey: 'project_id', as: 'incidents' });
Project.hasMany(BackupRecord, { foreignKey: 'project_id', as: 'backupRecords' });
Project.hasMany(Report, { foreignKey: 'project_id', as: 'reports' });
Project.belongsTo(User, { foreignKey: 'owner_user_id', as: 'owner' });

ProjectControl.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
IntegrationEvidence.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Policy.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Incident.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
BackupRecord.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Report.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Control associations
Control.hasMany(ProjectControl, { foreignKey: 'control_id', as: 'projectControls' });
Control.hasMany(IntegrationEvidence, { foreignKey: 'control_id', as: 'integrationEvidence' });
Control.hasMany(ControlMapping, { foreignKey: 'control_id', as: 'controlMappings' });
Control.hasMany(ControlSystemMapping, { foreignKey: 'control_id', as: 'systemMappings' });

ProjectControl.belongsTo(Control, { foreignKey: 'control_id', as: 'control' });
IntegrationEvidence.belongsTo(Control, { foreignKey: 'control_id', as: 'control' });
ControlMapping.belongsTo(Control, { foreignKey: 'control_id', as: 'control' });
ControlSystemMapping.belongsTo(Control, { foreignKey: 'control_id', as: 'control' });
ProjectControl.belongsTo(User, { foreignKey: 'owner_user_id', as: 'owner' });

// ProjectControl associations
ProjectControl.hasMany(Evidence, { foreignKey: 'project_control_id', as: 'evidence' });
Evidence.belongsTo(ProjectControl, { foreignKey: 'project_control_id', as: 'projectControl' });
Evidence.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Integration associations
Integration.hasMany(IntegrationEvidence, { foreignKey: 'integration_id', as: 'integrationEvidence' });
Integration.hasMany(SystemUsed, { foreignKey: 'connected_integration_id', as: 'systemsUsed' });
IntegrationEvidence.belongsTo(Integration, { foreignKey: 'integration_id', as: 'integration' });
SystemUsed.belongsTo(Integration, { foreignKey: 'connected_integration_id', as: 'connectedIntegration' });
Integration.belongsTo(IntegrationCatalog, { foreignKey: 'integration_key', as: 'integrationCatalog' });
IntegrationCatalog.hasMany(Integration, { foreignKey: 'integration_key', as: 'integrations' });
SystemCatalog.hasMany(IntegrationCatalog, { foreignKey: 'system_key', as: 'integrationCatalogs' });
IntegrationCatalog.belongsTo(SystemCatalog, { foreignKey: 'system_key', as: 'systemCatalog' });
SystemCatalog.hasMany(ControlSystemMapping, { foreignKey: 'system_key', as: 'controlSystemMappings' });
ControlSystemMapping.belongsTo(SystemCatalog, { foreignKey: 'system_key', as: 'systemCatalog' });
IntegrationCatalog.hasMany(ControlSystemMapping, { foreignKey: 'integration_key', as: 'controlSystemMappings' });
ControlSystemMapping.belongsTo(IntegrationCatalog, { foreignKey: 'integration_key', as: 'integrationCatalog' });

// Framework associations
Framework.hasMany(FrameworkControl, { foreignKey: 'framework_id', as: 'frameworkControls' });
Framework.hasMany(Audit, { foreignKey: 'framework_id', as: 'audits' });

FrameworkControl.belongsTo(Framework, { foreignKey: 'framework_id', as: 'framework' });
Audit.belongsTo(Framework, { foreignKey: 'framework_id', as: 'framework' });

// FrameworkControl associations
FrameworkControl.hasMany(ControlMapping, { foreignKey: 'framework_control_id', as: 'controlMappings' });
ControlMapping.belongsTo(FrameworkControl, { foreignKey: 'framework_control_id', as: 'frameworkControl' });

// User associations
User.hasMany(Organization, { foreignKey: 'created_by', as: 'createdOrganizations' });
User.hasMany(Project, { foreignKey: 'owner_user_id', as: 'ownedProjects' });
User.hasMany(ProjectControl, { foreignKey: 'owner_user_id', as: 'ownedProjectControls' });
User.hasMany(Evidence, { foreignKey: 'uploaded_by', as: 'uploadedEvidence' });
User.hasMany(Report, { foreignKey: 'generated_by', as: 'generatedReports' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });

// PrivilegedAccount associations
PrivilegedAccount.belongsTo(Evidence, { foreignKey: 'evidence_id', as: 'evidence' });

// Report associations
Report.belongsTo(User, { foreignKey: 'generated_by', as: 'generator' });

export default {
  Organization,
  User,
  Project,
  SystemUsed,
  Integration,
  Control,
  ProjectControl,
  Evidence,
  IntegrationEvidence,
  Framework,
  FrameworkControl,
  ControlMapping,
  Audit,
  Subscription,
  Policy,
  ServiceAccount,
  PrivilegedAccount,
  Incident,
  BackupRecord,
  Vendor,
  Report,
  AuditLog,
  SystemCatalog,
  IntegrationCatalog,
  ControlSystemMapping,
  OnboardingStep,
};

