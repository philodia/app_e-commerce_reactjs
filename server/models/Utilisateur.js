const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adresseSchema = new mongoose.Schema({
  rue: { type: String, required: true },
  complementAdresse: String,
  codePostal: { type: String, required: true },
  ville: { type: String, required: true },
  pays: { type: String, required: true },
  estPrincipale: { type: Boolean, default: false }
});

const utilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  motDePasse: {
    type: String,
    required: true,
    minlength: 8
  },
  telephone: {
    type: String,
    trim: true
  },
  dateNaissance: Date,
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  adresses: [adresseSchema],
  estVerifie: {
    type: Boolean,
    default: false
  },
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  },
  derniereConnexion: Date,
  panier: [{
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
    quantite: { type: Number, default: 1 }
  }],
  listeEnvies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit'
  }],
  tokenResetMotDePasse: String,
  dateExpirationTokenReset: Date
}, {
  timestamps: true
});

// Méthode pour comparer le mot de passe
utilisateurSchema.methods.compareMotDePasse = async function(motDePasseSaisi) {
  return await bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

// Middleware pour hacher le mot de passe avant de sauvegarder
utilisateurSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
  next();
});

// Index pour améliorer les performances de recherche
utilisateurSchema.index({ email: 1, nom: 1, prenom: 1 });

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;