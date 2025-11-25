"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("integrations", "integration_key", {
      type: Sequelize.STRING(255),
      allowNull: true,
      references: {
        model: "integrations_catalog",
        key: "integration_key",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("integrations", "integration_key");
  },
};


