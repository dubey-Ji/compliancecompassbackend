import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const IntegrationCatalog = sequelize.define(
  "IntegrationCatalog",
  {
    integration_key: {
      type: DataTypes.STRING(255),
      primaryKey: true,
    },
    system_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    display_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    supports_automated_checks: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    required_scopes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    auth_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "oauth",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recommended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "integrations_catalog",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default IntegrationCatalog;


