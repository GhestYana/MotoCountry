const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  // Check if credentials exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not configured in .env file.');
    return res.status(500).json({ error: 'Помилка сервера. Email не налаштовано.' });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender must be the authenticated user for Gmail
    replyTo: email, // The customer's email so replying goes to them
    to: 'motocountry.store@gmail.com', // Always send to motocountry
    subject: `Нове повідомлення з сайту від ${name}`,
    text: `
      Ім'я: ${name}
      Email: ${email}
      
      Повідомлення: 
      ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Не вдалося відправити повідомлення. Спробуйте пізніше.' });
  }

});

module.exports = router;
