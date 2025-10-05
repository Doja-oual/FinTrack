const { User } = require('../models');
const { sendPasswordResetEmail } = require('../services/emailService');
const crypto = require('crypto');
const { Op } = require('sequelize');

const authController = {
  showRegisterForm: (req, res) => {
    res.render('register', {
      title: 'Inscription',
      error: null,
      success: null
    });
  },

  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password, confirmPassword } = req.body;

      if (!firstName || !email || !password) {
        return res.render('register', {
          title: 'Inscription',
          error: 'Tous les champs obligatoires doivent être remplis',
          success: null
        });
      }

      if (password.length < 6) {
        return res.render('register', {
          title: 'Inscription',
          error: 'Le mot de passe doit contenir au moins 6 caractères',
          success: null
        });
      }

      if (password !== confirmPassword) {
        return res.render('register', {
          title: 'Inscription',
          error: 'Les mots de passe ne correspondent pas',
          success: null
        });
      }

      const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (existingUser) {
        return res.render('register', {
          title: 'Inscription',
          error: 'Cet email est déjà utilisé',
          success: null
        });
      }

      const userData = {
        firstName: firstName.trim(),
        lastName: lastName ? lastName.trim() : null,
        email: email.toLowerCase().trim(),
        password: password,
        currency: 'MAD',
        isActive: true
      };

      await User.create(userData);

      return res.render('login', {
        title: 'Connexion',
        error: null,
        success: '    Inscription réussie ! Vous pouvez maintenant vous connecter.'
      });

    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errorMessages = error.errors.map(e => e.message).join(', ');
        return res.render('register', {
          title: 'Inscription',
          error: errorMessages,
          success: null
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.render('register', {
          title: 'Inscription',
          error: 'Cet email est déjà utilisé',
          success: null
        });
      }

      return res.render('register', {
        title: 'Inscription',
        error: 'Une erreur est survenue lors de l\'inscription. Détails: ' + error.message,
        success: null
      });
    }
  },

  showLoginForm: (req, res) => {
    res.render('login', {
      title: 'Connexion',
      error: null,
      success: null
    });
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.render('login', {
          title: 'Connexion',
          error: 'Email et mot de passe obligatoires',
          success: null
        });
      }

      const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (!user || !(await user.checkPassword(password))) {
        return res.render('login', {
          title: 'Connexion',
          error: 'Email ou mot de passe incorrect',
          success: null
        });
      }

      if (!user.isActive) {
        return res.render('login', {
          title: 'Connexion',
          error: 'Votre compte a été désactivé',
          success: null
        });
      }

      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        currency: user.currency
      };

      res.redirect('/dashboard');

    } catch (error) {
      res.render('login', {
        title: 'Connexion',
        error: 'Une erreur est survenue. Veuillez réessayer.',
        success: null
      });
    }
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.redirect('/dashboard');
      res.redirect('/');
    });
  },

  showForgotPasswordForm: (req, res) => {
    res.render('forgot-password', {
      title: 'Mot de passe oublié',
      error: null,
      success: null
    });
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.render('forgot-password', {
          title: 'Mot de passe oublié',
          error: 'Veuillez saisir votre email',
          success: null
        });
      }

      const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (user) {
        const resetToken = await user.generatePasswordResetToken();
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        await sendPasswordResetEmail(user.email, resetUrl);
      }

      return res.render('forgot-password', {
        title: 'Mot de passe oublié',
        error: null,
        success: '    Si cet email existe, vous recevrez un lien de réinitialisation.'
      });

    } catch (error) {
      return res.render('forgot-password', {
        title: 'Mot de passe oublié',
        error: 'Une erreur est survenue. Veuillez réessayer.',
        success: null
      });
    }
  },   

  showResetPasswordForm: async (req, res) => {
    try {
      const { token } = req.params;
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { [Op.gt]: Date.now() }
        }
      });

      if (!user) {
        return res.render('reset-password', {
          title: 'Réinitialiser le mot de passe',
          error: 'Ce lien est invalide ou a expiré',
          success: null,
          token: null
        });
      }

      res.render('reset-password', {
        title: 'Réinitialiser le mot de passe',
        error: null,
        success: null,
        token
      });

    } catch (error) {
      res.render('reset-password', {
        title: 'Réinitialiser le mot de passe',
        error: 'Une erreur est survenue',
        success: null,
        token: null
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      if (!password || !confirmPassword) {
        return res.render('reset-password', {
          title: 'Réinitialiser le mot de passe',
          error: 'Tous les champs sont obligatoires',
          success: null,
          token
        });
      }

      if (password.length < 6) {
        return res.render('reset-password', {
          title: 'Réinitialiser le mot de passe',
          error: 'Le mot de passe doit contenir au moins 6 caractères',
          success: null,
          token
        });
      }

      if (password !== confirmPassword) {
        return res.render('reset-password', {
          title: 'Réinitialiser le mot de passe',
          error: 'Les mots de passe ne correspondent pas',
          success: null,
          token
        });
      }

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { [Op.gt]: Date.now() }
        }
      });

      if (!user) {
        return res.render('reset-password', {
          title: 'Réinitialiser le mot de passe',
          error: 'Ce lien est invalide ou a expiré',
          success: null,
          token: null
        });
      }

      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.render('login', {
        title: 'Connexion',
        error: null,
        success: ' Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.'
      });

    } catch (error) {
      return res.render('reset-password', {
        title: 'Réinitialiser le mot de passe',
        error: 'Une erreur est survenue. Veuillez réessayer.',
        success: null,
        token: req.params.token
      });
    }
  }
};

module.exports = authController;
