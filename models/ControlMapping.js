import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { defineBaseModel } from './BaseModel.js';

const ControlMapping = sequelize.define(
  'ControlMapping',
  {
    ...defineBaseModel(sequelize),
    control_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'controls',
        key: 'id',
      },
    },
    framework_control_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'framework_controls',
        key: 'id',
      },
    },
  },
  {
    tableName: 'control_mappings',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ControlMapping;

