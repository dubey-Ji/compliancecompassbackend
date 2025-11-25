'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('project_controls');
    const statusType = tableDescription.status?.type?.toLowerCase();
    if (statusType && statusType.includes('text')) {
      await queryInterface.changeColumn('project_controls', 'status', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'not_started',
      });
    } else if (!tableDescription.status || !tableDescription.status.defaultValue) {
      await queryInterface.changeColumn('project_controls', 'status', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'not_started',
      });
    }
    await queryInterface.addColumn('project_controls', 'machine_verdict', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: 'unknown',
    });
    await queryInterface.addColumn('project_controls', 'machine_verdict_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('project_controls', 'owner_user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    });
    await queryInterface.addColumn('project_controls', 'last_answered_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('project_controls', 'last_validated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn('project_controls', 'control_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'controls',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('project_controls', 'status', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
    await queryInterface.removeColumn('project_controls', 'machine_verdict');
    await queryInterface.removeColumn('project_controls', 'machine_verdict_reason');
    await queryInterface.removeColumn('project_controls', 'owner_user_id');
    await queryInterface.removeColumn('project_controls', 'last_answered_at');
    await queryInterface.removeColumn('project_controls', 'last_validated_at');
    await queryInterface.changeColumn('project_controls', 'control_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'controls',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};

