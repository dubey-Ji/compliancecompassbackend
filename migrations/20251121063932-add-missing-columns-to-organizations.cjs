'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('organizations');
    
    if (!tableDescription.subdomain) {
      await queryInterface.addColumn('organizations', 'subdomain', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
      await queryInterface.addIndex('organizations', ['subdomain'], {
        unique: true,
        name: 'ux_organizations_subdomain',
      });
    }
    
    if (!tableDescription.created_by) {
      await queryInterface.addColumn('organizations', 'created_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      });
    }
    
    if (!tableDescription.metadata) {
      await queryInterface.addColumn('organizations', 'metadata', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{}',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('organizations');
    
    if (tableDescription.subdomain) {
      try {
        await queryInterface.removeIndex('organizations', 'ux_organizations_subdomain');
      } catch (e) {
        // Index might not exist, ignore
      }
      await queryInterface.removeColumn('organizations', 'subdomain');
    }
    
    if (tableDescription.created_by) {
      await queryInterface.removeColumn('organizations', 'created_by');
    }
    
    if (tableDescription.metadata) {
      await queryInterface.removeColumn('organizations', 'metadata');
    }
  },
};

