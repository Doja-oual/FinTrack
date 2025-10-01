
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SavingsGoal = sequelize.define('SavingsGoal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom est obligatoire' },
      len: {
        args: [3, 100],
        msg: 'Le nom doit contenir entre 3 et 100 caractères'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'target_amount',
    validate: {
      min: {
        args: [1],
        msg: 'Le montant cible doit être supérieur à 0'
      }
    }
  },
  currentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    field: 'current_amount',
    validate: {
      min: {
        args: [0],
        msg: 'Le montant actuel ne peut pas être négatif'
      }
    }
  },
  targetDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'target_date'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'paused'),
    defaultValue: 'active',
    allowNull: false,
    validate: {
      isIn: {
        args: [['active', 'completed', 'paused']],
        msg: 'Le statut doit être active, completed ou paused'
      }
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
  }
}, {
  tableName: 'savings_goals',
  timestamps: true,
  underscored: true
});

// Méthode pour calculer le pourcentage de progression
SavingsGoal.prototype.getProgressPercentage = function() {
  return Math.min(100, (this.currentAmount / this.targetAmount) * 100);
};

// Méthode pour calculer le montant restant
SavingsGoal.prototype.getRemainingAmount = function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
};

// Méthode pour calculer les jours restants
SavingsGoal.prototype.getDaysRemaining = function() {
  if (!this.targetDate) return null;
  
  const today = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Méthode pour vérifier si l'objectif est atteint
SavingsGoal.prototype.isGoalReached = function() {
  return this.currentAmount >= this.targetAmount;
};

// Hook pour mettre à jour le statut automatiquement
SavingsGoal.addHook('beforeSave', async (goal) => {
  if (goal.currentAmount >= goal.targetAmount && goal.status !== 'completed') {
    goal.status = 'completed';
  }
});

module.exports = SavingsGoal;