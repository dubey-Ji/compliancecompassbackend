'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('systems_used', 'display_name', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('systems_used', 'value', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '{}',
    });
    await queryInterface.addColumn('systems_used', 'connected_integration_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'integrations',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('systems_used', 'display_name');
    await queryInterface.removeColumn('systems_used', 'value');
    await queryInterface.removeColumn('systems_used', 'connected_integration_id');
  },
};

