// Dans app.js, ajoutez cette route dashboard
app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const { Transaction, Budget, Category } = require('./models');
    const { Op } = require('sequelize');
    
    // Date actuelle
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Transactions du mois
    const transactions = await Transaction.findAll({
      where: {
        userId: req.session.user.id,
        date: { [Op.between]: [firstDay, lastDay] }
      },
      include: [{ model: Category, as: 'category' }],
      order: [['date', 'DESC']]
    });
    
    // Calculs
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = totalIncome - totalExpense;
    
    // Budgets du mois
    const budgets = await Budget.findAll({
      where: {
        userId: req.session.user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      },
      include: [{ model: Category, as: 'category' }]
    });
    
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
      recentBudgets: budgets
    });
    
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).send('Erreur lors du chargement du dashboard');
  }
});