import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import associations from "./associations.js";

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import all models
db.Organization = associations.Organization;
db.User = associations.User;
db.Project = associations.Project;
db.SystemUsed = associations.SystemUsed;
db.Integration = associations.Integration;
db.Control = associations.Control;
db.ProjectControl = associations.ProjectControl;
db.Evidence = associations.Evidence;
db.IntegrationEvidence = associations.IntegrationEvidence;
db.Framework = associations.Framework;
db.FrameworkControl = associations.FrameworkControl;
db.ControlMapping = associations.ControlMapping;
db.Audit = associations.Audit;
db.Subscription = associations.Subscription;
db.Policy = associations.Policy;
db.ServiceAccount = associations.ServiceAccount;
db.PrivilegedAccount = associations.PrivilegedAccount;
db.Incident = associations.Incident;
db.BackupRecord = associations.BackupRecord;
db.Vendor = associations.Vendor;
db.Report = associations.Report;
db.AuditLog = associations.AuditLog;
db.SystemCatalog = associations.SystemCatalog;
db.IntegrationCatalog = associations.IntegrationCatalog;
db.ControlSystemMapping = associations.ControlSystemMapping;
db.OnboardingStep = associations.OnboardingStep;

export default db;
