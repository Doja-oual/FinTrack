// ============================================
// Routes Transactions avec Controller
// Fichier: routes/transactions.js
// ============================================

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Middleware d'authentification
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Routes utilisant le contrôleur
router.get('/transactions', requireAuth, transactionController.index);
router.get('/transactions/create', requireAuth, transactionController.create);
router.post('/transactions', requireAuth, transactionController.store);
router.get('/transactions/:id/edit', requireAuth, transactionController.edit);
router.post('/transactions/:id', requireAuth, transactionController.update);
router.post('/transactions/:id/delete', requireAuth, transactionController.destroy);

module.exports = router;