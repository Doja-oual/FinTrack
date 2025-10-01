
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'Le montant doit être supérieur à 0'
      }
    }
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2020,
      max: 2050
    }
  },
  alertThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 80,
    allowNull: false,
    field: 'alert_threshold',
    validate: {
      min: 0,
      max: 100
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'budgets',
  timestamps: true,
  underscored: true
});

// Méthode pour calculer le pourcentage d'utilisation
Budget.prototype.getUsagePercentage = async function() {
  const Transaction = require('./Transaction');
  const { Op } = require('sequelize');
  
  const startDate = new Date(this.year, this.month - 1, 1);
  const endDate = new Date(this.year, this.month, 0);
  
  const spent = await Transaction.sum('amount', {
    where: {
      categoryId: this.categoryId,
      userId: this.userId,
      type: 'expense',
      date: {
        [Op.between]: [startDate, endDate]
      }
    }
  }) || 0;
  
  return Math.min(100, (spent / this.amount) * 100);
};

// Méthode pour vérifier si le seuil d'alerte est dépassé
Budget.prototype.isAlertThresholdExceeded = async function() {
  const usage = await this.getUsagePercentage();
  return usage >= this.alertThreshold;
};

module.exports = Budget;