import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { defineBaseModel } from "./BaseModel.js";

const SystemUsed = sequelize.define(
  "SystemUsed",
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
    display_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    value: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: "{}",
    },
    connected_integration_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "integrations",
        key: "id",
      },
    },
  },
  {
    tableName: "systems_used",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SystemUsed;
