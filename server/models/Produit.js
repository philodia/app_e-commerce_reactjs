const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  prix: {
    type: Number,
    required: true,
    min: 0
  },
  categorie: {
    type: String,
    required: true,
    enum: ['Matériel informatique occasion', 'Matériel informatique neuf', 'Matériel téléphonique', 'Vidéo surveillance et sécurité', 'Accessoires']
  },
  sousCategorie: {
    type: String,
    required: true
  },
  etat: {
    type: String,
    required: true,
    enum: ['Neuf', 'Occasion', 'Reconditionné']
  },
  marque: {
    type: String,
    required: true
  },
  modele: String,
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  specifications: {
    type: Map,
    of: String
  },
  note: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  avis: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur'
    },
    texte: String,
    note: {
      type: Number,
      min: 1,
      max: 5
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  dateAjout: {
    type: Date,
    default: Date.now
  },
  dateMiseAJour: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
produitSchema.index({ nom: 'text', description: 'text' });

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;