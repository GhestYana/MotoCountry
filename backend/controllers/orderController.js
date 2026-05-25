const {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    ORDER_STATUSES,
    getUserOrders,
    getOrderItems,
} = require('../services/orderService');
const { createNotification } = require('../services/notificationService');
const { sendStatusUpdateEmail } = require('../utils/emailService');

module.exports.getOrdersController = async (req, res) => {
    try {
        const orders = await getAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.getUserOrdersController = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await getUserOrders(userId);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.getOrderController = async (req, res) => {
    try {
        const order = await getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.updateOrderStatusController = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const order = await updateOrderStatus(id, status);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Logic for notifications
        const statusTranslations = {
            'pending': 'очікує підтвердження',
            'confirmed': 'підтверджено',
            'paid': 'оплачено',
            'sent': 'відправлено',
            'completed': 'виконано',
            'collected': 'зібрано',
            'returned': 'повернено',
            'cancelled': 'скасовано'
        };
        const statusText = statusTranslations[status] || status;

        if (order.user_id) {
            // Internal notification
            await createNotification(order.user_id, `Статус вашого замовлення #${id.slice(0, 8)} змінено на: ${statusText}`);

            // Email notification
            if (order.email) {
                await sendStatusUpdateEmail(order.email, id, status);
            }
        }

        res.status(200).json(order);
    } catch (error) {
        if (error.message === 'Invalid status') {
            return res.status(400).json({ message: 'Invalid status', allowed: ORDER_STATUSES });
        }
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.getOrderStatusesController = (req, res) => {
    res.status(200).json(ORDER_STATUSES);
};

module.exports.getOrderItemsController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const items = await getOrderItems(id, userId);
        if (items === null) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(items);
    } catch (error) {
        console.error('Get order items error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const { generateLiqPayData } = require('../utils/liqpay');

module.exports.getOrderPaymentController = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrderById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order belongs to user (if not admin)
        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending orders can be paid' });
        }

        if (order.payment_method !== 'card') {
            return res.status(400).json({ message: 'Order payment method is not card' });
        }

        const { paytypes } = req.query;
        const paymentData = generateLiqPayData(order.total_price, order.id, `Замовлення №${order.id} - MotoCountry`, paytypes);

        res.status(200).json(paymentData);
    } catch (error) {
        console.error('Get order payment data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
