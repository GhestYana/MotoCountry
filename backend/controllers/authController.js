const jwt = require('jsonwebtoken');
const registerService = require('../services/authService.js').registerService;
const loginService = require('../services/authService.js').loginService;
const logoutService = require('../services/authService.js').logoutService;
const verifyEmailService = require('../services/authService.js').verifyEmailService;
// const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

module.exports.registerController = async (req, res) => {
  const { email, first_name, last_name, password, role, phone } = req.body;
  try {
    // Check if user exists
    const userResult = await registerService(email, first_name, last_name, role, phone, password);
    res.status(201).json(userResult);
  } catch (error) {
    res.status(500).json(error.message);
  }
};



module.exports.verifyEmailController = async (req, res) => {
  const { token } = req.params;
  try {
    const result = await verifyEmailService(token);
    // Redirect to a dedicated success page on the frontend
    res.redirect(`http://localhost:5173/verification-success?token=${result.token}`);
  } catch (error) {
    res.redirect(`http://localhost:5173/?error=${encodeURIComponent(error.message)}`);
  }
};

// export const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Find user
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     if (result.rows.length === 0) {
//       return res.status(400).json({ message: 'Невірний емейл' });
//     }

//     const user = result.rows[0];

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Невірний пароль' });
//     }

//     // Generate token
//     const token = jwt.sign({ id: user.id, email: user.email, role: user.role, phone: user.phone }, SECRET_KEY, {
//       expiresIn: '1h',
//     });

//     res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone } });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


module.exports.loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await loginService(email, password);
    res.status(200).json(userResult);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports.logoutController = async (req, res) => {
  const { email, token } = req.body;
  try {
    const userResult = await logoutService(email, token);
    res.status(200).json(userResult);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

