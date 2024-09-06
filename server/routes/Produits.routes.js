const express = require('express');
const router = express.Router();
const produitController = require('../controllers/ProduitController');
const auth = require('../middlewares/Auth');
const admin = require('../middlewares/Admin');

// Route pour obtenir tous les produits
router.get('/', produitController.getAllProduits);

// Route pour obtenir un produit spécifique par son ID
router.get('/:id', produitController.getProduitById);

// Route pour créer un nouveau produit (nécessite une authentification et des droits d'admin)
router.post('/', auth, admin, produitController.createProduit);

// Route pour mettre à jour un produit (nécessite une authentification et des droits d'admin)
router.put('/:id', auth, admin, produitController.updateProduit);

// Route pour supprimer un produit (nécessite une authentification et des droits d'admin)
router.delete('/:id', auth, admin, produitController.deleteProduit);

// Route pour rechercher des produits
router.get('/search', produitController.searchProduits);

// Route pour obtenir les produits par catégorie
router.get('/categorie/:categorie', produitController.getProduitsByCategorie);

// Route pour obtenir les produits en promotion
router.get('/promotions', produitController.getProduitsEnPromotion);

module.exports = router;