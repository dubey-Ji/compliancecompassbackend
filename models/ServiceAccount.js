import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { defineBaseModel } from './BaseModel.js';

const ServiceAccount = sequelize.define(
  'ServiceAccount',
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: '{}',
    },
  },
  {
    tableName: 'service_accounts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ServiceAccount;

