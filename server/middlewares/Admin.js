const admin = (req, res, next) => {
    // Vérifier si l'utilisateur existe et a été authentifié
    if (!req.utilisateur) {
      return res.status(401).json({ message: "Authentification requise" });
    }
  
    // Vérifier si l'utilisateur a le rôle d'administrateur
    if (req.utilisateur.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé. Droits d'administrateur requis." });
    }
  
    // Si l'utilisateur est un administrateur, passer au middleware suivant
    next();
  };
  
  module.exports = admin;