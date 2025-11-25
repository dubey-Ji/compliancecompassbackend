import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { defineBaseModel } from "./BaseModel.js";

const ProjectControl = sequelize.define(
  "ProjectControl",
  {
    ...defineBaseModel(sequelize),
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
    },
    control_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "controls",
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "not_started",
    },
    machine_verdict: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "unknown",
    },
    machine_verdict_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    owner_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    last_answered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_validated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "project_controls",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ProjectControl;
