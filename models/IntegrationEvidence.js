import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { defineBaseModel } from "./BaseModel.js";

const IntegrationEvidence = sequelize.define(
  "IntegrationEvidence",
  {
    ...defineBaseModel(sequelize),
    integration_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "integrations",
        key: "id",
      },
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "projects",
        key: "id",
      },
    },
    control_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "controls",
        key: "id",
      },
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    raw_result: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    checked_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "integration_evidence",
    underscored: true,
    timestamps: false,
  }
);

export default IntegrationEvidence;
