import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { defineBaseModel } from './BaseModel.js';

const PrivilegedAccount = sequelize.define(
  'PrivilegedAccount',
  {
    ...defineBaseModel(sequelize),
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
    },
    system_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    account_identifier: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    justification: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    evidence_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'evidence',
        key: 'id',
      },
    },
  },
  {
    tableName: 'privileged_accounts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default PrivilegedAccount;

