const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SavingsGoal = sequelize.define('SavingsGoal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'target_amount'
  },
  currentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'current_amount'
  },
  targetDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'target_date'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'paused'),
    defaultValue: 'active',
    allowNull: false
  }
}, {
  tableName: 'savings_goals',
  timestamps: true,
  underscored: true
});

// Méthodes d'instance
SavingsGoal.prototype.getProgress = function() {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, (this.currentAmount / this.targetAmount) * 100);
};

SavingsGoal.prototype.getRemainingAmount = function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
};

SavingsGoal.prototype.getDaysRemaining = function() {
  if (!this.targetDate) return null;
  const today = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

SavingsGoal.prototype.getRecommendedMonthlySaving = function() {
  const daysRemaining = this.getDaysRemaining();
  if (!daysRemaining || daysRemaining <= 0) return 0;
  
  const monthsRemaining = Math.max(1, daysRemaining / 30);
  return this.getRemainingAmount() / monthsRemaining;
};

SavingsGoal.prototype.isCompleted = function() {
  return this.status === 'completed';
};

module.exports = SavingsGoal;