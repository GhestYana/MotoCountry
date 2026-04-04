const db = require('../db');

// delivery_type AS ENUM('Нова Пошта', 'Укрпошта', 'Делівері');
// CREATE TYPE status_type AS ENUM('created', 'sent', 'completed', 'collected', 'returned');
// CREATE TYPE availability_type AS ENUM('available', 'not available', 'expected');


module.exports.addCartItemService = async (quantity, cart_id, product_id, user_id) => {
  try {
    //if cart is not exist, create a new cart
    let response1;
    if (cart_id) response1 = await db.query('SELECT * FROM carts WHERE id = $1', [cart_id]);

    if (!cart_id || response1.rows.length === 0) {
      const sql = 'INSERT INTO carts (user_id, status) VALUES ($1, $2) RETURNING id'
      const data = [user_id, 'created'];
      const result = await db.query(sql, data);
      const cart_id_new = result.rows[0].id;

      const sql1 = 'INSERT INTO cart_items (product_id, quantity, cart_id) VALUES ($1, $2, $3)'
      const data1 = [product_id, quantity, cart_id_new];
      const result1 = await db.query(sql1, data1);
      return "OK";
    }
    //if cart is exist and this product is already in the cart, update the quantity
    const sql2 = 'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2';
    const data2 = [cart_id, product_id];
    const result2 = await db.query(sql2, data2);
    if (result2.rows.length > 0) {
      const sql = 'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3'
      const data = [quantity, cart_id, product_id];
      const result = await db.query(sql, data);
      return "OK";
    }
    //if cart is exist and this product is not in the cart, add the product to the cart
    const sql3 = 'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)'
    const data3 = [cart_id, product_id, quantity];
    const result3 = await db.query(sql3, data3);
    return "OK";
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}
