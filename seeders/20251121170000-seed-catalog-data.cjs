"use strict";

const { randomUUID } = require("crypto");
const { Op } = require("sequelize");

const systemsCatalogData = [
  {
    system_key: "google_workspace",
    display_name: "Google Workspace",
    category: "identity",
    description: "Company email and directory (G Suite / Workspace)",
  },
  {
    system_key: "azure_ad",
    display_name: "Microsoft 365 / Azure AD",
    category: "identity",
    description: "Azure Active Directory / Office 365 identities",
  },
  {
    system_key: "okta",
    display_name: "Okta",
    category: "identity",
    description: "Enterprise identity provider",
  },
  {
    system_key: "github",
    display_name: "GitHub",
    category: "vcs",
    description: "Source code hosting & org-level controls",
  },
  {
    system_key: "gitlab",
    display_name: "GitLab",
    category: "vcs",
    description: "Source code hosting & CI",
  },
  {
    system_key: "aws",
    display_name: "AWS",
    category: "cloud",
    description: "Amazon Web Services (compute, storage, IAM)",
  },
  {
    system_key: "gcp",
    display_name: "Google Cloud (GCP)",
    category: "cloud",
    description: "Google Cloud Platform (compute, storage, IAM)",
  },
  {
    system_key: "azure",
    display_name: "Microsoft Azure",
    category: "cloud",
    description: "Azure cloud platform",
  },
  {
    system_key: "s3",
    display_name: "S3 / Object Storage",
    category: "storage",
    description: "S3 or compatible object storage",
  },
  {
    system_key: "postgres",
    display_name: "Postgres (RDS, CloudSQL)",
    category: "database",
    description: "Relational DB for customer data",
  },
  {
    system_key: "mysql",
    display_name: "MySQL",
    category: "database",
    description: "Relational DB",
  },
  {
    system_key: "mongodb",
    display_name: "MongoDB Atlas",
    category: "database",
    description: "NoSQL document DB",
  },
  {
    system_key: "jira",
    display_name: "Jira",
    category: "ticketing",
    description: "Issue & change ticketing system",
  },
  {
    system_key: "datadog",
    display_name: "Datadog",
    category: "monitoring",
    description: "Logs, metrics, tracing and alerts",
  },
  {
    system_key: "sentry",
    display_name: "Sentry",
    category: "monitoring",
    description: "Error tracking and monitoring",
  },
  {
    system_key: "circleci",
    display_name: "CircleCI",
    category: "ci",
    description: "CI/CD provider",
  },
  {
    system_key: "github_actions",
    display_name: "GitHub Actions",
    category: "ci",
    description: "CI/CD via GitHub Actions",
  },
  {
    system_key: "vercel",
    display_name: "Vercel / Netlify",
    category: "platform",
    description: "Serverless / frontend hosting",
  },
  {
    system_key: "slack",
    display_name: "Slack",
    category: "collaboration",
    description: "Team communication",
  },
  {
    system_key: "stripe",
    display_name: "Stripe",
    category: "payments",
    description: "Payment processor",
  },
];

const integrationsCatalogData = [
  {
    system_key: "github",
    integration_key: "github",
    display_name: "GitHub",
    supports_automated_checks: true,
    required_scopes: ["read:org", "repo", "workflow"],
    auth_type: "oauth",
    description: "Check PR-based change management, branch protection, and CI status.",
    recommended: true,
  },
  {
    system_key: "google_workspace",
    integration_key: "google_workspace",
    display_name: "Google Workspace",
    supports_automated_checks: true,
    description: "User directory, 2-step enforcement, admin roles",
  },
  {
    system_key: "aws",
    integration_key: "aws",
    display_name: "AWS",
    supports_automated_checks: true,
    description: "IAM roles, RDS encryption, CloudWatch logs checks",
  },
  {
    system_key: "jira",
    integration_key: "jira",
    display_name: "Jira",
    supports_automated_checks: true,
    description: "Ticket fetch for access requests and incident tracking",
  },
  {
    system_key: "okta",
    integration_key: "okta",
    display_name: "Okta",
    supports_automated_checks: true,
    description: "Provisioning logs, group membership",
  },
  {
    system_key: "datadog",
    integration_key: "datadog",
    display_name: "Datadog",
    supports_automated_checks: true,
    description: "Log streams, alert rules",
  },
  {
    system_key: "sentry",
    integration_key: "sentry",
    display_name: "Sentry",
    supports_automated_checks: false,
    description: "Error monitoring (evidence via exports/screenshots)",
  },
  {
    system_key: "gitlab",
    integration_key: "gitlab",
    display_name: "GitLab",
    supports_automated_checks: true,
    description: "Repo protection and CI checks",
  },
  {
    system_key: "circleci",
    integration_key: "circleci",
    display_name: "CircleCI",
    supports_automated_checks: false,
    description: "CI evidence via job history",
  },
  {
    system_key: "gcp",
    integration_key: "gcp",
    display_name: "GCP",
    supports_automated_checks: true,
    description: "GCP IAM, Cloud Logging, storage settings",
  },
];

