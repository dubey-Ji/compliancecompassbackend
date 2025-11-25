import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { defineBaseModel } from './BaseModel.js';

const AuditLog = sequelize.define(
  'AuditLog',
  {
    ...defineBaseModel(sequelize),
    organization_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    object_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    object_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '{}',
    },
  },
  {
    tableName: 'audit_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default AuditLog;

