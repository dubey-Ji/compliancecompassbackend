'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('evidence', 'uploaded_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    });
    await queryInterface.changeColumn('evidence', 'file_url', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.addColumn('evidence', 'file_name', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('evidence', 'file_type', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('evidence', 'file_size', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
    await queryInterface.addColumn('evidence', 'file_hash', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('evidence', 'uploaded_ip', {
      type: Sequelize.STRING(45),
      allowNull: true,
    });
    await queryInterface.addColumn('evidence', 'uploaded_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
    await queryInterface.changeColumn('evidence', 'ai_verdict', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: 'not_reviewed',
    });
    await queryInterface.addColumn('evidence', 'ai_confidence', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('evidence', 'ai_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('evidence', 'validated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('evidence', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: '{}',
    });
    await queryInterface.removeColumn('evidence', 'updated_at');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('evidence', 'uploaded_by');
    await queryInterface.changeColumn('evidence', 'file_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.removeColumn('evidence', 'file_name');
    await queryInterface.removeColumn('evidence', 'file_type');
    await queryInterface.removeColumn('evidence', 'file_size');
    await queryInterface.removeColumn('evidence', 'file_hash');
    await queryInterface.removeColumn('evidence', 'uploaded_ip');
    await queryInterface.removeColumn('evidence', 'uploaded_at');
    await queryInterface.changeColumn('evidence', 'ai_verdict', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.removeColumn('evidence', 'ai_confidence');
    await queryInterface.removeColumn('evidence', 'ai_notes');
    await queryInterface.removeColumn('evidence', 'validated_at');
    await queryInterface.removeColumn('evidence', 'metadata');
    await queryInterface.addColumn('evidence', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    });
  },
};

