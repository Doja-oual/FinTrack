const { Transaction, Category, Objectif } = require('../models');
const { Sequelize } = require('sequelize');

exports.showDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;

  
    const soldeMensuel = await Transaction.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('date')), 'mois'],
        [Sequelize.fn('SUM', Sequelize.col('montant')), 'solde']
      ],
      where: { userId },
      group: [Sequelize.fn('MONTH', Sequelize.col('date'))],
      order: [[Sequelize.fn('MONTH', Sequelize.col('date')), 'ASC']]
    });

    
    const depensesParCategorie = await Transaction.findAll({
      attributes: [
        [Sequelize.col('Category.name'), 'categorie'],
        [Sequelize.fn('SUM', Sequelize.col('montant')), 'total']
      ],
      include: [{ model: Category, attributes: [] }],
      where: { userId, type: 'depense' },
      group: ['Category.name']
    });

  
    const revenusDepenses = await Transaction.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('date')), 'mois'],
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN type='revenu' THEN montant ELSE 0 END`)), 'revenu'],
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN type='depense' THEN montant ELSE 0 END`)), 'depense']
      ],
      where: { userId },
      group: [Sequelize.fn('MONTH', Sequelize.col('date'))],
      order: [[Sequelize.fn('MONTH', Sequelize.col('date')), 'ASC']]
    });

    
    const objectifs = await Objectif.findAll({
      where: { userId },
      attributes: ['nom', 'montant', 'actuel']
    });

    // Rendu de la vue
    res.render('dashboard', { soldeMensuel, depensesParCategorie, revenusDepenses, objectifs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
};
