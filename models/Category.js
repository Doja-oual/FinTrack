
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'name',
    validate: {
      notEmpty: { msg: 'Le nom de la catégorie est obligatoire' },
      len: {
        args: [2, 50],
        msg: 'Le nom doit contenir entre 2 et 50 caractères'
      }
    }
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['income', 'expense']],
        msg: 'Le type doit être "income" ou "expense"'
      }
    }
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#007bff',
    validate: {
      is: {
        args: /^#[0-9A-F]{6}$/i,
        msg: 'La couleur doit être au format hexadécimal (#RRGGBB)'
      }
    }
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'fas fa-tag'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'user_id']
    }
  ]
});

module.exports = Category;