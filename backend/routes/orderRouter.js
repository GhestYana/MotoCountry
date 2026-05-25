const express = require('express');
const router = express.Router();
const { isClientLogged, isAdmin } = require('../middleware/isClientLogged');
const {
    getOrdersController,
    getOrderController,
    updateOrderStatusController,
    getOrderStatusesController,
    getUserOrdersController,
    getOrderPaymentController,
    getOrderItemsController,
} = require('../controllers/orderController');

router.get('/my-orders', isClientLogged, getUserOrdersController);
router.get('/statuses', isClientLogged, isAdmin, getOrderStatusesController);
router.get('/:id/payment', isClientLogged, getOrderPaymentController);
router.get('/:id/items', isClientLogged, getOrderItemsController);
router.get('/', isClientLogged, isAdmin, getOrdersController);
router.get('/:id', isClientLogged, isAdmin, getOrderController);
router.patch('/:id/status', isClientLogged, isAdmin, updateOrderStatusController);

module.exports = router;
