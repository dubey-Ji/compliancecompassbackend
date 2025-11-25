import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { defineBaseModel } from "./BaseModel.js";

const Control = sequelize.define(
  "Control",
  {
    ...defineBaseModel(sequelize),
    control_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    evidence_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    evidence_examples: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    automatable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    guidance: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: "{}",
    },
    why_it_matters: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "controls",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Control;
