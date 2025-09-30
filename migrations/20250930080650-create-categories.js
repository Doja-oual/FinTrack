'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,  // CORRIGÉ: était "autIncrement"
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('income', 'expense'),
        allowNull: false
      },
      icon: {
        type: Sequelize.STRING(50),
        defaultValue: 'fa-folder',
        allowNull: false
      },
      color: {
        type: Sequelize.STRING(7),
        defaultValue: '#6c757d',
        allowNull: false
      },
      // SUPPRIMÉ: doublon de color
      user_id: {  // CORRIGÉ: directement user_id
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_default: {  // CORRIGÉ: directement is_default
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      created_at: {  // CORRIGÉ: directement created_at
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {  // CORRIGÉ: directement updated_at
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('categories', ['user_id', 'name']);
    await queryInterface.addIndex('categories', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('categories');
  }
};