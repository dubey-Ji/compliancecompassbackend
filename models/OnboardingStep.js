import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const OnboardingStep = sequelize.define(
  "OnboardingStep",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    step_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    help_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "onboarding_steps",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default OnboardingStep;


