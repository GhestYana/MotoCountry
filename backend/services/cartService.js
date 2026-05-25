const db = require('../db');

module.exports.createCart = async (userId, firstName, lastName, phone, email, city, delivery, address, branch, postalCode, paymentMethod, comment, totalPrice, trackingNumber) => {
  try {
    let result;

    // Check if user has an active shopping cart
    const existingCart = userId
      ? await db.query('SELECT id FROM carts WHERE user_id = $1 AND status = $2', [userId, 'created'])
      : { rows: [] };

    if (existingCart.rows.length > 0) {
      // Update existing cart with order details and change status
      const cartId = existingCart.rows[0].id;
      const sql = `
        UPDATE carts 
        SET first_name = $1, last_name = $2, phone = $3, email = $4, 
            city = $5, delivery = $6, address = $7, branch = $8, 
            postal_code = $9, payment_method = $10, comment = $11, 
            total_price = $12, tracking_number = $13, status = $14
        WHERE id = $15
        RETURNING *
      `;
      const data = [firstName, lastName, phone, email, city, delivery, address, branch, postalCode, paymentMethod, comment, totalPrice, trackingNumber, 'pending', cartId];
      result = await db.query(sql, data);
    } else {
      // Create new order record (for guests or users without active cart record)
      const sql = `
        INSERT INTO carts 
        (user_id, first_name, last_name, phone, email, city, delivery, address, branch, postal_code, payment_method, comment, total_price, tracking_number, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
        RETURNING *
      `;
      const data = [userId, firstName, lastName, phone, email, city, delivery, address, branch, postalCode, paymentMethod, comment, totalPrice, trackingNumber, 'pending'];
      result = await db.query(sql, data);
    }

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.getCart = async (userId) => {
  try {
    const sql = `SELECT * FROM carts WHERE user_id = $1`;
    const data = [userId];
    const result = await db.query(sql, data);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.updateCart = async (userId, firstName, lastName, phone, email, address, postalCode, paymentMethod, comment, totalPrice, trackingNumber) => {
  try {
    const sql = `UPDATE carts SET first_name = $2, last_name = $3, phone = $4, email = $5, address = $6, postal_code = $7, payment_method = $8, comment = $9, total_price = $10, tracking_number = $11 WHERE user_id = $1`;
    const data = [userId, firstName, lastName, phone, email, address, postalCode, paymentMethod, comment, totalPrice, trackingNumber];
    const result = await db.query(sql, data);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.deleteCart = async (userId) => {
  try {
    const sql = `DELETE FROM carts WHERE user_id = $1`;
    const data = [userId];
    const result = await db.query(sql, data);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

