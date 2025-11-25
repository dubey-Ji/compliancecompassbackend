'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('backup_records', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'organizations',
          key: 'id',
        },
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'projects',
          key: 'id',
        },
      },
      system_key: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      backup_config: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      last_backup_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_restore_test_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      restore_test_result: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('backup_records');
  },
};

