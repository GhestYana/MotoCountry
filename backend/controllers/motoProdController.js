const { getMotorcycles } = require('../services/motoProdService');

module.exports.getMotorcyclesController = async (req, res) => {
  try {
    const filters = req.query;
    const result = await getMotorcycles(filters);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports.getMotorcycleByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getMotorcycleById(id);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
