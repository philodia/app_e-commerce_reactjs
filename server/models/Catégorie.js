const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie',
    default: null
  },
  niveau: {
    type: Number,
    default: 1
  },
  image: {
    type: String,
    required: false
  },
  estActive: {
    type: Boolean,
    default: true
  },
  ordre: {
    type: Number,
    default: 0
  },
  metaTitle: String,
  metaDescription: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour les sous-catégories
categorieSchema.virtual('sousCategories', {
  ref: 'Categorie',
  localField: '_id',
  foreignField: 'parent'
});

// Méthode pour obtenir le chemin complet de la catégorie
categorieSchema.methods.getCheminComplet = async function() {
  let chemin = [this.nom];
  let categorieCourante = this;

  while (categorieCourante.parent) {
    categorieCourante = await this.model('Categorie').findById(categorieCourante.parent);
    chemin.unshift(categorieCourante.nom);
  }

  return chemin.join(' > ');
};

// Index pour améliorer les performances de recherche
categorieSchema.index({ nom: 'text', slug: 1 });

const Categorie = mongoose.model('Categorie', categorieSchema);

module.exports = Categorie;