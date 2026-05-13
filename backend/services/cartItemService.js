const db = require('../db.js');

// delivery_type AS ENUM('Нова Пошта', 'Укрпошта', 'Делівері');
// CREATE TYPE status_type AS ENUM('created', 'sent', 'completed', 'collected', 'returned');
// CREATE TYPE availability_type AS ENUM('available', 'not available', 'expected');


module.exports.addCartItemService = async (quantity, cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id, user_id) => {
  try {
    // 1. Availability validation
    let productDetails;
    if (prod_motorcycles_id) {
      productDetails = await db.query('SELECT availability FROM prod_motorcycles WHERE id = $1', [prod_motorcycles_id]);
    } else if (prod_equipment_id) {
      productDetails = await db.query('SELECT availability FROM prod_equipment WHERE id = $1', [prod_equipment_id]);
    } else if (prod_components_id) {
      productDetails = await db.query('SELECT availability FROM prod_components WHERE id = $1', [prod_components_id]);
    }

    if (productDetails && productDetails.rows[0]) {
      const status = productDetails.rows[0].availability;
      if (status !== 'available') {
        throw new Error("Товар тимчасово недоступний для замовлення");
      }
    }

    let cart_id_to_use = cart_id;

    if (!cart_id_to_use) {
      const existingCart = await db.query('SELECT id FROM carts WHERE user_id = $1 AND status = $2', [user_id, 'created']);
      if (existingCart.rows.length > 0) {
        cart_id_to_use = existingCart.rows[0].id;
      }
    }

    if (!cart_id_to_use) {
      const sql = 'INSERT INTO carts (user_id, status) VALUES ($1, $2) RETURNING id';
      const result = await db.query(sql, [user_id, 'created']);
      cart_id_to_use = result.rows[0].id;
    }

    cart_id = cart_id_to_use;

    // Check if item already exists
    const sqlCheck = `
      SELECT * FROM cart_items 
      WHERE cart_id = $1 
      AND (prod_motorcycles_id IS NOT DISTINCT FROM $2)
      AND (prod_equipment_id IS NOT DISTINCT FROM $3) 
      AND (prod_components_id IS NOT DISTINCT FROM $4)
    `;
    const checkResult = await db.query(sqlCheck, [cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id]);

    if (checkResult.rows.length > 0) {
      const sqlUpdate = `
        UPDATE cart_items SET quantity = quantity + $1 
        WHERE cart_id = $2 
        AND (prod_motorcycles_id IS NOT DISTINCT FROM $3)
        AND (prod_equipment_id IS NOT DISTINCT FROM $4)
        AND (prod_components_id IS NOT DISTINCT FROM $5)
      `;
      await db.query(sqlUpdate, [quantity, cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id]);
    } else {
      const sqlInsert = 'INSERT INTO cart_items (cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id, quantity) VALUES ($1, $2, $3, $4, $5)';
      await db.query(sqlInsert, [cart_id, prod_motorcycles_id, prod_equipment_id, prod_components_id, quantity]);
    }

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