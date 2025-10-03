const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.get('/register', authController.showRegisterForm);
router.post('/register', authController.register);


router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

router.get('/forget-password',authController.ShowForgotPasswordFrom);
router.get('/forget-password',authController.forgotPassword);
router.get('/forget-password/:token',authController.ShowForgotPasswordFrom);
router.get('/forget-password/:token',authController.resetPassword);




router.get('/logout', authController.logout);



module.exports = router;