const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

  
// ROUTES D'INSCRIPTION
  
router.get('/register', authController.showRegisterForm);
router.post('/register', authController.register);

  
// ROUTES DE CONNEXION
  
router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

  
// ROUTE DE DÉCONNEXION
  
router.get('/logout', authController.logout);

  
// ROUTES DE RÉINITIALISATION DU MOT DE PASSE
  
router.get('/forgot-password', authController.showForgotPasswordForm);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.showResetPasswordForm);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;