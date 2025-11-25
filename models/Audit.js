import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { defineBaseModel } from './BaseModel.js';

const Audit = sequelize.define(
  'Audit',
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
    framework_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'frameworks',
        key: 'id',
      },
    },
  },
  {
    tableName: 'audits',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Audit;

