// ============================================
// Budget Controller
// Fichier: controllers/budgetController.js
// ============================================

const { Budget, Category, Transaction } = require('../models');
const { Op } = require('sequelize');

class BudgetController {
  
  // Liste des budgets
  async index(req, res) {
    try {
      const currentDate = new Date();
      const currentMonth = req.query.month || currentDate.getMonth() + 1;
      const currentYear = req.query.year || currentDate.getFullYear();

      const budgets = await Budget.findAll({
        where: {
          userId: req.session.user.id,
          month: currentMonth,
          year: currentYear
        },
        include: [{ model: Category, as: 'category' }],
        order: [['createdAt', 'DESC']]
      });

      const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0);

        const spent = await Transaction.sum('amount', {
          where: {
            categoryId: budget.categoryId,
            userId: req.session.user.id,
            type: 'expense',
            date: { [Op.between]: [startDate, endDate] }
          }
        }) || 0;

        const percentage = Math.min(100, (spent / budget.amount) * 100);

        return {
          ...budget.toJSON(),
          spent,
          percentage,
          remaining: budget.amount - spent,
          isOverBudget: spent > budget.amount,
          isNearLimit: percentage >= budget.alertThreshold
        };
      }));

      res.render('budgets/index', {
        title: 'Mes Budgets',
        user: req.session.user,
        budgets: budgetsWithSpent,
        currentMonth,
        currentYear,
        success: req.query.success || null,
        error: req.query.error || null
      });

    } catch (error) {
      console.error('Erreur liste budgets:', error);
      res.status(500).render('error', {
        title: 'Erreur',
        message: 'Impossible de charger les budgets'
      });
    }
  }

  // Afficher formulaire de création
  async create(req, res) {
    try {
      const categories = await Category.findAll({
        where: { 
          userId: req.session.user.id,
          type: 'expense'
        },
        order: [['name', 'ASC']]
      });

      res.render('budgets/create', {
        title: 'Nouveau Budget',
        user: req.session.user,
        categories,
        error: null
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.redirect('/budgets?error=Erreur lors du chargement');
    }
  }

  // Enregistrer un budget
  async store(req, res) {
    try {
      const { amount, month, year, categoryId, alertThreshold } = req.body;

      const existing = await Budget.findOne({
        where: {
          userId: req.session.user.id,
          categoryId,
          month,
          year
        }
      });

      if (existing) {
        return res.redirect('/budgets/create?error=Un budget existe déjà pour cette catégorie ce mois-ci');
      }

      await Budget.create({
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        categoryId: parseInt(categoryId),
        alertThreshold: parseInt(alertThreshold) || 80,
        userId: req.session.user.id
      });

      res.redirect('/budgets?success=Budget créé avec succès');

    } catch (error) {
      console.error('Erreur création:', error);
      res.redirect('/budgets/create?error=' + error.message);
    }
  }

  // Afficher formulaire d'édition
  async edit(req, res) {
    try {
      const budget = await Budget.findOne({
        where: { 
          id: req.params.id,
          userId: req.session.user.id 
        },
        include: [{ model: Category, as: 'category' }]
      });

      if (!budget) {
        return res.redirect('/budgets?error=Budget introuvable');
      }

      const categories = await Category.findAll({
        where: { 
          userId: req.session.user.id,
          type: 'expense'
        }
      });

      res.render('budgets/edit', {
        title: 'Modifier Budget',
        user: req.session.user,
        budget,
        categories,
        error: null
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.redirect('/budgets?error=Erreur');
    }
  }

  // Mettre à jour un budget
  async update(req, res) {
    try {
      const budget = await Budget.findOne({
        where: { 
          id: req.params.id,
          userId: req.session.user.id 
        }
      });

      if (!budget) {
        return res.redirect('/budgets?error=Budget introuvable');
      }

      const { amount, alertThreshold } = req.body;

      await budget.update({
        amount: parseFloat(amount),
        alertThreshold: parseInt(alertThreshold) || 80
      });

      res.redirect('/budgets?success=Budget modifié avec succès');

    } catch (error) {
      console.error('Erreur modification:', error);
      res.redirect('/budgets?error=Erreur');
    }
  }

  // Supprimer un budget
  async destroy(req, res) {
    try {
      const budget = await Budget.findOne({
        where: { 
          id: req.params.id,
          userId: req.session.user.id 
        }
      });

      if (!budget) {
        return res.redirect('/budgets?error=Budget introuvable');
      }

      await budget.destroy();
      res.redirect('/budgets?success=Budget supprimé avec succès');

    } catch (error) {
      console.error('Erreur suppression:', error);
      res.redirect('/budgets?error=Erreur');
    }
  }
}

module.exports = new BudgetController();