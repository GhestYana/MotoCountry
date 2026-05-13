const { getMotorcycles, getMotorcycleById, addMotorcycle, updateMotorcycle, deleteMotorcycle } = require('../services/motoProdService');

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

module.exports.addMotorcycleController = async (req, res) => {
  try {
    const result = await addMotorcycle(req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports.updateMotorcycleController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateMotorcycle(id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports.deleteMotorcycleController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteMotorcycle(id);
    res.json({ message: 'Motorcycle deleted successfully' });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
