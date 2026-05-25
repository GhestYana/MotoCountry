const { createCart, getCart, updateCart, deleteCart } = require('../services/cartService');
const { sendOrderEmail, sendCustomerOrderConfirmation } = require('../utils/emailService');
const { generateLiqPayData, verifyLiqPaySignature } = require('../utils/liqpay');


module.exports.createCartController = async (req, res) => {
  try {
    const { userId, firstName, lastName, phone, email, city, delivery, address, branch, postalCode, paymentMethod, comment, totalPrice, items, paytypes } = req.body;

    const result = await createCart(userId, firstName, lastName, phone, email, city, delivery, address, branch, postalCode, paymentMethod, comment, totalPrice);

    // Send email notification to store owner/manager
    await sendOrderEmail({ firstName, lastName, phone, email, city, delivery, address, branch, paymentMethod, comment, totalPrice, items });

    // Send confirmation email to customer
    await sendCustomerOrderConfirmation({ firstName, lastName, phone, email, city, delivery, address, branch, paymentMethod, comment, totalPrice, items }, result.id);

    let paymentData = null;
    if (paymentMethod === 'card') {
      paymentData = generateLiqPayData(totalPrice, result.id, `Замовлення №${result.id} - MotoCountry`, paytypes);
    }

    // Return the response for BOTH card and cash payments
    res.status(200).json({
      orderId: result.id,
      paymentData: paymentData // This will contain { data, signature } or null
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports.getCartController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getCart(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports.deleteCartController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await deleteCart(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

const { setOrderPaymentStatus, updateOrderStatus } = require('../services/orderService');

module.exports.liqPayCallbackController = async (req, res) => {
  try {
    const { data, signature } = req.body;

    if (!data || !signature || !verifyLiqPaySignature(data, signature)) {
      return res.status(400).send('Invalid signature');
    }

    const payment = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    console.log('LiqPay callback:', payment.status, payment.order_id, payment.amount);

    // Update order status in DB based on payment result
    await setOrderPaymentStatus(payment.order_id, payment.status);

    res.send('OK');
  } catch (error) {
    console.error('LiqPay callback error:', error);
    res.status(500).send('Error');
  }
};

/** Підтвердження оплати з фронтенду (коли server_url / ngrok не налаштовані) */
module.exports.confirmPaymentController = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }
    if (status === 'success' || status === 'sandbox') {
      await updateOrderStatus(orderId, 'paid');
      return res.json({ ok: true });
    }
    res.json({ ok: false, message: 'Payment not completed' });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.updateCartController = async (req, res) => {
  try {
    const { userId, firstName, lastName, phone, email, address, postalCode, paymentMethod, comment, totalPrice, trackingNumber } = req.body;
    const result = await updateCart(userId, firstName, lastName, phone, email, address, postalCode, paymentMethod, comment, totalPrice, trackingNumber);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}