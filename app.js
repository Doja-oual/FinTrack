

const express = require('express');
require('dotenv').config();
const bcrypt = require("bcrypt");
const path = require('path');
const { body, validationResult } = require('express-validator');
const { User } = require('./models');

const app = express();

// Import du modèle simple
const db = require('./models');

// ===== NOUVELLE CONFIGURATION POUR LES VUES EJS =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour les fichiers statiques (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares existants
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES POUR AFFICHER LES VUES =====

// Route page d'accueil (remplace votre route existante)
app.get('/', (req, res) => {
    res.render('public/index');
});

// Routes d'authentification GET (affichage des pages)
app.get('/auth/login', (req, res) => {
    res.render('auth/login');
});

app.get('/auth/register', (req, res) => {
    res.render('auth/register');
});

app.get('/auth/forgot-password', (req, res) => {
    res.render('auth/forgot-password');
});

app.get('/auth/reset-password/:token', (req, res) => {
    res.render('auth/reset-password', { 
        token: req.params.token 
    });
});

// ===== MISE À JOUR DE VOTRE ROUTE REGISTER EXISTANTE =====

// Validation middleware pour l'inscription
const registerValidation = [
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Les mots de passe ne correspondent pas');
        }
        return true;
    }),
    body('terms').equals('on').withMessage('Vous devez accepter les conditions d\'utilisation')
];

// Route POST mise à jour pour l'inscription
app.post('/auth/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('auth/register', {
                errors: errors.array(),
                formData: req.body
            });
        }

        const { firstName, lastName, email, password } = req.body;

        const findUser = await User.findOne({ where: { email } });
        if (findUser) {
            return res.render('auth/register', {
                errors: [{ msg: 'Un compte existe déjà avec cet email' }],
                formData: req.body
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Création de l'utilisateur avec prénom et nom
        await User.create({ 
            firstName,
            lastName,
            email, 
            password: hashedPassword 
        });

        // Redirection vers login avec message de succès
        res.render('auth/login', {
            success: 'Compte créé avec succès ! Vous pouvez vous connecter.'
        });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.render('auth/register', {
            errors: [{ msg: 'Erreur serveur. Veuillez réessayer.' }],
            formData: req.body
        });
    }
});

// ===== NOUVELLE ROUTE LOGIN =====

// Validation middleware pour la connexion
const loginValidation = [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis')
];

app.post('/auth/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('auth/login', {
                errors: errors.array(),
                formData: req.body
            });
        }

        const { email, password } = req.body;

        // Rechercher l'utilisateur
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.render('auth/login', {
                error: 'Email ou mot de passe incorrect',
                formData: req.body
            });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.render('auth/login', {
                error: 'Email ou mot de passe incorrect',
                formData: req.body
            });
        }

        // Connexion réussie - redirection vers dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.render('auth/login', {
            error: 'Erreur serveur. Veuillez réessayer.',
            formData: req.body
        });
    }
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard/index');
});


// ===== ROUTE FORGOT PASSWORD =====
app.post('/auth/forgot-password', [
    body('email').isEmail().withMessage('Email invalide')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('auth/forgot-password', {
                errors: errors.array(),
                formData: req.body
            });
        }

        const { email } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.render('auth/forgot-password', {
                error: 'Aucun compte trouvé avec cet email'
            });
        }

        // TODO: Implémenter l'envoi d'email avec nodemailer
        // Pour l'instant, simulation
        res.render('auth/forgot-password', {
            success: 'Un email de réinitialisation a été envoyé à ' + email
        });

    } catch (error) {
        console.error('Erreur mot de passe oublié:', error);
        res.render('auth/forgot-password', {
            error: 'Erreur serveur. Veuillez réessayer.'
        });
    }
});

// ===== GARDER VOS ROUTES EXISTANTES =====

// Register route API (gardez-la pour l'API)
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const findUser = await User.findOne({ where: { email } });
        if (findUser) {
            return res.status(400).send("Utilisateur déjà enregistré");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashedPassword });

        res.status(201).send({ message: "registration successful" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Route de test de la base
app.get('/test-db', async (req, res) => {
    try {
        const sequelize = require('./config/database');
        await sequelize.authenticate();
        res.json({
            success: true,
            message: 'Connexion à la base réussie'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== GESTION DES ERREURS 404 =====
app.use('*', (req, res) => {
    res.status(404).render('auth/login', {
        error: 'Page non trouvée. Redirection vers la connexion.'
    });
});


db.sequelize.sync({ alter: false })
  .then(() => {
    console.log(' Base de données synchronisée');
  })
  .catch(err => {
    console.error(' Erreur de synchronisation:', err);
  });

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
    console.log(` Serveur FinSolutions démarré sur http://localhost:${PORT}`);
    console.log(' Pages disponibles :');
    console.log(`   • Accueil:        http://localhost:${PORT}/`);
    console.log(`   • Connexion:      http://localhost:${PORT}/auth/login`);
    console.log(`   • Inscription:    http://localhost:${PORT}/auth/register`);
    console.log(`   • Mot de passe:   http://localhost:${PORT}/auth/forgot-password`);
    console.log(`   • Dashboard:      http://localhost:${PORT}/dashboard`);
    console.log(`   • Test DB:        http://localhost:${PORT}/test-db`);
});