const controlsData = [
  {
    control_key: "CC6.1",
    title: "User Provisioning Approval",
    category: "Access Control",
    description: "All access is approved before being granted.",
    severity: "High",
    evidence_type: "Ticket/Log",
    evidence_examples: [
      "Access request ticket with approval",
      "IdP provisioning log showing approver",
    ],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Approval recorded before provisioning",
      user_instruction:
        "Upload an access request ticket showing manager approval or connect Jira/IdP.",
      good_examples: [
        "Jira ticket with approval",
        "Okta provisioning workflow",
      ],
      bad_examples: ["Login screen", "User list without approval evidence"],
    },
  },
  {
    control_key: "CC6.2",
    title: "MFA Enforcement",
    category: "Access Control",
    description: "MFA is enforced on admin and critical systems.",
    severity: "High",
    evidence_type: "Screenshot/API",
    evidence_examples: [
      "IdP MFA settings screenshot",
      "GitHub 'members without 2FA' query",
    ],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "MFA required for privileged accounts",
      user_instruction:
        "Upload IdP MFA enforcement screenshot or connect integration for auto-check.",
      good_examples: [
        "Google Admin MFA enforcement",
        "GitHub no-2fa members empty",
      ],
      bad_examples: ["Login screen only"],
    },
  },
  {
    control_key: "CC6.3",
    title: "Least Privilege",
    category: "Access Control",
    description: "Roles provide least-privilege access to systems.",
    severity: "High",
    evidence_type: "Document+Export",
    evidence_examples: [
      "Role-to-permission matrix",
      "CSV export of users and assigned roles",
    ],
    frequency: "Annual",
    automatable: true,
    guidance: {
      auditor_expectation: "Documented roles and permission mappings",
      user_instruction:
        "Upload role matrix or connect systems to export role lists.",
      good_examples: ["Role matrix CSV", "IAM role screenshot"],
      bad_examples: ["No role documentation", "Everyone is admin"],
    },
  },
  {
    control_key: "CC6.4",
    title: "Periodic Access Review",
    category: "Access Control",
    description:
      "Periodic reviews are performed to confirm users still require access.",
    severity: "High",
    evidence_type: "Report/Ticket",
    evidence_examples: [
      "Access review report",
      "Jira ticket for access review",
    ],
    frequency: "Quarterly",
    automatable: true,
    guidance: {
      auditor_expectation: "Regular access reviews with approvals",
      user_instruction:
        "Upload latest access review report or screenshot of review ticket.",
      good_examples: [
        "Spreadsheet with reviewer sign-off",
        "Jira completed review ticket",
      ],
      bad_examples: ["Ad-hoc notes with no reviewer"],
    },
  },
  {
    control_key: "CC6.5",
    title: "Privileged Accounts Tracking",
    category: "Access Control",
    description: "Privileged/admin accounts are identified and tracked.",
    severity: "High",
    evidence_type: "Export/Document",
    evidence_examples: [
      "Admin user list with justification",
      "Admin policy document",
    ],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "List of privileged accounts and justification",
      user_instruction:
        "Upload admin accounts export or connect integration to fetch admin list.",
      good_examples: [
        "Google Workspace super admin export",
        "AWS IAM admin user list",
      ],
      bad_examples: ["Unjustified admin proliferation"],
    },
  },
  {
    control_key: "CC6.6",
    title: "Service Accounts Management",
    category: "Access Control",
    description: "Service accounts are inventoried, scoped, and monitored.",
    severity: "High",
    evidence_type: "Inventory/Document",
    evidence_examples: [
      "Service account inventory CSV",
      "Service account policy",
    ],
    frequency: "Quarterly",
    automatable: true,
    guidance: {
      auditor_expectation:
        "Documented service accounts with purpose & permissions",
      user_instruction:
        "Upload service account inventory or connect cloud integrations.",
      good_examples: ["GCP service account exports", "GitHub app listings"],
      bad_examples: ["Service account keys with no rotation plan"],
    },
  },
  {
    control_key: "CC7.1",
    title: "Logging Enabled",
    category: "System Operations",
    description:
      "Application and infrastructure logs are enabled and retained.",
    severity: "High",
    evidence_type: "Screenshot/Export",
    evidence_examples: [
      "CloudWatch log group list",
      "Datadog log stream screenshot",
    ],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation:
        "Logs capture security-relevant events and are retained",
      user_instruction:
        "Upload logging configuration screenshot or connect logging integration.",
      good_examples: [
        "CloudWatch log groups with retention set",
        "Datadog logs showing app events",
      ],
      bad_examples: ["No logs for production services"],
    },
  },
  {
    control_key: "CC7.2",
    title: "Monitoring & Alerting",
    category: "System Operations",
    description:
      "Monitoring and alerting exist for critical production issues.",
    severity: "High",
    evidence_type: "Screenshot/Policy",
    evidence_examples: ["Alerting rule screenshot", "Incident alert history"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation:
        "Alerts configured for availability and security incidents",
      user_instruction:
        "Upload alert rule screenshots or connect monitoring tool.",
      good_examples: ["PagerDuty escalation policy", "CloudWatch alarm config"],
      bad_examples: ["No alerts configured"],
    },
  },
  {
    control_key: "CC7.3",
    title: "Log Retention & Integrity",
    category: "System Operations",
    description: "Logs are retained and protected from tampering.",
    severity: "Medium",
    evidence_type: "Config/Doc",
    evidence_examples: ["Retention policy screenshot", "WORM/config settings"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Retention policy and protections in place",
      user_instruction:
        "Upload log retention policy or logging config screenshot.",
      good_examples: [
        "S3 bucket lifecycle rules for logs",
        "CloudWatch retention set",
      ],
      bad_examples: ["Logs stored in unprotected locations"],
    },
  },
  {
    control_key: "CC7.4",
    title: "Change Detection & Alerting",
    category: "System Operations",
    description: "Detect and alert on unauthorized configuration changes.",
    severity: "Medium",
    evidence_type: "Policy/Screenshot",
    evidence_examples: [
      "Config change alert screenshot",
      "Change detection rule",
    ],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Mechanisms detect and alert on configuration drift",
      user_instruction:
        "Upload detection rules or connect change-detection integration.",
      good_examples: [
        "AWS Config rule alerts",
        "Datadog config change monitors",
      ],
      bad_examples: ["No detection capability"],
    },
  },
  {
    control_key: "CC7.5",
    title: "Secure Logging Access",
    category: "System Operations",
    description: "Access to logs is restricted to authorized personnel.",
    severity: "Medium",
    evidence_type: "Export/Policy",
    evidence_examples: [
      "Access control list for logs",
      "IAM policy showing log access",
    ],
    frequency: "Annual",
    automatable: true,
    guidance: {
      auditor_expectation: "Only authorized roles can view logs",
      user_instruction:
        "Upload IAM policy screenshot or export showing log access roles.",
      good_examples: ["Role-based access list for CloudWatch"],
      bad_examples: ["All users have log-viewing permissions"],
    },
  },
  {
    control_key: "CC7.6",
    title: "Vulnerability Management",
    category: "System Operations",
    description: "Use vulnerability scanning and remediate findings.",
    severity: "High",
    evidence_type: "Scan Reports",
    evidence_examples: ["Snyk report", "Dependency scan export"],
    frequency: "Monthly",
    automatable: true,
    guidance: {
      auditor_expectation: "Regular scanning and tracked remediation",
      user_instruction:
        "Upload recent scan report or connect Snyk/GitHub dependabot.",
      good_examples: [
        "Snyk project report with issues triaged",
        "Dependabot PRs",
      ],
      bad_examples: ["No scanning at all"],
    },
  },
  {
    control_key: "CC8.1",
    title: "Change Approval (PR Reviews)",
    category: "Change Management",
    description:
      "All production code changes require review/approval before merge.",
    severity: "High",
    evidence_type: "Repo Config/Export",
    evidence_examples: ["Branch protection rules", "PR review history"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Branch protection and required reviews enforced",
      user_instruction:
        "Upload branch protection screenshot or connect GitHub to verify.",
      good_examples: ["Protected main branch with required reviewers"],
      bad_examples: ["No branch protection"],
    },
  },
  {
    control_key: "CC8.2",
    title: "Change Testing & Rollback",
    category: "Change Management",
    description: "Changes are tested and rollback procedures exist.",
    severity: "High",
    evidence_type: "Runbook/Doc",
    evidence_examples: ["Rollback procedure document", "Test run logs"],
    frequency: "Per release",
    automatable: false,
    guidance: {
      auditor_expectation: "Documented test & rollback procedures",
      user_instruction: "Upload rollback runbook and sample test logs.",
      good_examples: ["Playbook for rollback tested in staging"],
      bad_examples: ["No rollback guidance"],
    },
  },
  {
    control_key: "CC8.3",
    title: "Separation of Environments",
    category: "Change Management",
    description:
      "Development, staging, and production environments are separated.",
    severity: "Medium",
    evidence_type: "Architecture Diagram/Config",
    evidence_examples: ["Network diagram", "Environment config"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Clear separation with access controls",
      user_instruction: "Upload architecture diagram showing env separation.",
      good_examples: ["VPCs/subnets per environment"],
      bad_examples: ["Shared production/staging resources"],
    },
  },
  {
    control_key: "CC8.4",
    title: "Deployment Approvals",
    category: "Change Management",
    description:
      "Deployments to production require authorization and tracking.",
    severity: "High",
    evidence_type: "Ticket/Log",
    evidence_examples: [
      "Deployment ticket with approver",
      "CI/CD run with approver",
    ],
    frequency: "Per release",
    automatable: true,
    guidance: {
      auditor_expectation: "Approvals recorded before prod deployments",
      user_instruction:
        "Upload deployment approval ticket or connect CI/CD integration.",
      good_examples: ["CI job requiring manual approval"],
      bad_examples: ["Manual untracked deploys"],
    },
  },
  {
    control_key: "CC8.5",
    title: "Build Integrity",
    category: "Change Management",
    description:
      "Builds are reproducible and integrity of artifacts is protected.",
    severity: "Medium",
    evidence_type: "Config/Doc",
    evidence_examples: ["Artifact storage config", "signed artifacts"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation:
        "Protected artifact storage and verified build processes",
      user_instruction: "Upload artifact storage config or build attestations.",
      good_examples: ["Artifacts signed and stored in secured registry"],
      bad_examples: ["Artifacts in public buckets"],
    },
  },
  {
    control_key: "CC9.1",
    title: "Backup Configuration",
    category: "Backup & Recovery",
    description: "Backups are configured for production data stores.",
    severity: "High",
    evidence_type: "Config/Export",
    evidence_examples: ["RDS automated backup config", "S3 backup lifecycle"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Automated backups with retention policies",
      user_instruction:
        "Upload backup config screenshot or connect cloud provider.",
      good_examples: ["RDS automated backups enabled"],
      bad_examples: ["No backups configured"],
    },
  },
  {
    control_key: "CC9.2",
    title: "Restore Testing",
    category: "Backup & Recovery",
    description: "Backups are periodically restored to verify recoverability.",
    severity: "High",
    evidence_type: "Test Report",
    evidence_examples: ["Restore test report", "restore runbook"],
    frequency: "Annually",
    automatable: false,
    guidance: {
      auditor_expectation: "Proven ability to restore from backups",
      user_instruction: "Upload restore test report or runbook.",
      good_examples: ["Successful restore test with timestamps"],
      bad_examples: ["No evidence of restore testing"],
    },
  },
  {
    control_key: "CC9.3",
    title: "Backup Encryption",
    category: "Backup & Recovery",
    description: "Backups are encrypted in transit and at rest.",
    severity: "Medium",
    evidence_type: "Config/Doc",
    evidence_examples: ["Encryption config", "KMS key usage"],
    frequency: "Annual",
    automatable: true,
    guidance: {
      auditor_expectation: "Backups encrypted with approved mechanisms",
      user_instruction: "Upload backup encryption config or connect provider.",
      good_examples: ["RDS snapshots encrypted with KMS"],
      bad_examples: ["Unencrypted backup storage"],
    },
  },
  {
    control_key: "CC10.1",
    title: "Incident Response Plan",
    category: "Incident Management",
    description:
      "A documented incident response plan exists and is maintained.",
    severity: "High",
    evidence_type: "Policy/Playbook",
    evidence_examples: ["Incident response playbook", "contact list"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Documented IR plan with roles and processes",
      user_instruction: "Upload incident response playbook.",
      good_examples: ["IR runbook with contact matrix"],
      bad_examples: ["Unclear responsibilities"],
    },
  },
  {
    control_key: "CC10.2",
    title: "Incident Logging & Triage",
    category: "Incident Management",
    description: "Incidents are logged, triaged, and tracked to resolution.",
    severity: "High",
    evidence_type: "Ticket/Export",
    evidence_examples: ["Incident tickets", "triage logs"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Incident lifecycle recorded and reviewed",
      user_instruction: "Upload incident tickets or connect Jira.",
      good_examples: ["Jira incident workflow with SLA"],
      bad_examples: ["No incident tracking"],
    },
  },
  {
    control_key: "CC10.3",
    title: "Post-Incident Review",
    category: "Incident Management",
    description: "Post-incident reviews and remediation actions are performed.",
    severity: "Medium",
    evidence_type: "Report",
    evidence_examples: ["Post-incident report", "action tracker"],
    frequency: "Per incident",
    automatable: false,
    guidance: {
      auditor_expectation: "Post-incident RCA and remediation tracking",
      user_instruction: "Upload a recent post-incident report.",
      good_examples: ["RCA with action items closed"],
      bad_examples: ["Incidents closed with no follow-up"],
    },
  },
  {
    control_key: "CC11.1",
    title: "Security Policies",
    category: "Policies",
    description: "Information security policies are documented and approved.",
    severity: "High",
    evidence_type: "Document",
    evidence_examples: ["Security policy PDF", "AUP/NDA"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Formal security policies maintained and approved",
      user_instruction: "Upload core security policies.",
      good_examples: ["Access policy, incident policy, backup policy"],
      bad_examples: ["No formal policies"],
    },
  },
  {
    control_key: "CC11.2",
    title: "Policy Awareness & Training",
    category: "Policies",
    description: "Employees are trained on security policies.",
    severity: "Medium",
    evidence_type: "Training Records",
    evidence_examples: ["Training attendance logs", "quiz results"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Staff training evidence",
      user_instruction: "Upload training attendance exports or LMS reports.",
      good_examples: ["Signed policy acknowledgement records"],
      bad_examples: ["No training records"],
    },
  },
  {
    control_key: "CC12.1",
    title: "Encryption in Transit",
    category: "Data Security",
    description: "Data is protected in transit (TLS).",
    severity: "High",
    evidence_type: "Config/Scan",
    evidence_examples: ["SSL config screenshot", "SSL scan report"],
    frequency: "Annual",
    automatable: true,
    guidance: {
      auditor_expectation: "TLS enforced for public endpoints",
      user_instruction: "Upload SSL config or scan report.",
      good_examples: ["HTTPS enforced, HSTS present"],
      bad_examples: ["HTTP endpoints exposed"],
    },
  },
  {
    control_key: "CC12.2",
    title: "Encryption at Rest",
    category: "Data Security",
    description: "Data at rest is encrypted using approved mechanisms.",
    severity: "High",
    evidence_type: "Config/Export",
    evidence_examples: ["RDS StorageEncrypted flag", "S3 default encryption"],
    frequency: "Annual",
    automatable: true,
    guidance: {
      auditor_expectation: "Customer data encrypted at rest",
      user_instruction:
        "Upload DB encryption settings screenshot or connect cloud provider.",
      good_examples: ["RDS storage encryption true"],
      bad_examples: ["Unencrypted DB instances"],
    },
  },
  {
    control_key: "CC12.3",
    title: "Key Management",
    category: "Data Security",
    description: "Cryptographic keys are managed and rotated appropriately.",
    severity: "High",
    evidence_type: "Policy/Config",
    evidence_examples: ["KMS policy", "rotation schedule"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Key lifecycle and rotation documented",
      user_instruction: "Upload KMS policy and rotation schedule.",
      good_examples: ["KMS key rotation enabled"],
      bad_examples: ["Keys unmanaged or hard-coded"],
    },
  },
  {
    control_key: "CC12.4",
    title: "Data Classification",
    category: "Data Security",
    description: "Data is classified and handled according to sensitivity.",
    severity: "Medium",
    evidence_type: "Policy/Inventory",
    evidence_examples: ["Data classification policy", "PII inventory"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Classified data mapping and rules",
      user_instruction: "Upload data classification doc and sample inventory.",
      good_examples: ["PII inventory with owners"],
      bad_examples: ["No data classification"],
    },
  },
  {
    control_key: "CC13.1",
    title: "Vendor Risk Assessment",
    category: "Vendor Management",
    description: "Critical vendors are assessed for security posture.",
    severity: "Medium",
    evidence_type: "Policy/Docs",
    evidence_examples: ["Vendor risk register", "DPA documents"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Vendors documented and assessed",
      user_instruction: "Upload vendor register and any security assessments.",
      good_examples: ["Signed DPAs and questionnaires"],
      bad_examples: ["No vendor assessments"],
    },
  },
  {
    control_key: "CC13.2",
    title: "Third-party Contracts & DPAs",
    category: "Vendor Management",
    description:
      "Data processing agreements and contracts exist for relevant vendors.",
    severity: "High",
    evidence_type: "Contract/Doc",
    evidence_examples: ["DPA PDF", "contract clauses"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "DPAs in place where required",
      user_instruction: "Upload DPAs for vendors handling personal data.",
      good_examples: ["Signed DPA for cloud provider"],
      bad_examples: ["No DPA for data processors"],
    },
  },
  {
    control_key: "CC14.1",
    title: "HR Background Checks",
    category: "HR Security",
    description: "Background checks are performed where appropriate.",
    severity: "Medium",
    evidence_type: "HR Record",
    evidence_examples: ["Background check vendor report", "policy"],
    frequency: "Per hire",
    automatable: false,
    guidance: {
      auditor_expectation: "Checks performed consistent with policy",
      user_instruction:
        "Upload sample background check confirmations and policy.",
      good_examples: [
        "Background check records for staff with access to sensitive systems",
      ],
      bad_examples: ["No background checks where expected"],
    },
  },
  {
    control_key: "CC14.2",
    title: "Onboarding & Offboarding",
    category: "HR Security",
    description:
      "Employee onboarding and offboarding processes are defined and executed.",
    severity: "High",
    evidence_type: "Ticket/Log",
    evidence_examples: [
      "Offboarding checklist",
      "ticket showing account removal",
    ],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Offboarding disables access promptly",
      user_instruction:
        "Upload offboarding checklist or connect HR/IdP systems.",
      good_examples: ["Ticket showing account removal timestamp"],
      bad_examples: ["Inactive accounts not revoked"],
    },
  },
  {
    control_key: "CC15.1",
    title: "Privacy Notices & Consent",
    category: "Privacy & Confidentiality",
    description: "Privacy notices and consent mechanisms are in place for PII.",
    severity: "High",
    evidence_type: "Policy/Screen",
    evidence_examples: ["Privacy policy URL", "consent capture screenshots"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation:
        "Privacy notice covers data collection and lawful basis",
      user_instruction:
        "Upload privacy policy and examples of consent capture.",
      good_examples: ["Privacy policy referencing data retention and rights"],
      bad_examples: ["No public privacy notice"],
    },
  },
  {
    control_key: "CC15.2",
    title: "Data Retention & Deletion",
    category: "Privacy & Confidentiality",
    description: "Data retention and deletion policies exist and are followed.",
    severity: "Medium",
    evidence_type: "Policy/Export",
    evidence_examples: ["Data retention policy", "deletion logs"],
    frequency: "Annual",
    automatable: true,
    guidance: {
      auditor_expectation:
        "Retention schedules and deletion procedures in place",
      user_instruction: "Upload retention policy or deletion log sample.",
      good_examples: ["Retention policy and deletion audit log"],
      bad_examples: ["Unlimited data retention with no policy"],
    },
  },
  {
    control_key: "CC16.1",
    title: "Risk Assessment Process",
    category: "Risk Management",
    description:
      "Periodic security risk assessments are performed and recorded.",
    severity: "High",
    evidence_type: "Report",
    evidence_examples: ["Risk assessment report", "risk register"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Formal periodic risk assessments",
      user_instruction: "Upload latest risk assessment and risk register.",
      good_examples: ["Risk register with owners and mitigation plans"],
      bad_examples: ["No recorded risk assessment"],
    },
  },
  {
    control_key: "CC16.2",
    title: "Risk Remediation Tracking",
    category: "Risk Management",
    description: "Identified risks are tracked and remediated.",
    severity: "High",
    evidence_type: "Tracker/Ticket",
    evidence_examples: ["Risk remediation tickets", "status report"],
    frequency: "Ongoing",
    automatable: false,
    guidance: {
      auditor_expectation: "Risks tracked to closure",
      user_instruction: "Upload remediation tracker or related tickets.",
      good_examples: ["Risk ticket with remediation evidence"],
      bad_examples: ["Risks logged with no action"],
    },
  },
  {
    control_key: "CC17.1",
    title: "Physical Access Controls (Offices)",
    category: "Physical & Environmental",
    description: "Physical access to offices is controlled and logged.",
    severity: "Medium",
    evidence_type: "Log/Policy",
    evidence_examples: ["Access logs", "badge system report"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Access logs and controls for physical sites",
      user_instruction: "Upload access log extract or office access policy.",
      good_examples: ["Badge logs showing entry timestamps"],
      bad_examples: ["No access logging at premises"],
    },
  },
  {
    control_key: "CC17.2",
    title: "Device Management",
    category: "Physical & Environmental",
    description: "Corporate devices are managed and secured.",
    severity: "High",
    evidence_type: "MDM Export/Policy",
    evidence_examples: ["MDM policy", "device inventory"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Devices enrolled and policy enforced",
      user_instruction: "Upload MDM device list or policy.",
      good_examples: ["MDM showing enrolled devices and compliance"],
      bad_examples: ["No device management"],
    },
  },
  {
    control_key: "CC18.1",
    title: "Business Continuity Plan",
    category: "Governance",
    description:
      "Business continuity and disaster recovery plans are documented.",
    severity: "High",
    evidence_type: "Plan/Report",
    evidence_examples: ["BCP document", "DR test report"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "BCP/DR plans and periodic tests",
      user_instruction: "Upload BCP/DR documents and test evidence.",
      good_examples: ["DR test report with outcomes"],
      bad_examples: ["No DR testing evidence"],
    },
  },
  {
    control_key: "CC18.2",
    title: "Security Governance & Ownership",
    category: "Governance",
    description:
      "Security roles and responsibilities are assigned and documented.",
    severity: "High",
    evidence_type: "Org Chart/Doc",
    evidence_examples: ["Role description", "security owner assignment"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Named security owner and governance structure",
      user_instruction: "Upload org chart showing security owner.",
      good_examples: ["CISO/owner assigned with responsibilities"],
      bad_examples: ["No defined security ownership"],
    },
  },
  {
    control_key: "CC19.1",
    title: "Developer Access Controls",
    category: "Access Control",
    description:
      "Developer accounts and access to production are controlled and audited.",
    severity: "High",
    evidence_type: "Export/Log",
    evidence_examples: ["Dev access list", "audit logs of access"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation:
        "Developers restricted from direct prod access without approvals",
      user_instruction:
        "Upload dev access export or integrate with VCS/infra to show controls.",
      good_examples: ["Access log showing no direct console logins"],
      bad_examples: ["Developers with wide admin access"],
    },
  },
  {
    control_key: "CC19.2",
    title: "Secrets Management",
    category: "Data Security",
    description: "Secrets are stored in secure vaults and rotated.",
    severity: "High",
    evidence_type: "Config/Policy",
    evidence_examples: ["Vault policy", "rotation logs"],
    frequency: "Quarterly",
    automatable: false,
    guidance: {
      auditor_expectation: "Secrets in vaults with rotation and access control",
      user_instruction:
        "Upload vault config or policy and sample rotation logs.",
      good_examples: ["KMS/Secrets Manager usage with rotation"],
      bad_examples: ["Secrets in repo or plain text"],
    },
  },
  {
    control_key: "CC20.1",
    title: "Configuration Management",
    category: "System Operations",
    description: "Configuration changes are tracked and managed.",
    severity: "Medium",
    evidence_type: "Repo/Doc",
    evidence_examples: ["Config management logs", "IaC version control"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation:
        "Configuration tracked via IaC and changes controlled",
      user_instruction: "Upload IaC repo link or config change logs.",
      good_examples: ["Terraform in VCS with PR approvals"],
      bad_examples: ["Manual ad-hoc config edits"],
    },
  },
  {
    control_key: "CC20.2",
    title: "Network Security Controls",
    category: "System Operations",
    description:
      "Network access controls & segmentation are defined and enforced.",
    severity: "Medium",
    evidence_type: "Architecture/Config",
    evidence_examples: ["Security group configs", "firewall rules"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation:
        "Network rules restricting access to sensitive systems",
      user_instruction: "Upload network ACLs or security group screenshots.",
      good_examples: ["Security groups only open required ports"],
      bad_examples: ["Open wide network access"],
    },
  },
  {
    control_key: "CC21.1",
    title: "Data Minimization",
    category: "Privacy & Confidentiality",
    description: "Only necessary personal data is collected and retained.",
    severity: "Medium",
    evidence_type: "Policy/Export",
    evidence_examples: ["Data inventory", "collection justification"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation:
        "Evidence of data minimization decisions and inventories",
      user_instruction: "Upload data inventory and retention rationale.",
      good_examples: ["PII inventory with retention justification"],
      bad_examples: ["Excessive PII collection without reason"],
    },
  },
  {
    control_key: "CC22.1",
    title: "Legal & Regulatory Compliance",
    category: "Governance",
    description: "Processes exist to monitor compliance obligations.",
    severity: "Medium",
    evidence_type: "Policy/Doc",
    evidence_examples: ["Compliance register", "legal reviews"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Documented compliance mapping and responsibilities",
      user_instruction: "Upload compliance register and sample reviews.",
      good_examples: ["List of applicable laws and owners"],
      bad_examples: ["No compliance tracking"],
    },
  },
  {
    control_key: "CC23.1",
    title: "Software Dependency Management",
    category: "System Operations",
    description: "Third-party software dependencies are tracked and updated.",
    severity: "Medium",
    evidence_type: "Report/Export",
    evidence_examples: ["Dependency manifest", "update history"],
    frequency: "Monthly",
    automatable: true,
    guidance: {
      auditor_expectation:
        "Dependencies inventoried and vulnerabilities tracked",
      user_instruction: "Upload dependency scan or connect Dependabot/Snyk.",
      good_examples: ["Dependabot PRs and closure logs"],
      bad_examples: ["Untracked dependencies"],
    },
  },
  {
    control_key: "CC23.2",
    title: "Third-party Code Review",
    category: "Change Management",
    description: "Use of third-party code is reviewed for security.",
    severity: "Low",
    evidence_type: "Policy/Ticket",
    evidence_examples: ["Dependency approval tickets", "review notes"],
    frequency: "Per use",
    automatable: false,
    guidance: {
      auditor_expectation: "Policy for accepting third-party code and reviews",
      user_instruction: "Upload sample review or approval ticket.",
      good_examples: ["Security review notes before adopting a dependency"],
      bad_examples: ["No review of third-party code"],
    },
  },
  {
    control_key: "CC24.1",
    title: "Access Logging for Storage",
    category: "Data Security",
    description: "Access to object storage is logged and monitored.",
    severity: "Medium",
    evidence_type: "Config/Export",
    evidence_examples: ["S3 access logs", "GCS audit logs"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Object storage access logged and retained",
      user_instruction:
        "Upload access log config or integrate storage provider.",
      good_examples: ["S3 server access logs enabled"],
      bad_examples: ["No logging on buckets with customer data"],
    },
  },
  {
    control_key: "CC24.2",
    title: "Database Activity Monitoring",
    category: "Data Security",
    description: "Critical DB activity is monitored and logged.",
    severity: "High",
    evidence_type: "DB Logs/Config",
    evidence_examples: ["DB audit logs", "monitoring config"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Database activity monitored for suspicious queries",
      user_instruction: "Upload DB audit logs or connect monitoring agent.",
      good_examples: ["RDS enhanced monitoring with audit logs"],
      bad_examples: ["No DB auditing enabled"],
    },
  },
  {
    control_key: "CC25.1",
    title: "User Account Lifecycle",
    category: "Access Control",
    description:
      "User account lifecycle (join/move/leave) is managed and logged.",
    severity: "High",
    evidence_type: "Ticket/Log",
    evidence_examples: ["Onboarding/offboarding tickets", "provisioning logs"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation:
        "Timely provisioning and deprovisioning with records",
      user_instruction: "Upload onboarding/offboarding ticket and check logs.",
      good_examples: ["Offboarding ticket with access revocation timestamps"],
      bad_examples: ["Stale accounts not removed"],
    },
  },
  {
    control_key: "CC26.1",
    title: "Maintenance & Patch Management",
    category: "System Operations",
    description: "Systems are regularly patched and updated.",
    severity: "High",
    evidence_type: "Patch Report/Policy",
    evidence_examples: ["Patch schedule", "patch run logs"],
    frequency: "Monthly",
    automatable: true,
    guidance: {
      auditor_expectation: "Patch management policy and records",
      user_instruction: "Upload patch schedule and recent patch reports.",
      good_examples: ["Monthly patch logs with successful patching"],
      bad_examples: ["No patching evidence"],
    },
  },
  {
    control_key: "CC26.2",
    title: "Anti-malware & Endpoint Protection",
    category: "System Operations",
    description: "Endpoint protection is deployed and monitored.",
    severity: "Medium",
    evidence_type: "Config/Report",
    evidence_examples: ["Endpoint protection dashboard", "scan reports"],
    frequency: "Ongoing",
    automatable: false,
    guidance: {
      auditor_expectation: "Endpoint protection on corporate devices",
      user_instruction: "Upload EPP dashboard screenshot or policy.",
      good_examples: ["MDM+EPP showing compliant devices"],
      bad_examples: ["No endpoint protection"],
    },
  },
  {
    control_key: "CC27.1",
    title: "Configuration Baseline",
    category: "System Operations",
    description: "Secure configuration baselines are defined and enforced.",
    severity: "Medium",
    evidence_type: "Baseline/Scan",
    evidence_examples: ["CIS benchmark scan", "baseline document"],
    frequency: "Annual",
    automatable: true,
    guidance: {
      auditor_expectation: "Baseline configurations and scans",
      user_instruction: "Upload baseline doc or scan report.",
      good_examples: ["CIS benchmark pass reports"],
      bad_examples: ["No baseline configuration"],
    },
  },
  {
    control_key: "CC27.2",
    title: "Mobile Device Security",
    category: "Physical & Environmental",
    description: "Mobile devices used for work are secured and managed.",
    severity: "Medium",
    evidence_type: "MDM Export/Policy",
    evidence_examples: ["MDM enrolled devices", "mobile policy"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation: "Mobile devices under MDM with policies",
      user_instruction: "Upload MDM export or policy.",
      good_examples: ["MDM showing encryption and passcode enforcement"],
      bad_examples: ["No MDM for corporate devices"],
    },
  },
  {
    control_key: "CC28.1",
    title: "Data Masking & Minimization in Dev",
    category: "Data Security",
    description:
      "Sensitive data is masked or synthetic data is used in non-prod.",
    severity: "Medium",
    evidence_type: "Policy/Config",
    evidence_examples: ["Data masking policy", "sanitization scripts"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation:
        "Non-prod environments do not contain real PII unless sanitized",
      user_instruction: "Upload data masking policy or sample scripts.",
      good_examples: ["Sanitization pipeline and verification"],
      bad_examples: ["Production PII in non-prod"],
    },
  },
  {
    control_key: "CC28.2",
    title: "Test Data Management",
    category: "Data Security",
    description: "Test data is managed and protected.",
    severity: "Low",
    evidence_type: "Policy/Export",
    evidence_examples: ["Test data policy", "sanitization logs"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Controls to prevent real PII in test data",
      user_instruction: "Upload test data policy and sample logs.",
      good_examples: ["Automated masking during refresh"],
      bad_examples: ["Uncontrolled test data usage"],
    },
  },
  {
    control_key: "CC29.1",
    title: "SLA & Availability Monitoring",
    category: "System Operations",
    description: "Availability metrics are monitored and SLAs defined.",
    severity: "Medium",
    evidence_type: "Dashboard/Report",
    evidence_examples: ["Uptime dashboards", "SLA docs"],
    frequency: "Monthly",
    automatable: true,
    guidance: {
      auditor_expectation: "Availability SLAs and monitoring in place",
      user_instruction: "Upload uptime report or SLA doc.",
      good_examples: ["Status page uptime history"],
      bad_examples: ["No availability monitoring"],
    },
  },
  {
    control_key: "CC29.2",
    title: "Capacity & Performance Planning",
    category: "System Operations",
    description: "Capacity planning is performed to meet demand.",
    severity: "Low",
    evidence_type: "Plan/Report",
    evidence_examples: ["Capacity plan", "scaling events"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Capacity plans and review cycles",
      user_instruction: "Upload capacity planning doc or metrics.",
      good_examples: ["Scaling plan and load test results"],
      bad_examples: ["No capacity planning"],
    },
  },
  {
    control_key: "CC30.1",
    title: "Admin Account Justification",
    category: "Access Control",
    description: "Admin accounts have documented business justification.",
    severity: "High",
    evidence_type: "Inventory/Doc",
    evidence_examples: ["Admin justification sheet", "approval records"],
    frequency: "Ongoing",
    automatable: true,
    guidance: {
      auditor_expectation:
        "Each privileged account has owner and business reason",
      user_instruction:
        "Upload admin justification list or integrate admin exports.",
      good_examples: ["Admin list with owner and reason"],
      bad_examples: ["Admins with no justification"],
    },
  },
  {
    control_key: "CC30.2",
    title: "Temporary Access Controls",
    category: "Access Control",
    description: "Temporary elevated access is time-bound and approved.",
    severity: "Medium",
    evidence_type: "Ticket/Log",
    evidence_examples: [
      "Temporary access ticket",
      "just-in-time approval logs",
    ],
    frequency: "Per event",
    automatable: false,
    guidance: {
      auditor_expectation: "Time-bound access records and removal evidence",
      user_instruction: "Upload an example temporary access ticket.",
      good_examples: ["JIT access logs showing expiry"],
      bad_examples: ["Permanent elevated access granted ad-hoc"],
    },
  },
  {
    control_key: "CC31.1",
    title: "Audit Trail Protection",
    category: "System Operations",
    description: "Audit logs are protected and tamper-evident.",
    severity: "High",
    evidence_type: "Config/Policy",
    evidence_examples: ["Log integrity config", "WORM settings"],
    frequency: "Annual",
    automatable: true,
    guidance: {
      auditor_expectation: "Logs protected from modification and retained",
      user_instruction: "Upload log integrity settings or evidence.",
      good_examples: ["Immutable log store or write-once settings"],
      bad_examples: ["Logs editable by many users"],
    },
  },
  {
    control_key: "CC31.2",
    title: "Time Synchronization",
    category: "System Operations",
    description:
      "Systems use synchronized time sources for logging consistency.",
    severity: "Low",
    evidence_type: "Config/Export",
    evidence_examples: ["NTP config", "time sync monitoring"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Consistent timestamps across systems",
      user_instruction: "Upload NTP config or time sync evidence.",
      good_examples: ["NTP configuration and monitoring"],
      bad_examples: ["No time sync causing inconsistent logs"],
    },
  },
  {
    control_key: "CC32.1",
    title: "Data Breach Notification Process",
    category: "Incident Management",
    description: "Process exists to notify affected parties of data breaches.",
    severity: "High",
    evidence_type: "Policy/Plan",
    evidence_examples: [
      "Breach notification plan",
      "sample notification template",
    ],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation:
        "Breach notification procedures aligned to legal requirements",
      user_instruction: "Upload breach notification plan and templates.",
      good_examples: ["Template emails and contact lists"],
      bad_examples: ["No breach notification plan"],
    },
  },
  {
    control_key: "CC33.1",
    title: "Audit & Assurance Readiness",
    category: "Governance",
    description:
      "Organization prepares and maintains audit evidence for assurance.",
    severity: "Medium",
    evidence_type: "Report/Pack",
    evidence_examples: ["Previous audit reports", "evidence packs"],
    frequency: "Annual",
    automatable: false,
    guidance: {
      auditor_expectation: "Evidence organized for auditor review",
      user_instruction:
        "Upload any prior audit reports or sample evidence pack.",
      good_examples: ["Organized evidence records for auditors"],
      bad_examples: ["Scattered or missing evidence"],
    },
  },
  {
    control_key: "CC34.1",
    title: "Continuous Improvement & Metrics",
    category: "Governance",
    description: "Security metrics and improvement cycles are tracked.",
    severity: "Low",
    evidence_type: "Dashboard/Report",
    evidence_examples: ["Security metrics dashboard", "improvement plan"],
    frequency: "Quarterly",
    automatable: false,
    guidance: {
      auditor_expectation: "Regular tracking of security KPIs",
      user_instruction: "Upload security metrics snapshot or plan.",
      good_examples: ["KPI dashboard and sprint improvements"],
      bad_examples: ["No measurable improvement process"],
    },
  },
];

