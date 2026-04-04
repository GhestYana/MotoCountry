const db = require('../db');

module.exports.isClientLogged = async (req, res, next) => {
  try {
    // console.log("555555555555555", req.headers);
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const sql = 'SELECT * FROM users WHERE token = $1';
    const data = [token];
    const result = await db.query(sql, data);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
