import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { defineBaseModel } from "./BaseModel.js";

const Evidence = sequelize.define(
  "Evidence",
  {
    ...defineBaseModel(sequelize),
    project_control_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "project_controls",
        key: "id",
      },
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    file_hash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    uploaded_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    ai_verdict: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "not_reviewed",
    },
    ai_confidence: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    ai_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    validated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: "{}",
    },
  },
  {
    tableName: "evidence",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Evidence;
