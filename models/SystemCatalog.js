import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SystemCatalog = sequelize.define(
  "SystemCatalog",
  {
    system_key: {
      type: DataTypes.STRING(255),
      primaryKey: true,
    },
    display_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ui_icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    properties: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: "systems_catalog",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SystemCatalog;


