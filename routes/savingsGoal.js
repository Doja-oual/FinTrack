const express = require('express');
const router = express.Router();
const savingsGoalController = require('../controllers/savingsGoalController');

// Middleware d'authentification
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

router.use(requireAuth);

router.get('/', savingsGoalController.index);
router.get('/create', savingsGoalController.showCreateForm);
router.post('/', savingsGoalController.create);
router.get('/:id/edit', savingsGoalController.showEditForm);
router.post('/:id', savingsGoalController.update);
router.post('/:id/delete', savingsGoalController.delete);
router.post('/:id/add-funds', savingsGoalController.addFunds);

module.exports = router;