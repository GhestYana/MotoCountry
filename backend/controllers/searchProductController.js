const { searchProductService } = require('../services/searchProductService');

module.exports.searchProduct = async (req, res) => {
  try {
    const { query } = req.query;

    const result = await searchProductService(query);

    res.json(result)
  } catch (error) {
    console.error("Помилка пошуку товару:", error);
    res.status(500).json({ error: "Помилка пошуку товару" });
  }
};