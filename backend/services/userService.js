const db = require('../db');

module.exports.getAllUsers = async () => {
  const sql = `
    SELECT id, email, first_name, last_name, phone, role, is_blocked, is_email_verified, is_active, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  const result = await db.query(sql);
  return result.rows;
};

module.exports.blockUser = async (userId) => {
  const sql = `
    UPDATE users SET is_blocked = true, token = NULL WHERE id = $1 RETURNING id, email, first_name, last_name, is_blocked
  `;
  const result = await db.query(sql, [userId]);
  return result.rows[0];
};

module.exports.unblockUser = async (userId) => {
  const sql = `
    UPDATE users SET is_blocked = false WHERE id = $1 RETURNING id, email, first_name, last_name, is_blocked
  `;
  const result = await db.query(sql, [userId]);
  return result.rows[0];
};
