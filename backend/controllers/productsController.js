const getAllProductsService = require('../services/productsService').getAllProductsService;
const getProductService = require('../services/productsService').getProductService;


module.exports.getAllProductsController = async (req, res) => {
  try {
    const result = await getAllProductsService(req, res);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


module.exports.getProductController = async (req, res) => {
  try {
    const result = await getProductService(req.params.id, res);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


