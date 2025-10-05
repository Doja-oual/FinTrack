const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

router.use(requireAuth);


router.get('/edit', profileController.showEditForm);
router.post('/edit', profileController.updateProfile);

router.get('/change-password', profileController.showChangePasswordForm);
router.post('/change-password', profileController.changePassword);

module.exports = router;