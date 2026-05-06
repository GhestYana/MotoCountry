const { addCartItemController, getCartItemsController, removeCartItemController, updateCartItemController } = require('../controllers/cartItemController');
const express = require('express');
const cartItemRoutes = express.Router();

cartItemRoutes.post('/add-item', addCartItemController);
cartItemRoutes.get('/', getCartItemsController);
cartItemRoutes.post('/remove-item', removeCartItemController);
cartItemRoutes.put('/update-item', updateCartItemController);

module.exports = cartItemRoutes;


