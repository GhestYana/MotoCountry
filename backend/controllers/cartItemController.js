const { addCartItemService, getCartItemsService, removeCartItemService, updateCartItemService } = require('../services/cartItemService');

module.exports.addCartItemController = async (req, res) => {
  try {
    let {
      quantity,
      prodId,
      category,
      userId
    } = req.body;

    quantity = Number(quantity) || 1;

    let prod_motorcycles_id = null;
    let prod_equipment_id = null;
    let prod_components_id = null;

    if (category === 'motorcycles' || category === 'motorcycle') prod_motorcycles_id = prodId;
    else if (category === 'equipment') prod_equipment_id = prodId;
    else if (category === 'components' || category === 'component' || category === 'accessories') prod_components_id = prodId;

    const result = await addCartItemService(
      quantity,
      null, // Letting service find or create cart
      prod_motorcycles_id,
      prod_equipment_id,
      prod_components_id,
      userId
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

    if (!id) {
      return res.status(400).json({ message: 'Missing cart item id' });
    }

    const result = await removeCartItemService(id);
    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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