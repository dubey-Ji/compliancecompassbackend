'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('controls');
    
    if (!tableDescription.title) {
      await queryInterface.addColumn('controls', 'title', {
        type: Sequelize.TEXT,
        allowNull: false,
      });
    }
    if (!tableDescription.description) {
      await queryInterface.addColumn('controls', 'description', {
        type: Sequelize.TEXT,
        allowNull: false,
      });
    }
    if (!tableDescription.severity) {
      await queryInterface.addColumn('controls', 'severity', {
        type: Sequelize.TEXT,
        allowNull: false,
      });
    }
    if (!tableDescription.evidence_type) {
      await queryInterface.addColumn('controls', 'evidence_type', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!tableDescription.evidence_examples) {
      await queryInterface.addColumn('controls', 'evidence_examples', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!tableDescription.frequency) {
      await queryInterface.addColumn('controls', 'frequency', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!tableDescription.automatable) {
      await queryInterface.addColumn('controls', 'automatable', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
    }
    if (!tableDescription.guidance) {
      await queryInterface.addColumn('controls', 'guidance', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{}',
      });
    }
    // Change control_key to VARCHAR and add unique index
    const controlKeyType = tableDescription.control_key?.type?.toLowerCase();
    if (controlKeyType && (controlKeyType.includes('text') || controlKeyType.includes('blob'))) {
      await queryInterface.changeColumn('controls', 'control_key', {
        type: Sequelize.STRING(255),
        allowNull: false,
      });
    }
    
    // Add unique index on control_key if it doesn't exist
    try {
      await queryInterface.addIndex('controls', ['control_key'], {
        unique: true,
        name: 'ux_controls_control_key',
      });
    } catch (error) {
      // Index might already exist, ignore the error
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('controls');
    
    if (tableDescription.title) {
      await queryInterface.removeColumn('controls', 'title');
    }
    if (tableDescription.description) {
      await queryInterface.removeColumn('controls', 'description');
    }
    if (tableDescription.severity) {
      await queryInterface.removeColumn('controls', 'severity');
    }
    if (tableDescription.evidence_type) {
      await queryInterface.removeColumn('controls', 'evidence_type');
    }
    if (tableDescription.evidence_examples) {
      await queryInterface.removeColumn('controls', 'evidence_examples');
    }
    if (tableDescription.frequency) {
      await queryInterface.removeColumn('controls', 'frequency');
    }
    if (tableDescription.automatable) {
      await queryInterface.removeColumn('controls', 'automatable');
    }
    if (tableDescription.guidance) {
      await queryInterface.removeColumn('controls', 'guidance');
    }
    
    // Remove unique index
    try {
      await queryInterface.removeIndex('controls', 'ux_controls_control_key');
    } catch (e) {
      // Index might not exist, ignore
    }
    
    // Change control_key back to TEXT
    await queryInterface.changeColumn('controls', 'control_key', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};

