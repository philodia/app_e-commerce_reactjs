const Paiement = require('../models/Paiement');
const Commande = require('../models/Commande');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.initierPaiement = async (req, res) => {
  try {
    const { commandeId, methodePaiement } = req.body;
    const commande = await Commande.findById(commandeId);
    
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    if (commande.utilisateur.toString() !== req.utilisateur._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Créer une intention de paiement avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: commande.total * 100, // Stripe utilise les centimes
      currency: 'eur',
      customer: req.utilisateur.stripeCustomerId,
      metadata: { commandeId: commande._id.toString() }
    });

    const paiement = new Paiement({
      commande: commande._id,
      utilisateur: req.utilisateur._id,
      montant: commande.total,
      methodePaiement,
      statut: 'En attente',
      stripePaymentIntentId: paymentIntent.id
    });

    await paiement.save();

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paiementId: paiement._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.confirmerPaiement = async (req, res) => {
  try {
    const { paiementId } = req.body;
    const paiement = await Paiement.findById(paiementId);
    
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    // Vérifier le statut du paiement avec Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paiement.stripePaymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      paiement.statut = 'Réussi';
      await paiement.save();

      // Mettre à jour le statut de la commande
      await Commande.findByIdAndUpdate(paiement.commande, { statut: 'Payée' });

      res.json({ message: 'Paiement confirmé avec succès', paiement });
    } else {
      res.status(400).json({ message: 'Le paiement n\'a pas été complété' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMesPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.find({ utilisateur: req.utilisateur._id })
                                    .populate('commande');
    res.json(paiements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonPaiementById = async (req, res) => {
  try {
    const paiement = await Paiement.findOne({ 
      _id: req.params.id, 
      utilisateur: req.utilisateur._id 
    }).populate('commande');
    
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.json(paiement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.find().populate('utilisateur', 'nom email').populate('commande');
    res.json(paiements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaiementById = async (req, res) => {
  try {
    const paiement = await Paiement.findById(req.params.id)
                                   .populate('utilisateur', 'nom email')
                                   .populate('commande');
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.json(paiement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaiement = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['statut', 'notes'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Mises à jour non valides' });
    }

    const paiement = await Paiement.findById(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    updates.forEach(update => paiement[update] = req.body[update]);
    await paiement.save();

    res.json(paiement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndDelete(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.json({ message: 'Paiement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rembourserPaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findById(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    // Effectuer le remboursement via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paiement.stripePaymentIntentId,
    });

    if (refund.status === 'succeeded') {
      paiement.statut = 'Remboursé';
      await paiement.save();

      // Mettre à jour le statut de la commande
      await Commande.findByIdAndUpdate(paiement.commande, { statut: 'Remboursée' });

      res.json({ message: 'Remboursement effectué avec succès', paiement });
    } else {
      res.status(400).json({ message: 'Le remboursement a échoué' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStatistiquesPaiements = async (req, res) => {
  try {
    const totalPaiements = await Paiement.countDocuments();
    const totalMontant = await Paiement.aggregate([
      { $match: { statut: 'Réussi' } },
      { $group: { _id: null, total: { $sum: "$montant" } } }
    ]);
    const paiementsParStatut = await Paiement.aggregate([
      { $group: { _id: "$statut", count: { $sum: 1 } } }
    ]);

    res.json({
      totalPaiements,
      totalMontant: totalMontant[0]?.total || 0,
      paiementsParStatut
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};