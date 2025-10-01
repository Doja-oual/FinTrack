// ============================================
// Category Controller
// Fichier: controllers/categoryController.js
// ============================================

const { Category } = require('../models');
const { Op } = require('sequelize');

class CategoryController {
  
  // Liste des catégories
  async index(req, res) {
    try {
      const categories = await Category.findAll({
        where: { userId: req.session.user.id },
        order: [['type', 'ASC'], ['name', 'ASC']]
      });

      const incomeCategories = categories.filter(c => c.type === 'income');
      const expenseCategories = categories.filter(c => c.type === 'expense');

      res.render('categories/index', {
        title: 'Mes Catégories',
        user: req.session.user,
        categories,
        incomeCategories,
        expenseCategories,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (error) {
      console.error('Erreur liste catégories:', error);
      res.status(500).render('error', {
        title: 'Erreur',
        message: 'Impossible de charger les catégories'
      });
    }
  }

  // Afficher formulaire de création
  async create(req, res) {
    res.render('categories/create', {
      title: 'Nouvelle Catégorie',
      user: req.session.user,
      error: null
    });
  }

  // Enregistrer une catégorie
  async store(req, res) {
    try {
      const { name, type, color, icon } = req.body;

      if (!name || !type) {
        return res.render('categories/create', {
          title: 'Nouvelle Catégorie',
          user: req.session.user,
          error: 'Le nom et le type sont obligatoires'
        });
      }

      const existingCategory = await Category.findOne({
        where: { 
          name: name.trim(), 
          userId: req.session.user.id 
        }
      });

      if (existingCategory) {
        return res.render('categories/create', {
          title: 'Nouvelle Catégorie',
          user: req.session.user,
          error: 'Cette catégorie existe déjà'
        });
      }

      await Category.create({
        name: name.trim(),
        type: type,
        color: color || '#007bff',
        icon: icon || 'fas fa-tag',
        userId: req.session.user.id
      });

      console.log('Catégorie créée:', name);
      res.redirect('/categories?success=Catégorie créée avec succès');

    } catch (error) {
      console.error('Erreur création catégorie:', error);
      res.render('categories/create', {
        title: 'Nouvelle Catégorie',
        user: req.session.user,
        error: 'Erreur lors de la création: ' + error.message
      });
    }
  }

  // Afficher formulaire d'édition
  async edit(req, res) {
    try {
      const category = await Category.findOne({
        where: { 
          id: req.params.id,
          userId: req.session.user.id 
        }
      });

      if (!category) {
        return res.redirect('/categories?error=Catégorie introuvable');
      }

      res.render('categories/edit', {
        title: 'Modifier Catégorie',
        user: req.session.user,
        category,
        error: null
      });
    } catch (error) {
      console.error('Erreur chargement catégorie:', error);
      res.redirect('/categories?error=Erreur lors du chargement');
    }
  }

  // Mettre à jour une catégorie
  async update(req, res) {
    try {
      const { name, type, color, icon } = req.body;

      const category = await Category.findOne({
        where: { 
          id: req.params.id,
          userId: req.session.user.id 
        }
      });

      if (!category) {
        return res.redirect('/categories?error=Catégorie introuvable');
      }

      const existingCategory = await Category.findOne({
        where: { 
          name: name.trim(), 
          userId: req.session.user.id,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingCategory) {
        return res.render('categories/edit', {
          title: 'Modifier Catégorie',
          user: req.session.user,
          category,
          error: 'Ce nom de catégorie existe déjà'
        });
      }

      await category.update({
        name: name.trim(),
        type: type,
        color: color || category.color,
        icon: icon || category.icon
      });

      console.log('Catégorie mise à jour:', name);
      res.redirect('/categories?success=Catégorie modifiée avec succès');

    } catch (error) {
      console.error('Erreur modification catégorie:', error);
      res.redirect('/categories?error=Erreur lors de la modification');
    }
  }

  // Supprimer une catégorie
  async destroy(req, res) {
    try {
      const category = await Category.findOne({
        where: { 
          id: req.params.id,
          userId: req.session.user.id 
        }
      });

      if (!category) {
        return res.redirect('/categories?error=Catégorie introuvable');
      }

      const categoryName = category.name;
      await category.destroy();

      console.log('Catégorie supprimée:', categoryName);
      res.redirect('/categories?success=Catégorie supprimée avec succès');

    } catch (error) {
      console.error('Erreur suppression catégorie:', error);
      res.redirect('/categories?error=Erreur lors de la suppression');
    }
  }
}

module.exports = new CategoryController();