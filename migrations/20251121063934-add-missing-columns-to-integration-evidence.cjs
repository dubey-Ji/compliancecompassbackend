'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('integration_evidence', 'project_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id',
      },
    });
    await queryInterface.changeColumn('integration_evidence', 'control_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'controls',
        key: 'id',
      },
    });
    await queryInterface.addColumn('integration_evidence', 'status', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('integration_evidence', 'checked_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
    await queryInterface.removeColumn('integration_evidence', 'created_at');
    await queryInterface.removeColumn('integration_evidence', 'updated_at');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('integration_evidence', 'project_id');
    await queryInterface.changeColumn('integration_evidence', 'control_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'controls',
        key: 'id',
      },
    });
    await queryInterface.removeColumn('integration_evidence', 'status');
    await queryInterface.removeColumn('integration_evidence', 'checked_at');
    await queryInterface.addColumn('integration_evidence', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
    await queryInterface.addColumn('integration_evidence', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    });
  },
};

