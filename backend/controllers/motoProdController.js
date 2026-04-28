const { getMotorcycles } = require('../services/motoProdService');

module.exports.getMotorcyclesController = async (req, res) => {
  try {
    const filters = req.query;
    console.log('Fetching motorcycles with filters:', filters);
    const result = await getMotorcycles(filters);
    console.log('Query returned rows:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching motorcycles:', err);
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
