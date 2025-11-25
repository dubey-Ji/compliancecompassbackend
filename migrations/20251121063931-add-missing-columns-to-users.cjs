'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.name) {
      await queryInterface.addColumn('users', 'name', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    
    if (!tableDescription.password_hash) {
      await queryInterface.addColumn('users', 'password_hash', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    
    if (!tableDescription.role) {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    
    // Change email to VARCHAR(255) if it's not already
    const emailType = tableDescription.email?.type?.toLowerCase();
    if (emailType && (emailType.includes('text') || emailType.includes('blob'))) {
      await queryInterface.changeColumn('users', 'email', {
        type: Sequelize.STRING(255),
        allowNull: false,
      });
    }
    
    // Add unique index on email if it doesn't exist
    try {
      await queryInterface.addIndex('users', ['email'], {
        unique: true,
        name: 'ux_users_email',
      });
    } catch (error) {
      // Index might already exist, ignore the error
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }
    
    // Change organization_id to nullable if it's not already
    if (tableDescription.organization_id && tableDescription.organization_id.allowNull === false) {
      // First, remove the existing foreign key constraint if it exists
      // Query information_schema to find the constraint name
      const [foreignKeys] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'organization_id' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (foreignKeys && foreignKeys.length > 0) {
        const constraintName = foreignKeys[0].CONSTRAINT_NAME;
        await queryInterface.removeConstraint('users', constraintName);
      }
      
      // Change column to allow NULL
      await queryInterface.changeColumn('users', 'organization_id', {
        type: Sequelize.UUID,
        allowNull: true,
      });
      
      // Then add the foreign key constraint with SET NULL
      await queryInterface.addConstraint('users', {
        fields: ['organization_id'],
        type: 'foreign key',
        name: 'users_organization_id_fk',
        references: {
          table: 'organizations',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    
    try {
      await queryInterface.removeIndex('users', 'ux_users_email');
    } catch (e) {
      // Index might not exist, ignore
    }
    
    if (tableDescription.name) {
      await queryInterface.removeColumn('users', 'name');
    }
    
    if (tableDescription.password_hash) {
      await queryInterface.removeColumn('users', 'password_hash');
    }
    
    if (tableDescription.role) {
      await queryInterface.removeColumn('users', 'role');
    }
    
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    
    // Remove the foreign key constraint first
    // Query information_schema to find the constraint name
    const [foreignKeys] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'organization_id' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (foreignKeys && foreignKeys.length > 0) {
      const constraintName = foreignKeys[0].CONSTRAINT_NAME;
      try {
        await queryInterface.removeConstraint('users', constraintName);
      } catch (e) {
        // Constraint might already be removed, ignore
      }
    }
    
    // Change column back to NOT NULL
    await queryInterface.changeColumn('users', 'organization_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    
    // Add foreign key constraint back with CASCADE
    await queryInterface.addConstraint('users', {
      fields: ['organization_id'],
      type: 'foreign key',
      name: 'users_organization_id_fk',
      references: {
        table: 'organizations',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};

