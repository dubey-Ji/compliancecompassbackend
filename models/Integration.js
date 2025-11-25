import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { defineBaseModel } from "./BaseModel.js";

const Integration = sequelize.define(
  "Integration",
  {
    ...defineBaseModel(sequelize),
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
    },
    system_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    integration_key: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: "integrations_catalog",
        key: "integration_key",
      },
    },
    integration_type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cred: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: "{}",
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "connected",
    },
  },
  {
    tableName: "integrations",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Integration;