const onboardingStepsData = [
  {
    id: "identity",
    title: "How does your team log in?",
    question: "How does your team log in to company tools and dashboards?",
    options: [
      { key: "google_workspace", label: "Google Workspace" },
      { key: "azure_ad", label: "Microsoft 365 / Azure AD" },
      { key: "okta", label: "Okta" },
      { key: "aws", label: "AWS IAM" },
      { key: "github", label: "GitHub" },
      { key: "custom", label: "Custom / Other" },
    ],
    step_order: 1,
  },
  {
    id: "hosting",
    title: "Where is your app hosted?",
    question: "Where is your application hosted in production?",
    options: [
      { key: "aws", label: "AWS" },
      { key: "gcp", label: "Google Cloud (GCP)" },
      { key: "azure", label: "Microsoft Azure" },
      { key: "vercel", label: "Vercel / Netlify" },
      { key: "onprem", label: "On-premise / Colocation" },
    ],
    step_order: 2,
  },
  {
    id: "code",
    title: "Source code & Deployments",
    question: "Where is your source code and how do you deploy?",
    options: [
      { key: "github", label: "GitHub" },
      { key: "gitlab", label: "GitLab" },
      { key: "bitbucket", label: "Bitbucket" },
      { key: "other_vcs", label: "Other" },
    ],
    step_order: 3,
  },
  {
    id: "data",
    title: "Where do you store customer data?",
    question: "Which databases or storage systems hold customer data?",
    options: [
      { key: "postgres", label: "Postgres (RDS/CloudSQL/Supabase)" },
      { key: "mysql", label: "MySQL" },
      { key: "mongodb", label: "MongoDB Atlas" },
      { key: "dynamodb", label: "DynamoDB" },
      { key: "s3", label: "S3 / Object Storage" },
    ],
    step_order: 4,
  },
  {
    id: "logging",
    title: "Logging & Monitoring",
    question: "Which logging or monitoring tools do you use?",
    options: [
      { key: "cloudwatch", label: "CloudWatch" },
      { key: "datadog", label: "Datadog" },
      { key: "sentry", label: "Sentry" },
      { key: "elk", label: "ELK / Kibana" },
      { key: "none", label: "None" },
    ],
    step_order: 5,
  },
  {
    id: "incidents",
    title: "Incidents & Vendors",
    question:
      "How do you track incidents and which critical third-party services do you use?",
    options: [
      { key: "jira", label: "Jira" },
      { key: "notion", label: "Notion" },
      { key: "google_docs", label: "Google Docs / Sheets" },
      { key: "none", label: "We don't track incidents" },
    ],
    step_order: 6,
  },
];

