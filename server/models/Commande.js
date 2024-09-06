const mongoose = require('mongoose');

const ligneCommandeSchema = new mongoose.Schema({
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  },
  quantite: {
    type: Number,
    required: true,
    min: 1
  },
  prixUnitaire: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const commandeSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  produits: [ligneCommandeSchema],
  statut: {
    type: String,
    enum: ['En attente', 'Payée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'],
    default: 'En attente'
  },
  adresseLivraison: {
    rue: { type: String, required: true },
    complementAdresse: String,
    codePostal: { type: String, required: true },
    ville: { type: String, required: true },
    pays: { type: String, required: true }
  },
  adresseFacturation: {
    rue: { type: String, required: true },
    complementAdresse: String,
    codePostal: { type: String, required: true },
    ville: { type: String, required: true },
    pays: { type: String, required: true }
  },
  modeLivraison: {
    type: String,
    required: true
  },
  fraisLivraison: {
    type: Number,
    required: true,
    min: 0
  },
  sousTotal: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paiement: {
    methode: {
      type: String,
      required: true
    },
    transactionId: String,
    statut: {
      type: String,
      enum: ['En attente', 'Réussi', 'Échoué'],
      default: 'En attente'
    }
  },
  notes: String,
  dateCommande: {
    type: Date,
    default: Date.now
  },
  dateLivraison: Date
}, {
  timestamps: true
});

// Méthode pour calculer le total de la commande
commandeSchema.methods.calculerTotal = function() {
  this.sousTotal = this.produits.reduce((total, item) => total + item.total, 0);
  this.total = this.sousTotal + this.fraisLivraison;
};

// Middleware pour calculer le total avant sauvegarde
commandeSchema.pre('save', function(next) {
  this.calculerTotal();
  next();
});

// Index pour améliorer les performances de recherche
commandeSchema.index({ utilisateur: 1, dateCommande: -1, statut: 1 });

const Commande = mongoose.model('Commande', commandeSchema);

module.exports = Commande;