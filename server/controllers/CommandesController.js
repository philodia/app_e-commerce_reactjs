const Commande = require('../models/Commande');
const Produit = require('../models/Produit');

exports.createCommande = async (req, res) => {
  try {
    const { produits, adresseLivraison, modeLivraison } = req.body;
    
    // Vérifier le stock et calculer le total
    let total = 0;
    for (let item of produits) {
      const produit = await Produit.findById(item.produit);
      if (!produit || produit.stock < item.quantite) {
        return res.status(400).json({ message: `Stock insuffisant pour ${produit.nom}` });
      }
      total += produit.prix * item.quantite;
    }

    const commande = new Commande({
      utilisateur: req.utilisateur._id,
      produits,
      adresseLivraison,
      modeLivraison,
      total
    });

    await commande.save();

    // Mettre à jour le stock
    for (let item of produits) {
      await Produit.findByIdAndUpdate(item.produit, { $inc: { stock: -item.quantite } });
    }

    res.status(201).json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMesCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find({ utilisateur: req.utilisateur._id })
                                    .populate('produits.produit');
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMaCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findOne({ 
      _id: req.params.id, 
      utilisateur: req.utilisateur._id 
    }).populate('produits.produit');
    
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find().populate('utilisateur', 'nom email');
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id)
                                   .populate('utilisateur', 'nom email')
                                   .populate('produits.produit');
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCommande = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['statut', 'adresseLivraison', 'modeLivraison'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Mises à jour non valides' });
    }

    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    updates.forEach(update => commande[update] = req.body[update]);
    await commande.save();

    res.json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCommande = async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.payerCommande = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    if (commande.statut !== 'En attente') {
      return res.status(400).json({ message: 'Cette commande ne peut pas être payée' });
    }
    // Logique de paiement ici (intégration avec un service de paiement)
    commande.statut = 'Payée';
    await commande.save();
    res.json({ message: 'Commande payée avec succès', commande });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatutCommande = async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    commande.statut = statut;
    await commande.save();
    res.json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getStatistiquesCommandes = async (req, res) => {
  try {
    const totalCommandes = await Commande.countDocuments();
    const totalVentes = await Commande.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const commandesParStatut = await Commande.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } }
    ]);

    res.json({
      totalCommandes,
      totalVentes: totalVentes[0]?.total || 0,
      commandesParStatut
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};