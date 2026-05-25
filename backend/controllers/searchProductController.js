const { searchProductService } = require('../services/searchProductService');

module.exports.searchProduct = async (req, res) => {
  try {
    const { query, brand, minPrice, maxPrice, category, sort } = req.query;

    const result = await searchProductService(query, { brand, minPrice, maxPrice, category, sort });

    res.json(result)
  } catch (error) {
    console.error("Помилка пошуку товару:", error);
    res.status(500).json({ error: "Помилка пошуку товару" });
  }
};