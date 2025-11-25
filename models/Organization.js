import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { defineBaseModel } from "./BaseModel.js";

const Organization = sequelize.define(
  "Organization",
  {
    ...defineBaseModel(sequelize),
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subdomain: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: "{}",
    },
  },
  {
    tableName: "organizations",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Organization;
