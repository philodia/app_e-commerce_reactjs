const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const auth = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const token = req.header('Authorization').replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Aucun token fourni');
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Trouver l'utilisateur correspondant
    const utilisateur = await Utilisateur.findOne({ _id: decoded.id, 'tokens.token': token });

    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier si le token n'a pas expiré
    if (decoded.exp <= Date.now() / 1000) {
      throw new Error('Token expiré');
    }

    // Ajouter l'utilisateur et le token à l'objet request
    req.token = token;
    req.utilisateur = utilisateur;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Veuillez vous authentifier', error: error.message });
  }
};

module.exports = auth;