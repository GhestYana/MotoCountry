const { addCartItemController, getCartItemsController, removeCartItemController, updateCartItemController } = require('../controllers/cartItemController');
const express = require('express');
const cartItemRoutes = express.Router();

cartItemRoutes.post('/add-item', addCartItemController);
cartItemRoutes.get('/', getCartItemsController);
cartItemRoutes.delete('/remove-item/:id', removeCartItemController);
cartItemRoutes.post('/remove-item-by-product', removeCartItemController); // New route for ProductCard
cartItemRoutes.put('/update-item/:id', updateCartItemController);

module.exports = cartItemRoutes;


