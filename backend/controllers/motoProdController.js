const { getMotorcycles, getMotorcycleById, addMotorcycle, updateMotorcycle, deleteMotorcycle, getMotorcycleBrands, getMotorcycleColors } = require('../services/motoProdService');

module.exports.getMotorcyclesController = async (req, res) => {
  try {
    const filters = req.query;
    const result = await getMotorcycles(filters);
    res.json(result.rows);
  } catch (err) {
    console.error('getMotorcyclesController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.getMotorcycleByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getMotorcycleById(id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getMotorcycleByIdController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.addMotorcycleController = async (req, res) => {
  try {
    const result = await addMotorcycle(req.body);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('addMotorcycleController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.updateMotorcycleController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateMotorcycle(id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateMotorcycleController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.deleteMotorcycleController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteMotorcycle(id);
    res.json({ message: 'Motorcycle deleted successfully' });
  } catch (err) {
    console.error('deleteMotorcycleController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.getMotorcycleBrandsController = async (req, res) => {
  try {
    const result = await getMotorcycleBrands();
    res.json(result.rows.map(r => r.brand));
  } catch (err) {
    console.error('getMotorcycleBrandsController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.getMotorcycleColorsController = async (req, res) => {
  try {
    const result = await getMotorcycleColors();
    res.json(result.rows.map(r => r.color));
  } catch (err) {
    console.error('getMotorcycleColorsController error:', err);
    res.status(500).json({ error: err.message });
  }
};
