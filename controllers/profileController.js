const { User } = require('../models');

const profileController = {

  showEditForm: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.redirect('/login');
      }

      res.render('profile/edit', {
        title: 'Modifier mon profil',
        user: user,
        error: null,
        success: null
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.redirect('/dashboard');
    }
  },

  
  updateProfile: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { firstName, lastName, email, currency } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.redirect('/login');
      }

      if (email !== user.email) {
        const existingUser = await User.findOne({
          where: { email: email.toLowerCase().trim() }
        });

        if (existingUser) {
          return res.render('profile/edit', {
            title: 'Modifier mon profil',
            user: user,
            error: 'Cet email est déjà utilisé',
            success: null
          });
        }
      }

      // Mettre à jour
      user.firstName = firstName.trim();
      user.lastName = lastName ? lastName.trim() : null;
      user.email = email.toLowerCase().trim();
      user.currency = currency || 'MAD';
      await user.save();

      // Mettre à jour la session
      req.session.user.firstName = user.firstName;
      req.session.user.lastName = user.lastName;
      req.session.user.email = user.email;
      req.session.user.currency = user.currency;

      res.render('profile/edit', {
        title: 'Modifier mon profil',
        user: user,
        error: null,
        success: 'Profil mis à jour avec succès !'
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.redirect('/dashboard');
    }
  },


  showChangePasswordForm: (req, res) => {
    res.render('profile/change-password', {
      title: 'Changer le mot de passe',
      error: null,
      success: null
    });
  },

  
  changePassword: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.redirect('/login');
      }

      
      const isValid = await user.checkPassword(currentPassword);
      if (!isValid) {
        return res.render('profile/change-password', {
          title: 'Changer le mot de passe',
          error: 'Mot de passe actuel incorrect',
          success: null
        });
      }

      if (newPassword.length < 6) {
        return res.render('profile/change-password', {
          title: 'Changer le mot de passe',
          error: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
          success: null
        });
      }

      if (newPassword !== confirmPassword) {
        return res.render('profile/change-password', {
          title: 'Changer le mot de passe',
          error: 'Les mots de passe ne correspondent pas',
          success: null
        });
      }

      
      user.password = newPassword;
      await user.save();

      res.render('profile/change-password', {
        title: 'Changer le mot de passe',
        error: null,
        success: 'Mot de passe modifié avec succès !'
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.redirect('/dashboard');
    }
  }
};

module.exports = profileController;