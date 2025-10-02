
const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');

class TransactionController {
  
  // Liste des transactions
  async index(req, res) {
    try {
      const { type, category, month, year } = req.query;
      
      const where = { userId: req.session.user.id };
      
      if (type) where.type = type;
      if (category) where.categoryId = category;
      
      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        where.date = { [Op.between]: [startDate, endDate] };
      }

      const transactions = await Transaction.findAll({
        where,
        include: [{ model: Category, as: 'category' }],
        order: [['date', 'DESC'], ['createdAt', 'DESC']]
      });

      const categories = await Category.findAll({
        where: { userId: req.session.user.id },
        order: [['name', 'ASC']]
      });

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      res.render('transactions/index', {
        title: 'Mes Transactions',
        user: req.session.user,
        transactions,
        categories,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        filters: { type, category, month, year },
        success: req.query.success || null,
        error: req.query.error || null
      });

    } catch (error) {
      console.error('Erreur liste transactions:', error);
      res.status(500).render('error', {
        title: 'Erreur',
        message: 'Impossible de charger les transactions'
      });
    }
  }

  // Afficher formulaire de création
  async create(req, res) {
    try {
      const categories = await Category.findAll({
        where: { userId: req.session.user.id },
        order: [['type', 'ASC'], ['name', 'ASC']]
      });

      res.render('transactions/create', {
        title: 'Nouvelle Transaction',
        user: req.session.user,
        categories,
        error: null
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.redirect('/transactions?error=Erreur lors du chargement');
    }
  }

  // Enregistrer une transaction
  async store(req, res) {
    try {
      const { type, amount, description, date, categoryId } = req.body;

      if (!type || !amount || !date || !categoryId) {
        const categories = await Category.findAll({
          where: { userId: req.session.user.id }
        });
        return res.render('transactions/create', {
          title: 'Nouvelle Transaction',
          user: req.session.user,
          categories,
          error: 'Tous les champs obligatoires doivent être remplis'
        });
      }

      await Transaction.create({
        type,
        amount: parseFloat(amount),
        description: description || null,
        date,
        categoryId: parseInt(categoryId),
        userId: req.session.user.id
      });

      console.log('Transaction créée:', { type, amount, date });
      res.redirect('/transactions?success=Transaction créée avec succès');

    } catch (error) {
      console.error('Erreur création:', error);
      res.redirect('/transactions/create?error=' + error.message);
    }
  }

  // Afficher formulaire d'édition
  async edit(req, res) {
    try {
      const transaction = await Transaction.findOne({
        where: { 
          id: req.params.id,
          userId: req.session.user.id 
        },
        include: [{ model: Category, as: 'category' }]
      });

      if (!transaction) {
        return res.redirect('/transactions?error=Transaction introuvable');
      }

      const categories = await Category.findAll({
        where: { userId: req.session.user.id },
        order: [['type', 'ASC'], ['name', 'ASC']]
      });

      res.render('transactions/edit', {
        title: 'Modifier Transaction',
        user: req.session.user,
        transaction,
        categories,
        error: null
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.redirect('/transactions?error=Erreur');
    }
  }

  // Mettre à jour une transaction
  async update(req, res) {
    try {
      const transaction = await Transaction.findOne({
        where: { 
          id: req.params.id,
          userId: req.session.user.id 
        }
      });

      if (!transaction) {
        return res.redirect('/transactions?error=Transaction introuvable');
      }

      const { type, amount, description, date, categoryId } = req.body;

      await transaction.update({
        type,
        amount: parseFloat(amount),
        description: description || null,
        date,
        categoryId: parseInt(categoryId)
      });

      console.log('Transaction mise à jour:', transaction.id);
      res.redirect('/transactions?success=Transaction modifiée avec succès');

    } catch (error) {
      console.error('Erreur modification:', error);
      res.redirect('/transactions?error=Erreur');
    }
  }

  // Supprimer une transaction
  async destroy(req, res) {
    try {
      const transaction = await Transaction.findOne({
        where: { 
          id: req.params.id,
          userId: req.session.user.id 
        }
      });

      if (!transaction) {
        return res.redirect('/transactions?error=Transaction introuvable');
      }

      await transaction.destroy();
      console.log('Transaction supprimée:', transaction.id);
      res.redirect('/transactions?success=Transaction supprimée avec succès');

    } catch (error) {
      console.error('Erreur suppression:', error);
      res.redirect('/transactions?error=Erreur');
    }
  }
}

module.exports = new TransactionController();