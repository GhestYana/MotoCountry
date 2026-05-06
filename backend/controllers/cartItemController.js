const { addCartItemService, getCartItemsService, removeCartItemService, updateCartItemService } = require('../services/cartItemService');

module.exports.addCartItemController = async (req, res) => {
  try {
    let {
      quantity,
      cart_id,
      prod_motorcycles_id,
      prod_equipment_id,
      prod_components_id,
      user_id
    } = req.body;

    quantity = Number(quantity);

    if (!quantity || quantity < 1) {
      quantity = 1;
    }

    const result = await addCartItemService(
      quantity,
      cart_id,
      prod_motorcycles_id,
      prod_equipment_id,
      prod_components_id,
      user_id
    );

    res.status(201).json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.getCartItemsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getCartItemsService(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports.removeCartItemController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await removeCartItemService(id);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports.updateCartItemController = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const result = await updateCartItemService(id, quantity);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}