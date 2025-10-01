// ============================================
// Routes Budgets avec Controller
// Fichier: routes/budgets.js
// ============================================

const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Routes utilisant le contrôleur
router.get('/budgets', requireAuth, budgetController.index);
router.get('/budgets/create', requireAuth, budgetController.create);
router.post('/budgets', requireAuth, budgetController.store);
router.get('/budgets/:id/edit', requireAuth, budgetController.edit);
router.post('/budgets/:id', requireAuth, budgetController.update);
router.post('/budgets/:id/delete', requireAuth, budgetController.destroy);

module.exports = router;