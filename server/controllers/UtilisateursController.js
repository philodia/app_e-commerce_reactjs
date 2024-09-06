const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse } = req.body;
    let utilisateur = await Utilisateur.findOne({ email });
    if (utilisateur) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    utilisateur = new Utilisateur({ nom, prenom, email, motDePasse });
    await utilisateur.save();
    const token = jwt.sign({ id: utilisateur._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur || !(await utilisateur.compareMotDePasse(motDePasse))) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign({ id: utilisateur._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.utilisateur);
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['nom', 'prenom', 'email', 'telephone'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Mises à jour non valides' });
    }
    updates.forEach(update => req.utilisateur[update] = req.body[update]);
    await req.utilisateur.save();
    res.json(req.utilisateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!(await req.utilisateur.compareMotDePasse(currentPassword))) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }
    req.utilisateur.motDePasse = newPassword;
    await req.utilisateur.save();
    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Implémentez les autres méthodes de manière similaire...

exports.getAllUsers = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find({}, '-motDePasse');
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id, '-motDePasse');
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Implémentez les autres méthodes CRUD et les méthodes pour la gestion des adresses...
