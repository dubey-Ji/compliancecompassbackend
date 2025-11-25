'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendors', {
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
      name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      service: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      risk_level: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      contracts: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      last_reviewed_at: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('vendors');
  },
};

