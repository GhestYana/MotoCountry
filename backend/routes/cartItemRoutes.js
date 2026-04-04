const addCartItemController = require('../controllers/cartItemController').addCartItemController;
const express = require('express');
const cartItemRoutes = express.Router();

cartItemRoutes.post('/add-item', addCartItemController);

module.exports = cartItemRoutes;


