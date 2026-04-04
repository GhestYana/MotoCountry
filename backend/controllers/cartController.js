// const createCartService = require('../services/cartService').createCartService;


// module.exports.createCartController = async (req, res) => {
//   try {
//     const { user_id, product_id, quantity } = req.body;
//     console.log(user_id, product_id, quantity);
//     const result = await createCartService(user_id, product_id, quantity);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// }
