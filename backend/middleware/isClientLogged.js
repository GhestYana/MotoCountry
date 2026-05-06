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
    req.user = decoded;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};