const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

  

  
router.get('/register', authController.showRegisterForm);
router.post('/register', authController.register);

  

  
router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

  

  
router.get('/logout', authController.logout);

  

  
router.get('/forgot-password', authController.showForgotPasswordForm);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.showResetPasswordForm);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;