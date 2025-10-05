const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');


const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

router.use(requireAuth);


router.get('/', reportController.index);


router.get('/export-pdf', reportController.exportPDF);

module.exports = router;