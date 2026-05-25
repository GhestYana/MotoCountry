const getAllProductsController = require('../controllers/productsController').getAllProductsController;
const getProductController = require('../controllers/productsController').getProductController;
const express = require('express');
const productsRoutes = express.Router();

productsRoutes.get('/:typeProduct', getAllProductsController);
productsRoutes.get('/:id', getProductController);

module.exports = productsRoutes;


