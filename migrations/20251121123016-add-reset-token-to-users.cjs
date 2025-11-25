'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.reset_token) {
      await queryInterface.addColumn('users', 'reset_token', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    
    if (!tableDescription.reset_token_expiry) {
      await queryInterface.addColumn('users', 'reset_token_expiry', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    
    if (tableDescription.reset_token) {
      await queryInterface.removeColumn('users', 'reset_token');
    }
    
    if (tableDescription.reset_token_expiry) {
      await queryInterface.removeColumn('users', 'reset_token_expiry');
    }
  },
};

