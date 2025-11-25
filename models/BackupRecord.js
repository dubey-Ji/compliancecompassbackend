import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { defineBaseModel } from './BaseModel.js';

const BackupRecord = sequelize.define(
  'BackupRecord',
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
    project_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    system_key: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    backup_config: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    last_backup_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_restore_test_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    restore_test_result: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'backup_records',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default BackupRecord;

