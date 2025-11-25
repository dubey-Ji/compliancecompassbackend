import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { defineBaseModel } from './BaseModel.js';

const FrameworkControl = sequelize.define(
  'FrameworkControl',
  {
    ...defineBaseModel(sequelize),
    framework_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'frameworks',
        key: 'id',
      },
    },
    control_code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'framework_controls',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default FrameworkControl;

