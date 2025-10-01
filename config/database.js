const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'finsolutions',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log, 
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// Test de connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Connexion à MySQL (Laragon) réussie');
    console.log(' Base de données:', process.env.DB_NAME || 'finsolutions');
    return true;
  } catch (error) {
    console.error(' Erreur de connexion à la base de données:', error.message);
    console.error(' Vérifiez votre fichier .env');
    return false;
  }
};

module.exports = { sequelize, testConnection };