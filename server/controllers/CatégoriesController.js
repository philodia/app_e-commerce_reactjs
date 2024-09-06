const Categorie = require('../models/Categorie');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie non trouvée' });
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategorie = async (req, res) => {
  const categorie = new Categorie(req.body);
  try {
    const nouvelleCategorie = await categorie.save();
    res.status(201).json(nouvelleCategorie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!categorie) return res.status(404).json({ message: 'Catégorie non trouvée' });
    res.json(categorie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    if (!categorie) return res.status(404).json({ message: 'Catégorie non trouvée' });
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSousCategories = async (req, res) => {
  try {
    const sousCategories = await Categorie.find({ parent: req.params.id });
    res.json(sousCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoriesArborescence = async (req, res) => {
  try {
    const categories = await Categorie.find().sort({ niveau: 1 });
    const arborescence = buildCategoriesTree(categories);
    res.json(arborescence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    const categories = await Categorie.find({ $text: { $search: q } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction utilitaire pour construire l'arborescence des catégories
function buildCategoriesTree(categories, parentId = null) {
  const categoryTree = [];
  
  categories
    .filter(category => category.parent && category.parent.toString() === (parentId ? parentId.toString() : null))
    .forEach(category => {
      const children = buildCategoriesTree(categories, category._id);
      if (children.length) {
        category = category.toObject();
        category.children = children;
      }
      categoryTree.push(category);
    });
  
  return categoryTree;
}