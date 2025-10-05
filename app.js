
require('dotenv').config();

// Importation des modules nécessaires
const express = require('express');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');



// Importation de la base de données et des modèles
const { testConnection, syncDatabase, Transaction, Budget, Category } = require('./models');
const { Op } = require('sequelize');

// Importation des routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const indexRoutes =require('./routes/index');
const profileRoutes = require('./routes/profile'); 



const app = express();

// ============================================
// CONFIGURATION DES VUES (EJS)
// ============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================
// MIDDLEWARES
// ============================================

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour parser les données des formulaires
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_secret_tres_securise_changez_moi',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString('fr-FR');
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Middleware pour rendre les données de session disponibles
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  next();
});

// ============================================
// MIDDLEWARE D'AUTHENTIFICATION
// ============================================
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};



// Page d'accueil
app.get('/', (req, res) => {
  try {
    res.render('home', { 
      title: 'Accueil - FinSolutions',
      description: 'Application de gestion de budget personnel'
    });
  } catch (error) {
    console.error('Erreur page d\'accueil:', error);
    res.status(500).send('Erreur lors du chargement de la page');
  }
});

// Routes d'authentification
app.use('/', authRoutes);

// Routes catégories
app.use('/', categoryRoutes);

// Routes transactions
app.use('/', transactionRoutes);

// Routes budgets
app.use('/', budgetRoutes);

app.use('/',indexRoutes);


app.use('/profile', profileRoutes);


// Route Dashboard avec données complètes
app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    // Date actuelle
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Récupérer les transactions du mois
    const transactions = await Transaction.findAll({
      where: {
        userId: req.session.user.id,
        date: { [Op.between]: [firstDay, lastDay] }
      },
      include: [{ model: Category, as: 'category' }],
      order: [['date', 'DESC']]
    });
    
    // Calculs des statistiques
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const balance = totalIncome - totalExpense;
    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;
    
    // Récupérer les budgets du mois
    const budgets = await Budget.findAll({
      where: {
        userId: req.session.user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      },
      include: [{ model: Category, as: 'category' }]
    });
    
    // Calculer les stats des budgets
    const budgetsWithStats = await Promise.all(budgets.map(async (budget) => {
      const spent = await Transaction.sum('amount', {
        where: {
          categoryId: budget.categoryId,
          userId: req.session.user.id,
          type: 'expense',
          date: { [Op.between]: [firstDay, lastDay] }
        }
      }) || 0;
      
      const percentage = (spent / budget.amount) * 100;
      
      return {
        ...budget.toJSON(),
        spent,
        percentage,
        isOverBudget: spent > budget.amount,
        isNearLimit: percentage >= budget.alertThreshold
      };
    }));
    
    // Rendre la vue avec toutes les données
    res.render('dashboard/index', {
      title: 'Dashboard',
      user: req.session.user,
      totalIncome,
      totalExpense,
      balance,
      incomeCount,
      expenseCount,
      budgetCount: budgets.length,
      recentTransactions: transactions.slice(0, 5),
      recentBudgets: budgetsWithStats
    });
    
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).send('Erreur lors du chargement du dashboard');
  }
});

// Route de déconnexion
app.get('/logout', (req, res) => {
  const userEmail = req.session.user ? req.session.user.email : 'Utilisateur';
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
      return res.redirect('/dashboard');
    }
    console.log('Déconnexion:', userEmail);
    res.redirect('/');
  });
});

// ============================================
// GESTION DES ERREURS
// ============================================

// Route 404 - Page non trouvée
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page non trouvée',
    message: 'La page que vous recherchez n\'existe pas',
    url: req.url
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('\n=== ERREUR GLOBALE ===');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('=====================\n');
  
  res.status(err.status || 500).render('error', {
    title: 'Erreur',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Une erreur est survenue sur le serveur'
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('\n Initialisation de l\'application FinSolutions...\n');

    console.log(' Test de connexion à MySQL...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('\n ERREUR: Impossible de se connecter à MySQL');
      process.exit(1);
    }

    console.log('\n Synchronisation de la base de données...');
    await syncDatabase();

    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(' Serveur FinSolutions démarré avec succès !');
      console.log('='.repeat(60));
      console.log(` URL locale:        http://localhost:${PORT}`);
      console.log(` Base de données:   ${process.env.DB_NAME || 'finsolutions'}`);
      console.log(` Environnement:     ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60));
      console.log('\n Appuyez sur Ctrl+C pour arrêter\n');
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n ERREUR: Le port ${PORT} est déjà utilisé !`);
        console.error('Solution: taskkill /IM node.exe /F\n');
        process.exit(1);
      }
    });

    process.on('SIGINT', () => {
      console.log('\n  Arrêt du serveur...');
      server.close(() => {
        console.log(' Serveur arrêté\n');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('\n ERREUR FATALE:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;