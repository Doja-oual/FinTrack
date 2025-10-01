// ============================================
// Routes Categories avec Controller
// Fichier: routes/categories.js
// ============================================

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Middleware d'authentification
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Routes utilisant le contrôleur
router.get('/categories', requireAuth, categoryController.index);
router.get('/categories/create', requireAuth, categoryController.create);
router.post('/categories', requireAuth, categoryController.store);
router.get('/categories/:id/edit', requireAuth, categoryController.edit);
router.post('/categories/:id', requireAuth, categoryController.update);
router.post('/categories/:id/delete', requireAuth, categoryController.destroy);

module.exports = router;