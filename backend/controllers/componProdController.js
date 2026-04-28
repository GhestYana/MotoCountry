const { getComponents } = require('../services/componProdService');

module.exports.getComponentsController = async (req, res) => {
  try {
    const filters = req.query;
    const result = await getComponents(filters);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports.getComponentByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getComponentById(id);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
};