const controlSystemMappingsData = [
  {
    control_key: "CC6.1",
    system_key: "google_workspace",
    automatable: true,
    instruction:
      "Check Admin audit logs for provisioning events and approver metadata.",
  },
  {
    control_key: "CC6.1",
    system_key: "okta",
    automatable: true,
    instruction:
      "Use Okta system logs to verify provisioning requests and approver tasks.",
  },
  {
    control_key: "CC6.1",
    system_key: "jira",
    automatable: true,
    instruction: "Search for access request tickets with approval status.",
  },
  {
    control_key: "CC6.2",
    system_key: "google_workspace",
    automatable: true,
    instruction:
      "Check 2-step enforcement via Directory API or security settings.",
  },
  {
    control_key: "CC6.2",
    system_key: "github",
    automatable: true,
    instruction:
      "Query org members without 2FA via GitHub API; zero results = pass.",
  },
  {
    control_key: "CC6.2",
    system_key: "aws",
    automatable: true,
    instruction:
      "Check IAM and root account MFA enabled, and hardware/virtual MFA associations.",
  },
  {
    control_key: "CC6.3",
    system_key: "github",
    automatable: true,
    instruction: "List org/team permission levels and count admin/owner roles.",
  },
  {
    control_key: "CC6.3",
    system_key: "aws",
    automatable: true,
    instruction:
      "Describe IAM roles and policies; identify overly permissive policies.",
  },
  {
    control_key: "CC6.3",
    system_key: "google_workspace",
    automatable: true,
    instruction: "Export admin roles and group membership for role mapping.",
  },
  {
    control_key: "CC6.4",
    system_key: "github",
    automatable: true,
    instruction:
      "Fetch team membership snapshots to support periodic access reviews.",
  },
  {
    control_key: "CC6.4",
    system_key: "google_workspace",
    automatable: true,
    instruction: "Export user list with last login timestamps and admin flags.",
  },
  {
    control_key: "CC6.5",
    system_key: "github",
    automatable: true,
    instruction:
      "List org owners and admin users; flag unexpected privileged accounts.",
  },
  {
    control_key: "CC6.5",
    system_key: "aws",
    automatable: true,
    instruction: "List IAM users with AdministratorAccess policies attached.",
  },
  {
    control_key: "CC6.6",
    system_key: "aws",
    automatable: true,
    instruction:
      "List IAM service accounts and tags; verify purpose and attached policies.",
  },
  {
    control_key: "CC6.6",
    system_key: "github",
    automatable: true,
    instruction: "List GitHub Apps / bots and their permissions.",
  },
  {
    control_key: "CC7.1",
    system_key: "aws",
    automatable: true,
    instruction:
      "Verify CloudWatch log groups exist for production services and retention.",
  },
  {
    control_key: "CC7.1",
    system_key: "datadog",
    automatable: true,
    instruction: "Check log indexes and retention settings.",
  },
  {
    control_key: "CC7.6",
    system_key: "github",
    automatable: true,
    instruction:
      "Check Dependabot/Security Alerts and open vulnerability counts.",
  },
  {
    control_key: "CC7.6",
    system_key: "snyk",
    automatable: true,
    instruction: "Fetch Snyk project issues and remediation status.",
  },
  {
    control_key: "CC8.1",
    system_key: "github",
    automatable: true,
    instruction: "Check branch protection rules and required reviewers.",
  },
  {
    control_key: "CC8.4",
    system_key: "github_actions",
    automatable: true,
    instruction:
      "Identify workflows requiring manual approval steps before deploy.",
  },
  {
    control_key: "CC9.1",
    system_key: "aws",
    automatable: true,
    instruction:
      "Verify automated backups enabled for RDS and snapshot schedules.",
  },
  {
    control_key: "CC9.3",
    system_key: "aws",
    automatable: true,
    instruction: "Check RDS/S3 default encryption settings.",
  },
  {
    control_key: "CC10.2",
    system_key: "jira",
    automatable: true,
    instruction:
      "Search incident tickets and resolution timestamps for triage evidence.",
  },
  {
    control_key: "CC10.2",
    system_key: "datadog",
    automatable: true,
    instruction: "Export alerts and incident links for triage evidence.",
  },
  {
    control_key: "CC12.1",
    system_key: "aws",
    automatable: true,
    instruction: "Check ELB/ALB TLS configuration and certificate validity.",
  },
  {
    control_key: "CC12.2",
    system_key: "aws",
    automatable: true,
    instruction: "Check storage encryption flags for S3 and EBS volumes.",
  },
  {
    control_key: "CC14.2",
    system_key: "google_workspace",
    automatable: true,
    instruction:
      "Check user creation and suspension audit logs to verify offboarding.",
  },
  {
    control_key: "CC19.2",
    system_key: "secrets_manager",
    automatable: true,
    instruction: "Check secrets manager usage and access control logs.",
  },
  {
    control_key: "CC23.1",
    system_key: "github",
    automatable: true,
    instruction: "Fetch dependency manifests and open security alerts.",
  },
  {
    control_key: "CC24.1",
    system_key: "s3",
    automatable: true,
    instruction:
      "Check S3 access logging and server-side encryption configuration.",
  },
  {
    control_key: "CC26.1",
    system_key: "patch_management",
    automatable: false,
    instruction: "Collect patch schedule and evidence from operations.",
  },
  {
    control_key: "CC31.1",
    system_key: "cloud_logging",
    automatable: true,
    instruction:
      "Verify immutable/append-only log storage configuration where supported.",
  },
];

