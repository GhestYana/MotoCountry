// const db = require('../db');

// module.exports.createCartService = async (user_id, product_id, quantity) => {
//   try {
//     const sql = `INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3)`;

//     const data = [user_id, product_id, quantity];
//     const result = await db.query(sql, data);
//     return result.rows[0];
//   } catch (error) {
//     console.error(error);
//     throw new Error(error.message);
//   }
// }

