const sequelize = require('./config/database');


const testDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Connexion à la base de données réussie !');
    console.log(' Base de données:', process.env.DB_NAME);
    console.log(' Host:', process.env.DB_HOST + ':' + process.env.DB_PORT);
  } catch (error) {
    console.error(' Erreur de connexion:', error.message);
  } finally {
    await sequelize.close();
    console.log(' Connexion fermée');
  }
};

testDatabase();