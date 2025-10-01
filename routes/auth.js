
const express = require('express');
const router = express.Router();
const { User } = require('../models');


// GET - Afficher le formulaire d'inscription
router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Inscription',
    error: null,
    success: null
  });
});

// POST - Traiter l'inscription
router.post('/register', async (req, res) => {
  try {
    console.log('\n========== DÉBUT INSCRIPTION ==========');
    console.log(' Données reçues du formulaire:', req.body);
    
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    
    console.log('Détails:');
    console.log('  Prénom:', firstName);
    console.log('  Nom:', lastName);
    console.log('  Email:', email);
    console.log('  Password:', password ? '***' : 'MANQUANT');
    console.log('  Confirm:', confirmPassword ? '***' : 'MANQUANT');

    // === VALIDATION DES CHAMPS ===
    if (!firstName || !email || !password) {
      console.log(' Validation échouée: champs manquants');
      return res.render('register', {
        title: 'Inscription',
        error: 'Tous les champs obligatoires doivent être remplis',
        success: null
      });
    }

    // Vérifier la longueur du mot de passe
    if (password.length < 6) {
      console.log(' Mot de passe trop court');
      return res.render('register', {
        title: 'Inscription',
        error: 'Le mot de passe doit contenir au moins 6 caractères',
        success: null
      });
    }

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      console.log(' Les mots de passe ne correspondent pas');
      return res.render('register', {
        title: 'Inscription',
        error: 'Les mots de passe ne correspondent pas',
        success: null
      });
    }

    // === VÉRIFICATION EMAIL EXISTANT ===
    console.log(' Vérification si email existe déjà...');
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase().trim() } 
    });
    
    if (existingUser) {
      console.log(' Email déjà utilisé:', email);
      return res.render('register', {
        title: 'Inscription',
        error: 'Cet email est déjà utilisé',
        success: null
      });
    }
    console.log(' Email disponible');

    // === CRÉATION DE L'UTILISATEUR ===
    console.log(' Tentative de création de l\'utilisateur...');
    
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : null,
      email: email.toLowerCase().trim(),
      password: password,
      currency: 'MAD',
      isActive: true
    };
    
    console.log(' Données à insérer:', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      currency: userData.currency,
      passwordLength: password.length
    });

    const newUser = await User.create(userData);

    console.log(' UTILISATEUR CRÉÉ AVEC SUCCÈS ! ');
    console.log('    ID:', newUser.id);
    console.log('    Email:', newUser.email);
    console.log('    Prénom:', newUser.firstName);
    console.log('    Créé le:', newUser.createdAt);
    console.log('========== FIN INSCRIPTION RÉUSSIE ==========\n');

    // Rediriger vers la page de connexion avec message de succès
    return res.render('login', {
      title: 'Connexion',
      error: null,
      success: ' Inscription réussie ! Vous pouvez maintenant vous connecter.'
    });

  } catch (error) {
    console.error('\n ERREUR LORS DE L\'INSCRIPTION ');
    console.error('Type:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.parent) {
      console.error('SQL Error:', error.parent.message);
      console.error('SQL Code:', error.parent.code);
    }
    
    console.error('\nStack complet:');
    console.error(error.stack);
    console.error('=========================================\n');
    
    // Gestion des erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errorMessages = error.errors.map(e => e.message).join(', ');
      console.error('Erreurs de validation:', errorMessages);
      return res.render('register', {
        title: 'Inscription',
        error: errorMessages,
        success: null
      });
    }
    
    // Gestion des erreurs de contrainte unique (email déjà utilisé)
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('Contrainte unique violée (email en double)');
      return res.render('register', {
        title: 'Inscription',
        error: 'Cet email est déjà utilisé',
        success: null
      });
    }

    // Erreur générique
    return res.render('register', {
      title: 'Inscription',
      error: 'Une erreur est survenue lors de l\'inscription. Détails: ' + error.message,
      success: null
    });
  }
});


// GET - Afficher le formulaire de connexion
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Connexion',
    error: null,
    success: null
  });
});

// POST - Traiter la connexion
router.post('/login', async (req, res) => {
  try {
    console.log('\n========== TENTATIVE DE CONNEXION ==========');
    const { email, password } = req.body;
    console.log(' Email:', email);

    // Validation des champs
    if (!email || !password) {
      console.log(' Champs manquants');
      return res.render('login', {
        title: 'Connexion',
        error: 'Email et mot de passe obligatoires',
        success: null
      });
    }

    // Chercher l'utilisateur
    console.log(' Recherche de l\'utilisateur...');
    const user = await User.findOne({ 
      where: { email: email.toLowerCase().trim() } 
    });

    if (!user) {
      console.log(' Utilisateur non trouvé');
      return res.render('login', {
        title: 'Connexion',
        error: 'Email ou mot de passe incorrect',
        success: null
      });
    }

    console.log(' Utilisateur trouvé:', user.email);

    // Vérifier le mot de passe
    console.log(' Vérification du mot de passe...');
    const isPasswordValid = await user.checkPassword(password);
    
    if (!isPasswordValid) {
      console.log(' Mot de passe incorrect');
      return res.render('login', {
        title: 'Connexion',
        error: 'Email ou mot de passe incorrect',
        success: null
      });
    }

    console.log(' Mot de passe correct');

    // Vérifier si le compte est actif
    if (!user.isActive) {
      console.log(' Compte désactivé');
      return res.render('login', {
        title: 'Connexion',
        error: 'Votre compte a été désactivé',
        success: null
      });
    }

    // Créer la session utilisateur
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currency: user.currency
    };

    console.log(' Session créée pour:', user.email);
    console.log('========== CONNEXION RÉUSSIE ==========\n');

    // Rediriger vers le tableau de bord
    res.redirect('/dashboard');

  } catch (error) {
    console.error('\n ERREUR LORS DE LA CONNEXION:');
    console.error(error);
    console.error('=====================================\n');
    
    res.render('login', {
      title: 'Connexion',
      error: 'Une erreur est survenue. Veuillez réessayer.',
      success: null
    });
  }
});

// ============================================
// DÉCONNEXION
// ============================================

router.get('/logout', (req, res) => {
  const userEmail = req.session.user ? req.session.user.email : 'Utilisateur';
  console.log(' Déconnexion de:', userEmail);
  
  req.session.destroy((err) => {
    if (err) {
      console.error(' Erreur lors de la déconnexion:', err);
      return res.redirect('/dashboard');
    }
    res.redirect('/');
  });
});

module.exports = router;