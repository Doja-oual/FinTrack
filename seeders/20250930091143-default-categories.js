'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const defaultCategories = [
      // Catégories de dépenses
      {
        name: 'Alimentation',
        type: 'expense',
        icon: 'fa-utensils',
        color: '#28a745',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Transport',
        type: 'expense',
        icon: 'fa-car',
        color: '#007bff',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Logement',
        type: 'expense',
        icon: 'fa-home',
        color: '#6f42c1',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Santé',
        type: 'expense',
        icon: 'fa-heartbeat',
        color: '#dc3545',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Loisirs',
        type: 'expense',
        icon: 'fa-gamepad',
        color: '#fd7e14',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Shopping',
        type: 'expense',
        icon: 'fa-shopping-bag',
        color: '#e83e8c',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Éducation',
        type: 'expense',
        icon: 'fa-graduation-cap',
        color: '#17a2b8',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Services',
        type: 'expense',
        icon: 'fa-wrench',
        color: '#6c757d',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Assurance',
        type: 'expense',
        icon: 'fa-shield-alt',
        color: '#20c997',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Autres Dépenses',
        type: 'expense',
        icon: 'fa-ellipsis-h',
        color: '#868e96',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Catégories de revenus
      {
        name: 'Salaire',
        type: 'income',
        icon: 'fa-money-bill-wave',
        color: '#28a745',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Freelance',
        type: 'income',
        icon: 'fa-laptop-code',
        color: '#17a2b8',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Investissements',
        type: 'income',
        icon: 'fa-chart-line',
        color: '#ffc107',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cadeaux',
        type: 'income',
        icon: 'fa-gift',
        color: '#e83e8c',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Autres Revenus',
        type: 'income',
        icon: 'fa-plus-circle',
        color: '#20c997',
        user_id: null,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('categories', defaultCategories, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', { is_default: true }, {});
  }
};