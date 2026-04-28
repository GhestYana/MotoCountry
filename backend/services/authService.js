const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const db = require('../db.js');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

module.exports.registerService = async (email, first_name, last_name, role, phone, password) => {
  try {
    // 1. Проверка
    const sql = `SELECT * FROM users WHERE email = $1 OR phone = $2`;
    const userResult = await db.query(sql, [email, phone]);
    if (userResult.rows.length > 0) {
      throw new Error('Користувач вже існує');
    }

    // 2. Хеш
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Создание пользователя
    const sql2 = `
      INSERT INTO users 
      (email, first_name, last_name, password_hash, role, phone, is_email_verified, is_blocked, is_active) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
      RETURNING *
    `;
    const result = await db.query(sql2, [
      email,
      first_name,
      last_name,
      hashedPassword,
      role || 'client',
      phone,
      false,
      false,
      true
    ]);

    const user = result.rows[0];

    // ✅ 4. EMAIL TOKEN (только для подтверждения)
    const emailToken = jwt.sign(
      { email: user.email, phone: user.phone },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    // ✅ 5. AUTH TOKEN (логин)
    const authToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '2d' }
    );

    // 6. Отправка email
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'motocountry.store@gmail.com',
        pass: 'kbxt ljpm fman tocs',
      },
    });

    await transporter.sendMail({
      from: 'Motocountry',
      to: email,
      subject: 'Підтвердження реєстрації',
      html: `
        <h3>Ласкаво просимо!</h3>
        <p>Підтвердіть email:</p>
        <a href="http://localhost:5000/api/auth/verify-email/${emailToken}">
          Підтвердити
        </a>
      `
    });

    // 7. Возврат (авто-логин)
    return {
      message: 'Лист відправлено',
      token: authToken,
      user
    };

  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports.verifyEmailService = async (token) => {
  try {
    const decodedToken = jwt.verify(token, SECRET_KEY);
    const sql = `SELECT * FROM users WHERE email = $1 AND phone = $2`;
    const result = await db.query(sql, [decodedToken.email, decodedToken.phone]);

    if (result.rows.length === 0) throw new Error('Користувача не знайдено');
    const user = result.rows[0];

    const sql2 = 'UPDATE users SET is_email_verified = true WHERE id = $1';
    await db.query(sql2, [user.id]);

    // Generate a fresh AUTH token for login
    const authToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '2d' }
    );

    return { token: authToken, user };
  } catch (error) {
    console.error(error);
    throw new Error(error.message)
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


module.exports.loginService = async (email, password) => {
  try {
    const sql = `SELECT * FROM users WHERE email = $1`;

    const userResult = await db.query(sql, [email]);
    if (userResult.rows.length === 0) throw new Error('Користувача з таким імейлом не існує');

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error('Невірний пароль');

    if (!user.is_email_verified) throw new Error('Ваш e-mail не підтверджено');
    if (user.is_blocked) throw new Error('Ваш обліковий запис заблоковано');

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '2d' }
    );
    const addToken = `UPDATE users SET token = $1 WHERE id = $2`;
    await db.query(addToken, [token, user.id]);
    return { token, user };
  } catch (error) {
    console.error(error);
    throw new Error(error.message)
  }
}

module.exports.logoutService = async (email, token) => {
  try {
    const sql = `SELECT * FROM users WHERE email = $1 AND token = $2`;
    const userResult = await db.query(sql, [email, token]);
    if (userResult.rows.length === 0) throw new Error('Ви не авторизовані');

    const user = userResult.rows[0];
    const sql2 = `UPDATE users SET token = NULL WHERE id = $1`;
    await db.query(sql2, [user.id]);
    return ('Ви успішно вийшли з облікового запису');

  } catch (error) {
    console.error(error);
    throw new Error(error.message)
  }
}
