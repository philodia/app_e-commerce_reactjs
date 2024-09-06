const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/CategoriesController');
const auth = require('../middlewares/Auth');
const admin = require('../middlewares/Admin');

// Route pour obtenir toutes les catégories
router.get('/', categorieController.getAllCategories);

// Route pour obtenir une catégorie spécifique par son ID
router.get('/:id', categorieController.getCategorieById);

// Route pour créer une nouvelle catégorie (nécessite une authentification et des droits d'admin)
router.post('/', auth, admin, categorieController.createCategorie);

// Route pour mettre à jour une catégorie (nécessite une authentification et des droits d'admin)
router.put('/:id', auth, admin, categorieController.updateCategorie);

// Route pour supprimer une catégorie (nécessite une authentification et des droits d'admin)
router.delete('/:id', auth, admin, categorieController.deleteCategorie);

// Route pour obtenir les sous-catégories d'une catégorie
router.get('/:id/sous-categories', categorieController.getSousCategories);

// Route pour obtenir l'arborescence complète des catégories
router.get('/arborescence', categorieController.getCategoriesArborescence);

// Route pour rechercher des catégories
router.get('/search', categorieController.searchCategories);

module.exports = router;