const { Transaction, Category, Budget, SavingsGoal } = require('../models');
const { Op } = require('sequelize');

const dashboardController = {
  index: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Transactions du mois
      const transactions = await Transaction.findAll({
        where: {
          userId,
          date: { [Op.between]: [firstDay, lastDay] }
        },
        include: [{ model: Category, as: 'category' }],
        order: [['date', 'DESC']]
      });

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const balance = totalIncome - totalExpense;

      // Budgets du mois
      const budgets = await Budget.findAll({
        where: {
          userId,
          month: now.getMonth() + 1,
          year: now.getFullYear()
        },
        include: [{ model: Category, as: 'category' }]
      });

      const budgetsWithStats = await Promise.all(budgets.map(async (budget) => {
        const spent = await Transaction.sum('amount', {
          where: {
            categoryId: budget.categoryId,
            userId,
            type: 'expense',
            date: { [Op.between]: [firstDay, lastDay] }
          }
        }) || 0;

        const percentage = (spent / budget.amount) * 100;

        return {
          ...budget.toJSON(),
          spent,
          percentage,
          isOverBudget: spent > budget.amount,
          isNearLimit: percentage >= budget.alertThreshold
        };
      }));

      // Objectifs d'épargne
      const savingsGoals = await SavingsGoal.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      const goalsWithStats = savingsGoals.map(goal => ({
        ...goal.toJSON(),
        progress: goal.getProgress(),
        remainingAmount: goal.getRemainingAmount(),
        daysRemaining: goal.getDaysRemaining()
      }));

      // Données pour graphiques
      const balanceData = await getBalanceEvolution(userId, 6);
      const expensesByCategory = await getExpensesByCategory(userId, now);
      const incomeVsExpense = await getIncomeVsExpense(userId, 6);
      const goalsProgress = savingsGoals.map(goal => ({
        name: goal.name,
        progress: goal.getProgress(),
        status: goal.status
      }));

      res.render('dashboard/index', {
        title: 'Dashboard',
        user: req.session.user,
        totalIncome,
        totalExpense,
        balance,
        incomeCount: transactions.filter(t => t.type === 'income').length,
        expenseCount: transactions.filter(t => t.type === 'expense').length,
        budgetCount: budgets.length,
        recentTransactions: transactions.slice(0, 5),
        recentBudgets: budgetsWithStats,
        savingsGoals: goalsWithStats,
        chartData: {
          balanceEvolution: balanceData,
          expensesByCategory: expensesByCategory,
          incomeVsExpense: incomeVsExpense,
          goalsProgress: goalsProgress
        }
      });

    } catch (error) {
      console.error('Erreur dashboard:', error);
      res.status(500).send('Erreur: ' + error.message);
    }
  }
};

// Fonctions helper
async function getBalanceEvolution(userId, months) {
  const data = { labels: [], values: [] };
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const transactions = await Transaction.findAll({
      where: { userId, date: { [Op.lte]: lastDay } }
    });

    const income = transactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    data.labels.push(date.toLocaleDateString('fr-FR', { month: 'short' }));
    data.values.push(income - expense);
  }
  return data;
}

async function getExpensesByCategory(userId, date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const transactions = await Transaction.findAll({
    where: {
      userId,
      type: 'expense',
      date: { [Op.between]: [firstDay, lastDay] }
    },
    include: [{ model: Category, as: 'category' }]
  });

  const categoryTotals = {};
  const categoryColors = {};

  transactions.forEach(t => {
    if (t.category) {
      categoryTotals[t.category.name] = (categoryTotals[t.category.name] || 0) + parseFloat(t.amount);
      categoryColors[t.category.name] = t.category.color;
    }
  });

  return {
    labels: Object.keys(categoryTotals),
    values: Object.values(categoryTotals),
    colors: Object.values(categoryColors)
  };
}

async function getIncomeVsExpense(userId, months) {
  const data = { labels: [], income: [], expense: [] };

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const transactions = await Transaction.findAll({
      where: { userId, date: { [Op.between]: [firstDay, lastDay] } }
    });

    const income = transactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    data.labels.push(date.toLocaleDateString('fr-FR', { month: 'short' }));
    data.income.push(income);
    data.expense.push(expense);
  }
  return data;
}

module.exports = dashboardController;