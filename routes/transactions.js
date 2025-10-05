const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Middleware auth
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

router.use(requireAuth);

// Routes
router.get('/', transactionController.index.bind(transactionController));
router.get('/create', transactionController.create.bind(transactionController));
router.get('/export', transactionController.exportCSV.bind(transactionController)); // ⚠️ AVANT /:id
router.post('/', transactionController.store.bind(transactionController));
router.get('/:id/edit', transactionController.edit.bind(transactionController));
router.post('/:id', transactionController.update.bind(transactionController));
router.post('/:id/delete', transactionController.destroy.bind(transactionController));

module.exports = router;