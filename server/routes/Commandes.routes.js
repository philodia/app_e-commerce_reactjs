const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/CommandesController');
const auth = require('../middlewares/Auth');
const admin = require('../middlewares/Admin');

// Routes pour les clients (nécessitent une authentification)
router.post('/', auth, commandeController.createCommande);
router.get('/mes-commandes', auth, commandeController.getMesCommandes);
router.get('/mes-commandes/:id', auth, commandeController.getMaCommandeById);

// Routes pour les administrateurs (nécessitent une authentification et des droits d'admin)
router.get('/', auth, admin, commandeController.getAllCommandes);
router.get('/:id', auth, admin, commandeController.getCommandeById);
router.put('/:id', auth, admin, commandeController.updateCommande);
router.delete('/:id', auth, admin, commandeController.deleteCommande);

// Routes supplémentaires
router.post('/:id/payer', auth, commandeController.payerCommande);
router.put('/:id/statut', auth, admin, commandeController.updateStatutCommande);
router.get('/statistiques', auth, admin, commandeController.getStatistiquesCommandes);

module.exports = router;