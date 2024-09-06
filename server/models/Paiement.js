const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: true
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  methodePaiement: {
    type: String,
    required: true,
    enum: ['Carte de crédit', 'PayPal', 'Virement bancaire']
  },
  statut: {
    type: String,
    required: true,
    enum: ['En attente', 'Réussi', 'Échoué', 'Remboursé'],
    default: 'En attente'
  },
  datePaiement: {
    type: Date,
    default: Date.now
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeChargeId: String,
  paypalTransactionId: String,
  dernierQuatreChiffres: String,
  notes: String,
  dateRemboursement: Date,
  motifRemboursement: String
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
paiementSchema.index({ utilisateur: 1, datePaiement: -1 });
paiementSchema.index({ commande: 1 });
paiementSchema.index({ statut: 1 });

// Méthode virtuelle pour obtenir le statut détaillé du paiement
paiementSchema.virtual('statutDetaille').get(function() {
  if (this.statut === 'Réussi') {
    return `Payé le ${this.datePaiement.toLocaleDateString()}`;
  } else if (this.statut === 'Remboursé') {
    return `Remboursé le ${this.dateRemboursement.toLocaleDateString()}`;
  }
  return this.statut;
});

// Méthode pour effectuer un remboursement
paiementSchema.methods.rembourser = async function(motif) {
  this.statut = 'Remboursé';
  this.dateRemboursement = new Date();
  this.motifRemboursement = motif;
  await this.save();
};

const Paiement = mongoose.model('Paiement', paiementSchema);

module.exports = Paiement;