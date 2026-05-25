const { addToFavorites, removeFromFavorites, getFavorites, getFavoriteById } = require('../services/favoriteService');

module.exports.addToFavorites = async (req, res) => {
  try {
    console.log("ADD FAVORITE HIT");

    const { prodId, category } = req.body;
    const userId = req.user?.id;

    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await addToFavorites(userId, prodId, category);

    res.json(result.rows[0] || { message: 'Already in favorites' });

  } catch (err) {
    console.error("ADD FAVORITE ERROR:", err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

module.exports.removeFromFavorites = async (req, res) => {
  try {
    console.log("REMOVE FAVORITE HIT");

    const { prodId, category } = req.body;
    const userId = req.user?.id;

    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await removeFromFavorites(userId, prodId, category);

    res.json(result.rows[0] || { message: 'Favorite not found' });

  } catch (err) {
    console.error("REMOVE FAVORITE ERROR:", err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

module.exports.getFavoritesController = async (req, res) => {
  try {
    console.log("GET FAVORITES HIT");

    console.log("USER:", req.user);

    const userId = req.user?.id;

    console.log("USER ID:", userId);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await getFavorites(userId);

    console.log("FAVORITES RESULT:", result);

    if (!result || !result.rows) {
      return res.json([]);
    }

    res.json(result.rows);

  } catch (err) {
    console.error("GET FAVORITES ERROR:", err);

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

module.exports.getFavoriteById = async (req, res) => {
  try {
    console.log("GET FAVORITE BY ID HIT");

    const { favoriteId } = req.params;

    console.log("FAVORITE ID:", favoriteId);

    const result = await getFavoriteById(favoriteId);

    console.log("FAVORITE RESULT:", result);

    if (!result || !result.rows || !result.rows[0]) {
      return res.status(404).json({
        message: 'Favorite not found'
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("GET FAVORITE BY ID ERROR:", err);

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};