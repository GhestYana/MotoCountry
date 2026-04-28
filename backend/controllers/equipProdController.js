const { getEquipment } = require('../services/equipProdService');

module.exports.getEquipmentController = async (req, res) => {
  try {
    const filters = req.query;
    const result = await getEquipment(filters);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports.getEquipmentByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getEquipmentById(id);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
};