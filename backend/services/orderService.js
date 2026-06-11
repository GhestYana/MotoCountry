const db = require('../db');
const { normalizeImage } = require('../utils/imageHelper');

const ORDER_STATUSES = [
    'pending',
    'confirmed',
    'paid',
    'sent',
    'completed',
    'collected',
    'returned',
    'cancelled',
];

const isOrderRow = (row) => Number(row.total_price) > 0;

module.exports.ORDER_STATUSES = ORDER_STATUSES;

module.exports.parseLiqPayOrderId = (orderId) => {
    if (!orderId) return null;
    const match = String(orderId).match(/^(.+)_(\d{10,})$/);
    if (!match) return null;
    return { idPart: match[1], timestamp: match[2] };
};

module.exports.findOrderByLiqPayOrderId = async (orderId) => {
    const parsed = module.exports.parseLiqPayOrderId(orderId);
    if (!parsed) return null;

    const sql = `
        SELECT * FROM carts
        WHERE REPLACE(id::text, '-', '') = $1
        LIMIT 1
    `;
    const result = await db.query(sql, [parsed.idPart]);
    return result.rows[0] || null;
};

module.exports.getAllOrders = async () => {
    const sql = `
        SELECT
            c.*,
            u.email AS user_account_email
        FROM carts c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.total_price > 0
        ORDER BY c.created_at DESC
    `;
    const result = await db.query(sql);
    return result.rows;
};

module.exports.getOrderById = async (orderId) => {
    const sql = `
        SELECT c.*, u.email AS user_account_email
    FROM carts c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = $1 AND c.total_price > 0
  `;
    const result = await db.query(sql, [orderId]);
    return result.rows[0] || null;
};

module.exports.getUserOrders = async (userId) => {
    const sql = `
    SELECT * FROM carts 
    WHERE user_id = $1 AND total_price > 0
    ORDER BY created_at DESC
  `;
    const result = await db.query(sql, [userId]);
    return result.rows;
};

module.exports.getOrderItems = async (orderId, userId, userRole) => {
    // Перевіряємо що замовлення належить цьому користувачу або користувач адмін
    if (userRole !== 'admin') {
        const ownerCheck = await db.query(
            'SELECT id FROM carts WHERE id = $1 AND user_id = $2 AND total_price > 0',
            [orderId, userId]
        );
        if (ownerCheck.rows.length === 0) return null;
    }

    const sql = `
        SELECT
            ci.id AS cart_item_id,
            ci.quantity,
            'motorcycle' AS category,
            m.id AS product_id,
            m.name AS title,
            m.price,
            m.image,
            m.brand
        FROM cart_items ci
        JOIN prod_motorcycles m ON m.id = ci.prod_motorcycles_id
        WHERE ci.cart_id = $1

        UNION ALL

        SELECT
            ci.id AS cart_item_id,
            ci.quantity,
            'equipment' AS category,
            e.id AS product_id,
            e.name AS title,
            e.price,
            e.image,
            e.brand
        FROM cart_items ci
        JOIN prod_equipment e ON e.id = ci.prod_equipment_id
        WHERE ci.cart_id = $1

        UNION ALL

        SELECT
            ci.id AS cart_item_id,
            ci.quantity,
            'component' AS category,
            c.id AS product_id,
            c.name AS title,
            c.price,
            (c.image)[1] AS image,
            c.brand
        FROM cart_items ci
        JOIN prod_components c ON c.id = ci.prod_components_id
        WHERE ci.cart_id = $1
    `;
    const result = await db.query(sql, [orderId]);
    return result.rows.map(row => ({
        ...row,
        image: normalizeImage(row.image)
    }));
};

const { sendStatusUpdateEmail, sendOrderEmail } = require('../utils/emailService');
const { createNotification } = require('./notificationService');

module.exports.updateOrderStatus = async (orderId, status) => {
    if (!ORDER_STATUSES.includes(status)) {
        throw new Error('Invalid status');
    }

    const sql = `
        UPDATE carts
        SET status = $2::status_type, updated_at = NOW()
        WHERE id = $1 AND total_price > 0
        RETURNING *
    `;
    const result = await db.query(sql, [orderId, status]);
    return result.rows[0] || null;
};

module.exports.setOrderPaymentStatus = async (liqpayOrderId, liqpayStatus) => {
    let status;
    if (liqpayStatus === 'success' || liqpayStatus === 'sandbox') {
        status = 'paid';
    } else if (liqpayStatus === 'failure' || liqpayStatus === 'error') {
        status = 'cancelled';
    } else {
        return null;
    }

    const order = await module.exports.findOrderByLiqPayOrderId(liqpayOrderId);
    if (!order) {
        console.error('Order not found for LiqPay order_id:', liqpayOrderId);
        return null;
    }

    const updatedOrder = await module.exports.updateOrderStatus(order.id, status);

    // Notify user about payment result
    if (updatedOrder) {
        const statusTranslations = { paid: 'оплачено', cancelled: 'скасовано' };
        const statusText = statusTranslations[status] || status;

        if (updatedOrder.user_id) {
            createNotification(
                updatedOrder.user_id,
                `Статус вашого замовлення #${updatedOrder.id.slice(0, 8)} змінено на: ${statusText}`
            ).catch(err => console.error('Notification error:', err));
        }

        if (updatedOrder.email) {
            const items = await module.exports.getOrderItems(updatedOrder.id, updatedOrder.user_id, 'admin'); // Pass admin to bypass check
            sendStatusUpdateEmail(updatedOrder.email, updatedOrder.id, status, items, updatedOrder.total_price)
                .catch(err => console.error('Customer email error:', err));
            
            // Notify store owner when order is PAID
            if (status === 'paid') {
                sendOrderEmail({ 
                   firstName: updatedOrder.first_name, 
                   lastName: updatedOrder.last_name, 
                   phone: updatedOrder.phone, 
                   email: updatedOrder.email, 
                   city: updatedOrder.city, 
                   delivery: updatedOrder.delivery, 
                   address: updatedOrder.address, 
                   branch: updatedOrder.branch, 
                   paymentMethod: updatedOrder.payment_method, 
                   comment: "ОПЛАТА ПІДТВЕРДЖЕНА (LiqPay)", 
                   totalPrice: updatedOrder.total_price, 
                   items: items, 
                   status: 'paid' 
                }).catch(err => console.error('Store payment notification error:', err));
            }
        }
    }

    return updatedOrder;
};

module.exports.getInitialOrderStatus = (paymentMethod) => {
    return 'pending';
};

module.exports.deleteOrder = async (orderId) => {
    // Спочатку видаляємо елементи замовлення
    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [orderId]);
    // Потім видаляємо саме замовлення
    const sql = 'DELETE FROM carts WHERE id = $1 AND total_price > 0 RETURNING *';
    const result = await db.query(sql, [orderId]);
    return result.rows[0] || null;
};

module.exports.isOrderRow = isOrderRow;