module.exports = {
  async up(queryInterface) {
    const timestamp = new Date();

    const systemsRecords = systemsCatalogData.map((system) => ({
      ...system,
      properties: JSON.stringify(system.properties ?? {}),
      created_at: timestamp,
      updated_at: timestamp,
    }));
    await queryInterface.bulkInsert("systems_catalog", systemsRecords, {
      ignoreDuplicates: true,
    });

    const integrationsRecords = integrationsCatalogData.map((integration) => ({
      ...integration,
      required_scopes: JSON.stringify(integration.required_scopes ?? []),
      auth_type: integration.auth_type ?? "oauth",
      recommended: integration.recommended ?? false,
      created_at: timestamp,
      updated_at: timestamp,
    }));
    await queryInterface.bulkInsert(
      "integrations_catalog",
      integrationsRecords,
      { ignoreDuplicates: true }
    );

    const controlKeyToId = {};
    const controlsRecords = controlsData.map((control) => {
      const id = randomUUID();
      controlKeyToId[control.control_key] = id;
      return {
        id,
        control_key: control.control_key,
        title: control.title,
        category: control.category,
        description: control.description,
        severity: control.severity,
        evidence_type: control.evidence_type,
        evidence_examples: JSON.stringify(control.evidence_examples ?? []),
        frequency: control.frequency,
        automatable: control.automatable ?? false,
        guidance: JSON.stringify(control.guidance ?? {}),
        created_at: timestamp,
        updated_at: timestamp,
      };
    });
    await queryInterface.bulkInsert("controls", controlsRecords, {
      ignoreDuplicates: true,
    });

    const onboardingRecords = onboardingStepsData.map((step) => ({
      ...step,
      help_text: step.help_text ?? null,
      options: JSON.stringify(step.options ?? []),
      created_at: timestamp,
      updated_at: timestamp,
    }));
    await queryInterface.bulkInsert("onboarding_steps", onboardingRecords, {
      ignoreDuplicates: true,
    });

    const controlSystemRecords = controlSystemMappingsData
      .map((mapping) => {
        const control_id = controlKeyToId[mapping.control_key];
        if (!control_id) {
          return null;
        }
        return {
          id: randomUUID(),
          control_id,
          system_key: mapping.system_key,
          integration_key: mapping.integration_key ?? null,
          automatable: mapping.automatable ?? false,
          instruction: mapping.instruction ?? null,
          priority: mapping.priority ?? 100,
          metadata: JSON.stringify(mapping.metadata ?? {}),
          created_at: timestamp,
          updated_at: timestamp,
        };
      })
      .filter(Boolean);
    if (controlSystemRecords.length > 0) {
      await queryInterface.bulkInsert(
        "control_system_mapping",
        controlSystemRecords,
        {
          ignoreDuplicates: true,
        }
      );
    }
  },

  async down(queryInterface) {
    const systemKeys = systemsCatalogData.map((system) => system.system_key);
    const integrationKeys = integrationsCatalogData.map(
      (integration) => integration.integration_key
    );
    const controlKeys = controlsData.map((control) => control.control_key);
    const onboardingIds = onboardingStepsData.map((step) => step.id);

    await queryInterface.sequelize.query(
      `
        DELETE FROM control_system_mapping
        WHERE control_id IN (
          SELECT id FROM controls WHERE control_key IN (:controlKeys)
        )
      `,
      { replacements: { controlKeys } }
    );

    await queryInterface.bulkDelete(
      "onboarding_steps",
      { id: { [Op.in]: onboardingIds } },
      {}
    );
    await queryInterface.bulkDelete(
      "control_system_mapping",
      {
        system_key: {
          [Op.in]: Array.from(
            new Set(
              controlSystemMappingsData.map((mapping) => mapping.system_key)
            )
          ),
        },
      },
      {}
    );
    await queryInterface.bulkDelete(
      "controls",
      { control_key: { [Op.in]: controlKeys } },
      {}
    );
    await queryInterface.bulkDelete(
      "integrations_catalog",
      { integration_key: { [Op.in]: integrationKeys } },
      {}
    );
    await queryInterface.bulkDelete(
      "systems_catalog",
      { system_key: { [Op.in]: systemKeys } },
      {}
    );
  },
};
