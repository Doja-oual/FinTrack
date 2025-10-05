// migrations/XXXXXXXXX-add-reset-password-fields.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'reset_password_token', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'is_active'
    });

    await queryInterface.addColumn('users', 'reset_password_expires', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'reset_password_token'
    });

    console.log('✅ Colonnes reset_password_token et reset_password_expires ajoutées');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'reset_password_token');
    await queryInterface.removeColumn('users', 'reset_password_expires');
    
    console.log('✅ Colonnes reset_password_token et reset_password_expires supprimées');
  }
};