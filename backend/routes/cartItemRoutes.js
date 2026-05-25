const { addCartItemController, getCartItemsController, removeCartItemController, updateCartItemController, removeCartItemByProductController } = require('../controllers/cartItemController');
const express = require('express');
const cartItemRoutes = express.Router();

cartItemRoutes.post('/add-item', addCartItemController);
cartItemRoutes.get('/', getCartItemsController);
cartItemRoutes.delete('/remove-item/:id', removeCartItemController);
cartItemRoutes.post('/remove-item-by-product', removeCartItemByProductController); // New route for ProductCard
cartItemRoutes.put('/update-item/:id', updateCartItemController);

module.exports = cartItemRoutes;


