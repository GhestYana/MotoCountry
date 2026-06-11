const { getComponents, getComponentById, addComponent, updateComponent, deleteComponent } = require('../services/componProdService');

module.exports.getComponentsController = async (req, res) => {
  try {
    const filters = req.query;
    const result = await getComponents(filters);
    res.json(result.rows);
  } catch (err) {
    console.error('getComponentsController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.getComponentByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getComponentById(id);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('getComponentByIdController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.addComponentController = async (req, res) => {
  try {
    const result = await addComponent(req.body);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('addComponentController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.updateComponentController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateComponent(id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateComponentController error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.deleteComponentController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteComponent(id);
    res.json({ message: 'Component deleted' });
  } catch (err) {
    console.error('deleteComponentController error:', err);
    res.status(500).json({ error: err.message });
  }
};