import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { defineBaseModel } from './BaseModel.js';

const Framework = sequelize.define(
  'Framework',
  {
    ...defineBaseModel(sequelize),
    key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'frameworks',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Framework;

