const db = require('../db');

// Перевіряє, чи купував користувач цей товар (статус замовлення: paid, sent, completed, collected)
module.exports.hasUserPurchasedProduct = async (userId, motorcycleId, equipmentId, componentId) => {
  try {
    const sql = `
      SELECT 1 FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = $1
        AND c.status IN ('paid', 'sent', 'completed', 'collected')
        AND (
          ($2::uuid IS NOT NULL AND ci.prod_motorcycles_id = $2::uuid)
          OR ($3::uuid IS NOT NULL AND ci.prod_equipment_id = $3::uuid)
          OR ($4::uuid IS NOT NULL AND ci.prod_components_id = $4::uuid)
        )
      LIMIT 1
    `;
    const result = await db.query(sql, [userId, motorcycleId || null, equipmentId || null, componentId || null]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports.addReview = async (userId, motorcycleId, equipmentId, componentId, rating, text) => {

  try {
    // Перевірка: чи купував користувач цей товар
    const purchased = await module.exports.hasUserPurchasedProduct(userId, motorcycleId, equipmentId, componentId);
    if (!purchased) {
      throw new Error('PURCHASE_REQUIRED');
    }

    // Перевірка: чи вже залишав відгук
    const existingSql = `
      SELECT 1 FROM product_reviews
      WHERE user_id = $1
        AND (
          ($2::uuid IS NOT NULL AND motorcycle_id = $2::uuid)
          OR ($3::uuid IS NOT NULL AND equipment_id = $3::uuid)
          OR ($4::uuid IS NOT NULL AND component_id = $4::uuid)
        )
      LIMIT 1
    `;
    const existing = await db.query(existingSql, [userId, motorcycleId || null, equipmentId || null, componentId || null]);
    if (existing.rows.length > 0) {
      throw new Error('ALREADY_REVIEWED');
    }

    const sql = 'INSERT INTO product_reviews (user_id, motorcycle_id, equipment_id, component_id, rating, text) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const result = await db.query(sql, [userId, motorcycleId, equipmentId, componentId, rating, text]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.getReviews = async (motorcycleId, equipmentId, componentId) => {
  try {
    const sql = `
      SELECT r.*, u.first_name || ' ' || u.last_name as user_name 
      FROM product_reviews r 
      LEFT JOIN users u ON r.user_id = u.id 
      WHERE r.motorcycle_id = $1 OR r.equipment_id = $2 OR r.component_id = $3
    `;
    const result = await db.query(sql, [motorcycleId, equipmentId, componentId]);
    return result.rows;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.deleteReview = async (reviewId, userId) => {
  try {
    const sql = 'DELETE FROM product_reviews WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await db.query(sql, [reviewId, userId]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.updateReview = async (reviewId, userId, rating, text) => {
  try {
    const sql = 'UPDATE product_reviews SET rating = $1, text = $2 WHERE id = $3 AND user_id = $4 RETURNING *';
    const result = await db.query(sql, [rating, text, reviewId, userId]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.getReviewById = async (reviewId) => {
  try {
    const sql = `
      SELECT r.*, u.first_name || ' ' || u.last_name as user_name 
      FROM product_reviews r 
      LEFT JOIN users u ON r.user_id = u.id 
      WHERE r.id = $1
    `;
    const result = await db.query(sql, [reviewId]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

module.exports.getUserReviews = async (userId) => {
  try {
    const sql = `
      SELECT r.*, 
        COALESCE(m.name, e.name, c.name) as product_name,
        CASE 
          WHEN r.motorcycle_id IS NOT NULL THEN 'motorcycle'
          WHEN r.equipment_id IS NOT NULL THEN 'equipment'
          WHEN r.component_id IS NOT NULL THEN 'component'
        END as category
      FROM product_reviews r
      LEFT JOIN prod_motorcycles m ON r.motorcycle_id = m.id
      LEFT JOIN prod_equipment e ON r.equipment_id = e.id
      LEFT JOIN prod_components c ON r.component_id = c.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(sql, [userId]);
    return result.rows;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}