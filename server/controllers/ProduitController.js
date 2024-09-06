const Produit = require('../models/Produit');

exports.getAllProduits = async (req, res) => {
  try {
    const produits = await Produit.find();
    res.json(produits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduit = async (req, res) => {
  const produit = new Produit(req.body);
  try {
    const nouveauProduit = await produit.save();
    res.status(201).json(nouveauProduit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Implémentez les autres méthodes de manière similaire...
