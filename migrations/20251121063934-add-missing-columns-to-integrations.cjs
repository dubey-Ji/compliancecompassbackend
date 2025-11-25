'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('integrations', 'integration_type', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.addColumn('integrations', 'cred', {
      type: Sequelize.JSON,
      allowNull: false,
    });
    await queryInterface.addColumn('integrations', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '{}',
    });
    await queryInterface.addColumn('integrations', 'last_synced_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('integrations', 'status', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: 'connected',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('integrations', 'integration_type');
    await queryInterface.removeColumn('integrations', 'cred');
    await queryInterface.removeColumn('integrations', 'metadata');
    await queryInterface.removeColumn('integrations', 'last_synced_at');
    await queryInterface.removeColumn('integrations', 'status');
  },
};

