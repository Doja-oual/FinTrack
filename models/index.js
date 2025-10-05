
const { sequelize, testConnection } = require('../config/database');
const User = require('./User');
const SavingsGoal = require('./SavingsGoal');
const Category = require('./Category');
const Transaction = require('./Transaction');
const Budget = require('./Budget');



// Relations User
User.hasMany(Category, { 
  foreignKey: 'userId', 
  as: 'categories', 
  onDelete: 'CASCADE' 
});

User.hasMany(Transaction, { 
  foreignKey: 'userId', 
  as: 'transactions', 
  onDelete: 'CASCADE' 
});

User.hasMany(Budget, { 
  foreignKey: 'userId', 
  as: 'budgets', 
  onDelete: 'CASCADE' 
});

User.hasMany(SavingsGoal, { 
  foreignKey: 'userId', 
  as: 'savingsGoals', 
  onDelete: 'CASCADE' 
});

// Relations Category
Category.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Category.hasMany(Transaction, { 
  foreignKey: 'categoryId', 
  as: 'transactions' 
});

Category.hasMany(Budget, { 
  foreignKey: 'categoryId', 
  as: 'budgets' 
});

// Relations Transaction
Transaction.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Transaction.belongsTo(Category, { 
  foreignKey: 'categoryId', 
  as: 'category' 
});

// Relations Budget
Budget.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Budget.belongsTo(Category, { 
  foreignKey: 'categoryId', 
  as: 'category' 
});

// Relations SavingsGoal
SavingsGoal.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});


const syncDatabase = async () => {
  try {
    console.log(' Synchronisation des modèles Sequelize...');
    
    // Ne pas modifier la structure des tables (elles existent déjà via migrations)
    await sequelize.sync({ alter: false });
    
    console.log(' Modèles Sequelize synchronisés');
    console.log(' Modèles disponibles:');
    console.log('   - User');
    console.log('   - Category');
    console.log('   - Transaction');
    console.log('   - Budget');
    console.log('   - SavingsGoal');
    
    // Statistiques
    const stats = await Promise.all([
      User.count(),
      Category.count(),
      Transaction.count(),
      Budget.count(),
      SavingsGoal.count()
    ]);
    
    console.log('\n Statistiques:');
    console.log(`    Utilisateurs: ${stats[0]}`);
    console.log(`     Catégories: ${stats[1]}`);
    console.log(`    Transactions: ${stats[2]}`);
    console.log(`    Budgets: ${stats[3]}`);
    console.log(`    Objectifs: ${stats[4]}`);
    
  } catch (error) {
    console.error(' Erreur synchronisation:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  User,
  SavingsGoal,
  Category,
  Transaction,
  Budget

};