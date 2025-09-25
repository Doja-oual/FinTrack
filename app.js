const express = require('express');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de base
app.get('/', (req, res) => {
  res.json({ message: 'FinSolutions API is running!' });
});

// Test de connexion à la base de données
app.get('/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: 'Database connection successful!' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed!', 
      error: error.message 
    });
  }
});

module.exports = app;