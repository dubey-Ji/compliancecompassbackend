import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { defineBaseModel } from './BaseModel.js';

const Vendor = sequelize.define(
  'Vendor',
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
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    service: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    risk_level: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contracts: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    last_reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'vendors',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default Vendor;

