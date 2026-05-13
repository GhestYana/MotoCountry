const { addToFavorites, removeFromFavorites, getFavorites, getFavoriteById } = require('../services/favoriteService');

module.exports.addToFavorites = async (req, res) => {
  try {
    const { prodId, category } = req.body;
    const userId = req.user.id;
    const result = await addToFavorites(userId, prodId, category);
    res.json(result.rows[0] || { message: 'Already in favorites' });
    console.log("ADD FAVORITE HIT");
  } catch (err) {
    res.status(500).json(err.message);
  }
}

module.exports.removeFromFavorites = async (req, res) => {
  try {
    const { prodId, category } = req.body;
    const userId = req.user.id;
    const result = await removeFromFavorites(userId, prodId, category);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
}

module.exports.getFavoritesController = async (req, res) => {
  try {
    console.log("GET FAVORITES HIT");
    const userId = req.user.id;
    const result = await getFavorites(userId);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
}

module.exports.getFavoriteById = async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const result = await getFavoriteById(favoriteId);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
}

module.exports.updateFavorite = async (req, res) => {
  try {
    const { favoriteId, quantity } = req.body;
    const result = await updateFavorite(favoriteId, quantity);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
}