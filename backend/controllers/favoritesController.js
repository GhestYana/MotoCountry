const { addToFavorites, removeFromFavorites, getFavorites } = require('../services/favoriteService');

module.exports.addToFavorites = async (req, res) => {
  try {
    const { prodId, category } = req.body;
    const userId = req.user.id;
    const result = await addToFavorites(userId, prodId, category);
    res.json(result.rows[0]);
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