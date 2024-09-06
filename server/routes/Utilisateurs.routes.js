const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/UtilisateursController');
const auth = require('../middlewares/Auth');
const admin = require('../middlewares/Admin');

// Routes publiques
router.post('/register', utilisateurController.register);
router.post('/login', utilisateurController.login);
router.post('/forgot-password', utilisateurController.forgotPassword);
router.post('/reset-password', utilisateurController.resetPassword);

// Routes protégées (nécessitent une authentification)
router.get('/profile', auth, utilisateurController.getProfile);
router.put('/profile', auth, utilisateurController.updateProfile);
router.put('/change-password', auth, utilisateurController.changePassword);

// Routes admin (nécessitent une authentification et des droits d'admin)
router.get('/', auth, admin, utilisateurController.getAllUsers);
router.get('/:id', auth, admin, utilisateurController.getUserById);
router.put('/:id', auth, admin, utilisateurController.updateUser);
router.delete('/:id', auth, admin, utilisateurController.deleteUser);

// Routes supplémentaires
router.post('/logout', auth, utilisateurController.logout);
router.get('/addresses', auth, utilisateurController.getUserAddresses);
router.post('/addresses', auth, utilisateurController.addUserAddress);
router.put('/addresses/:addressId', auth, utilisateurController.updateUserAddress);
router.delete('/addresses/:addressId', auth, utilisateurController.deleteUserAddress);

module.exports = router;