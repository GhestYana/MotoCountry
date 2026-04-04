const { addCartItemService } = require('../services/cartItemService');

module.exports.addCartItemController = async (req, res) => {
  try {
    const { quantity, cart_id, product_id, user_id } = req.body;
    const result = await addCartItemService(quantity, cart_id, product_id, user_id);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
