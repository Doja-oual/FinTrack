'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('savings_goals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      targetAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'target_amount'
      },
      currentAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false,
        field: 'current_amount'
      },
      targetDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        field: 'target_date'
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'paused'),
        defaultValue: 'active',
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });

    await queryInterface.addIndex('savings_goals', ['user_id', 'status']);
    await queryInterface.addIndex('savings_goals', ['target_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('savings_goals');
  }
};