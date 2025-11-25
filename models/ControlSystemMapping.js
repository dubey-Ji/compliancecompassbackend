import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ControlSystemMapping = sequelize.define(
  "ControlSystemMapping",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    control_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    system_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    integration_key: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    automatable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    instruction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: "control_system_mapping",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ControlSystemMapping;


