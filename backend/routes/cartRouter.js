const express = require('express');
const router = express.Router();
const { isClientLogged } = require('../middleware/isClientLogged');
const { createCartController, getCartController, updateCartController, deleteCartController, liqPayCallbackController, confirmPaymentController } = require('../controllers/cartController');

router.post('/create', createCartController);
router.post('/callback', liqPayCallbackController);
router.post('/payment-confirm', confirmPaymentController);
router.get('/', isClientLogged, getCartController);
router.post('/update', isClientLogged, updateCartController);
router.post('/delete', isClientLogged, deleteCartController);

module.exports = router;


