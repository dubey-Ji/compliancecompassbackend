"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("systems_catalog", {
      system_key: {
        type: Sequelize.STRING(255),
        primaryKey: true,
      },
      display_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ui_icon: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      properties: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: Sequelize.literal("(JSON_OBJECT())"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
    await queryInterface.addIndex("systems_catalog", ["category"], {
      name: "ix_systems_catalog_category",
    });

    await queryInterface.createTable("integrations_catalog", {
      integration_key: {
        type: Sequelize.STRING(255),
        primaryKey: true,
      },
      system_key: {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
          model: "systems_catalog",
          key: "system_key",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      display_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      supports_automated_checks: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      required_scopes: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: Sequelize.literal("(JSON_ARRAY())"),
      },
      auth_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "oauth",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      recommended: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
    await queryInterface.addIndex("integrations_catalog", ["system_key"], {
      name: "ix_integrations_catalog_system_key",
    });
    await queryInterface.addIndex(
      "integrations_catalog",
      ["supports_automated_checks"],
      {
        name: "ix_integrations_catalog_supports_auto",
      }
    );

    await queryInterface.createTable("control_system_mapping", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      control_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "controls",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      system_key: {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
          model: "systems_catalog",
          key: "system_key",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      integration_key: {
        type: Sequelize.STRING(255),
        allowNull: true,
        references: {
          model: "integrations_catalog",
          key: "integration_key",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      automatable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      instruction: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: Sequelize.literal("(JSON_OBJECT())"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
    await queryInterface.addIndex("control_system_mapping", ["control_id"], {
      name: "ix_csm_control_id",
    });
    await queryInterface.addIndex("control_system_mapping", ["system_key"], {
      name: "ix_csm_system_key",
    });
    await queryInterface.addIndex(
      "control_system_mapping",
      ["control_id", "system_key"],
      {
        unique: true,
        name: "ux_csm_control_system",
      }
    );

    await queryInterface.createTable("onboarding_steps", {
      id: {
        type: Sequelize.STRING(255),
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      options: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      step_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      help_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
    await queryInterface.addIndex("onboarding_steps", ["step_order"], {
      name: "ix_onboarding_steps_order",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "onboarding_steps",
      "ix_onboarding_steps_order"
    );
    await queryInterface.dropTable("onboarding_steps");

    await queryInterface.removeIndex(
      "control_system_mapping",
      "ux_csm_control_system"
    );
    await queryInterface.removeIndex(
      "control_system_mapping",
      "ix_csm_system_key"
    );
    await queryInterface.removeIndex(
      "control_system_mapping",
      "ix_csm_control_id"
    );
    await queryInterface.dropTable("control_system_mapping");

    await queryInterface.removeIndex(
      "integrations_catalog",
      "ix_integrations_catalog_supports_auto"
    );
    await queryInterface.removeIndex(
      "integrations_catalog",
      "ix_integrations_catalog_system_key"
    );
    await queryInterface.dropTable("integrations_catalog");

    await queryInterface.removeIndex(
      "systems_catalog",
      "ix_systems_catalog_category"
    );
    await queryInterface.dropTable("systems_catalog");
  },
};
