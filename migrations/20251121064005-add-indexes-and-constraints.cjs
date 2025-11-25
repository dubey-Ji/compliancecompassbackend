'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, change system_key columns from TEXT to VARCHAR(255) to support indexes
    const systemsUsedDesc = await queryInterface.describeTable('systems_used');
    if (systemsUsedDesc.system_key && systemsUsedDesc.system_key.type.toLowerCase().includes('text')) {
      await queryInterface.changeColumn('systems_used', 'system_key', {
        type: Sequelize.STRING(255),
        allowNull: false,
      });
    }
    
    const integrationsDesc = await queryInterface.describeTable('integrations');
    if (integrationsDesc.system_key && integrationsDesc.system_key.type.toLowerCase().includes('text')) {
      await queryInterface.changeColumn('integrations', 'system_key', {
        type: Sequelize.STRING(255),
        allowNull: false,
      });
    }
    
    const serviceAccountsDesc = await queryInterface.describeTable('service_accounts');
    if (serviceAccountsDesc && serviceAccountsDesc.system_key && serviceAccountsDesc.system_key.type.toLowerCase().includes('text')) {
      await queryInterface.changeColumn('service_accounts', 'system_key', {
        type: Sequelize.STRING(255),
        allowNull: false,
      });
    }
    
    // Unique constraint on systems_used (organization_id, system_key)
    try {
      await queryInterface.addIndex('systems_used', ['organization_id', 'system_key'], {
        unique: true,
        name: 'ux_systems_used_org_system_key',
      });
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    // Change status column to VARCHAR if it's TEXT
    const projectControlsDesc = await queryInterface.describeTable('project_controls');
    if (projectControlsDesc.status && projectControlsDesc.status.type.toLowerCase().includes('text')) {
      await queryInterface.changeColumn('project_controls', 'status', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'not_started',
      });
    }

    // Unique constraint on project_controls (project_id, control_id)
    try {
      await queryInterface.addIndex('project_controls', ['project_id', 'control_id'], {
        unique: true,
        name: 'ux_project_controls_project_control',
      });
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    // Index on project_controls (project_id, status)
    try {
      await queryInterface.addIndex('project_controls', ['project_id', 'status'], {
        name: 'ix_project_controls_project_status',
      });
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    // Index on evidence (project_control_id)
    await queryInterface.addIndex('evidence', ['project_control_id'], {
      name: 'ix_evidence_project_control',
    });

    // Index on evidence (uploaded_by)
    await queryInterface.addIndex('evidence', ['uploaded_by'], {
      name: 'ix_evidence_uploaded_by',
    });

    // Index on integrations (organization_id, system_key)
    await queryInterface.addIndex('integrations', ['organization_id', 'system_key'], {
      name: 'ix_integrations_org_system',
    });

    // Index on integration_evidence (integration_id, control_id)
    await queryInterface.addIndex('integration_evidence', ['integration_id', 'control_id'], {
      name: 'ix_integration_evidence_integration_control',
    });

    // Index on service_accounts (organization_id, system_key)
    await queryInterface.addIndex('service_accounts', ['organization_id', 'system_key'], {
      name: 'ix_service_accounts_org_system',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('systems_used', 'ux_systems_used_org_system_key');
    await queryInterface.removeIndex('project_controls', 'ux_project_controls_project_control');
    await queryInterface.removeIndex('project_controls', 'ix_project_controls_project_status');
    await queryInterface.removeIndex('evidence', 'ix_evidence_project_control');
    await queryInterface.removeIndex('evidence', 'ix_evidence_uploaded_by');
    await queryInterface.removeIndex('integrations', 'ix_integrations_org_system');
    await queryInterface.removeIndex('integration_evidence', 'ix_integration_evidence_integration_control');
    await queryInterface.removeIndex('service_accounts', 'ix_service_accounts_org_system');
  },
};

