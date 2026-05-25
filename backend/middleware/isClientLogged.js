const db = require('../db');
const jwt = require('jsonwebtoken');

module.exports.isClientLogged = async (req, res, next) => {
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("AUTH HEADER:", req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Перевіряємо чи не заблокований користувач
    const result = await db.query('SELECT is_blocked FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (result.rows[0].is_blocked) {
      return res.status(403).json({ message: 'Ваш обліковий запис заблоковано' });
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};