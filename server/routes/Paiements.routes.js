const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/PaiementsController');
const auth = require('../middlewares/Auth');
const admin = require('../middlewares/Admin');

// Routes pour les clients (nécessitent une authentification)
router.post('/initier', auth, paiementController.initierPaiement);
router.post('/confirmer', auth, paiementController.confirmerPaiement);
router.get('/mes-paiements', auth, paiementController.getMesPaiements);
router.get('/mes-paiements/:id', auth, paiementController.getMonPaiementById);

// Routes pour les administrateurs (nécessitent une authentification et des droits d'admin)
router.get('/', auth, admin, paiementController.getAllPaiements);
router.get('/:id', auth, admin, paiementController.getPaiementById);
router.put('/:id', auth, admin, paiementController.updatePaiement);
router.delete('/:id', auth, admin, paiementController.deletePaiement);

// Routes supplémentaires
router.post('/remboursement/:id', auth, admin, paiementController.rembourserPaiement);
router.get('/statistiques', auth, admin, paiementController.getStatistiquesPaiements);

module.exports = router;