const db = require('../db.js');

// delivery_type AS ENUM('Нова Пошта', 'Укрпошта', 'Делівері');
// CREATE TYPE status_type AS ENUM('created', 'sent', 'completed', 'collected', 'returned');
// CREATE TYPE availability_type AS ENUM('available', 'not available', 'expected');


module.exports.addCartItemService = async (quantity, cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id, user_id) => {
  try {
    //if cart is not exist, create a new cart
    let cart_id_to_use = cart_id;

    if (!cart_id_to_use) {
      const existingCart = await db.query('SELECT id FROM carts WHERE user_id = $1 AND status = $2', [user_id, 'created']);
      if (existingCart.rows.length > 0) {
        cart_id_to_use = existingCart.rows[0].id;
      }
    }

    if (!cart_id_to_use) {
      const sql = 'INSERT INTO carts (user_id, status) VALUES ($1, $2) RETURNING id'
      const data = [user_id, 'created'];
      const result = await db.query(sql, data);
      cart_id_to_use = result.rows[0].id;

      const sql1 = 'INSERT INTO cart_items (prod_motorcycles_id, prod_equipment_id, prod_components_id, quantity, cart_id) VALUES ($1, $2, $3, $4, $5)'
      const data1 = [prod_motorcycles_id, prod_equipment_id, prod_components_id, quantity, cart_id_to_use];
      const result1 = await db.query(sql1, data1);
      return "OK";
    }

    cart_id = cart_id_to_use;
    //if cart is exist and this product is already in the cart, update the quantity
    const sql2 = `
      SELECT * FROM cart_items 
      WHERE cart_id = $1 
      AND (prod_motorcycles_id IS NOT DISTINCT FROM $2)
      AND (prod_equipment_id IS NOT DISTINCT FROM $3) 
      AND (prod_components_id IS NOT DISTINCT FROM $4)
    `;
    const data2 = [cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id];
    const result2 = await db.query(sql2, data2);
    if (result2.rows.length > 0) {
      const sql = `
        UPDATE cart_items SET quantity = quantity + $1 
        WHERE cart_id = $2 
        AND (prod_motorcycles_id IS NOT DISTINCT FROM $3)
        AND (prod_equipment_id IS NOT DISTINCT FROM $4)
        AND (prod_components_id IS NOT DISTINCT FROM $5)
      `;
      const data = [quantity, cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id];
      const result = await db.query(sql, data);
      return "OK";
    }
    //if cart is exist and this product is not in the cart, add the product to the cart
    const sql3 = 'INSERT INTO cart_items (cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id, quantity) VALUES ($1, $2, $3, $4, $5)'
    const data3 = [cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id, quantity];
    const result3 = await db.query(sql3, data3);
    return "OK";
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.getCartItemsService = async (userId) => {
  try {
    const query = `
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        'motorcycles' as type,
        m.id as product_id,
        m.name as title,
        m.price::float as price,
        m.image,
        m.brand
      FROM cart_items ci
      JOIN prod_motorcycles m ON m.id = ci.prod_motorcycles_id
      WHERE ci.cart_id IN (SELECT id FROM carts WHERE user_id = $1)
      
      UNION ALL

      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        'equipment' as type,
        p.id as product_id,
        p.name as title,
        p.price::float as price,
        p.image,
        p.brand
      FROM cart_items ci
      JOIN prod_equipment p ON p.id = ci.prod_equipment_id
      WHERE ci.cart_id IN (SELECT id FROM carts WHERE user_id = $1)

      UNION ALL

      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        'components' as type,
        a.id as product_id,
        a.name as title,
        a.price::float as price,
        a.image,
        a.brand
      FROM cart_items ci
      JOIN prod_components a ON a.id = ci.prod_components_id
      WHERE ci.cart_id IN (SELECT id FROM carts WHERE user_id = $1)
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.removeCartItemService = async (cartItemId) => {
  try {
    const query = 'DELETE FROM cart_items WHERE id = $1';
    const result = await db.query(query, [cartItemId]);
    return result.rows;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.updateCartItemService = async (cartItemId, quantity) => {
  try {
    const query = 'UPDATE cart_items SET quantity = $1 WHERE id = $2';
    const result = await db.query(query, [quantity, cartItemId]);
    return result.rows;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.removeCartItemByProductService = async (userId, prod_motorcycles_id, prod_equipment_id, prod_components_id) => {
  try {
    const query = `
      DELETE FROM cart_items 
      WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1 AND status = 'created')
      AND (prod_motorcycles_id = $2 OR prod_equipment_id = $3 OR prod_components_id = $4)
    `;
    const result = await db.query(query, [userId, prod_motorcycles_id, prod_equipment_id, prod_components_id]);
    return result.rows;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}