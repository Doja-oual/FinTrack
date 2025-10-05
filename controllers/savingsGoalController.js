const { SavingsGoal } = require('../models');

const savingsGoalController = {
  // 1. Liste des objectifs
  index: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const goals = await SavingsGoal.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      const goalsWithStats = goals.map(goal => ({
        ...goal.toJSON(),
        progress: goal.getProgress(),
        remainingAmount: goal.getRemainingAmount(),
        daysRemaining: goal.getDaysRemaining(),
        recommendedMonthlySaving: goal.getRecommendedMonthlySaving()
      }));

      res.render('savings-goals/index', {
        title: 'Mes Objectifs d\'Épargne',
        goals: goalsWithStats,
        user: req.session.user
      });
    } catch (error) {
      console.error('Erreur index:', error);
      res.redirect('/dashboard');
    }
  },

  // 2. Formulaire de création
  showCreateForm: (req, res) => {
    res.render('savings-goals/create', {
      title: 'Nouvel Objectif d\'Épargne',
      user: req.session.user,
      error: null
    });
  },

  // 3. Créer un objectif
  create: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { name, targetAmount, targetDate, description } = req.body;

      if (!name || !targetAmount) {
        return res.render('savings-goals/create', {
          title: 'Nouvel Objectif d\'Épargne',
          user: req.session.user,
          error: 'Le nom et le montant cible sont obligatoires'
        });
      }

      await SavingsGoal.create({
        userId,
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        targetDate: targetDate || null,
        description: description ? description.trim() : null
      });

      res.redirect('/savings-goals');
    } catch (error) {
      console.error('Erreur create:', error);
      res.render('savings-goals/create', {
        title: 'Nouvel Objectif d\'Épargne',
        user: req.session.user,
        error: 'Erreur lors de la création'
      });
    }
  },

  // 4. Formulaire d'édition
  showEditForm: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const goal = await SavingsGoal.findOne({
        where: { id: req.params.id, userId }
      });

      if (!goal) {
        return res.redirect('/savings-goals');
      }

      res.render('savings-goals/edit', {
        title: 'Modifier l\'Objectif',
        user: req.session.user,
        goal: goal,
        error: null
      });
    } catch (error) {
      console.error('Erreur showEditForm:', error);
      res.redirect('/savings-goals');
    }
  },

  // 5. Mettre à jour
  update: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { name, targetAmount, targetDate, description } = req.body;

      const goal = await SavingsGoal.findOne({
        where: { id: req.params.id, userId }
      });

      if (!goal) {
        return res.redirect('/savings-goals');
      }

      goal.name = name.trim();
      goal.targetAmount = parseFloat(targetAmount);
      goal.targetDate = targetDate || null;
      goal.description = description ? description.trim() : null;
      await goal.save();

      res.redirect('/savings-goals');
    } catch (error) {
      console.error('Erreur update:', error);
      res.redirect('/savings-goals');
    }
  },

  // 6. Supprimer
  delete: async (req, res) => {
    try {
      const userId = req.session.user.id;
      await SavingsGoal.destroy({
        where: { id: req.params.id, userId }
      });
      res.redirect('/savings-goals');
    } catch (error) {
      console.error('Erreur delete:', error);
      res.redirect('/savings-goals');
    }
  },

  // 7. Ajouter de l'argent
  addFunds: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { amount } = req.body;

      const goal = await SavingsGoal.findOne({
        where: { id: req.params.id, userId }
      });

      if (!goal) {
        return res.redirect('/savings-goals');
      }

      goal.currentAmount = parseFloat(goal.currentAmount) + parseFloat(amount);
      
      if (goal.currentAmount >= goal.targetAmount) {
        goal.status = 'completed';
      }

      await goal.save();
      res.redirect('/savings-goals');
    } catch (error) {
      console.error('Erreur addFunds:', error);
      res.redirect('/savings-goals');
    }
  }
};

module.exports = savingsGoalController;