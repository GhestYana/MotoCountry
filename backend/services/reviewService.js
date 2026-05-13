const db = require('../db');

module.exports.addReview = async (userId, motorcycleId, equipmentId, componentId, rating, text) => {

  try {
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