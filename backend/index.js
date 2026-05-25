
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ensureBucket } = require('./config/minio');
const productsRoutes = require('./routes/productsRoutes');
const cartItemRoutes = require('./routes/cartItemRoutes');
const cartRoutes = require('./routes/cartRouter');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const isClientLogged = require('./middleware/isClientLogged').isClientLogged;
const motorcyclesRoutes = require('./routes/motorcyclesRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const componentsRoutes = require('./routes/componentsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const searchProductRoutes = require('./routes/searchProductRoutes');
const reviewRoutes = require('./routes/reviewRouter');
const orderRoutes = require('./routes/orderRouter');
const notificationRoutes = require('./routes/notificationRouter');
const deliveryRoutes = require('./routes/deliveryRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Favicon handler to avoid 403/404 noise
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/api/products', productsRoutes);
app.use('/api/cart-items', isClientLogged, cartItemRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/motorcycles', motorcyclesRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/components', componentsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/search', searchProductRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/users', userRoutes);

app.use('/static', express.static('static'));

// app.get('/api/test', async (req, res) => {
//   const result = await pool.query('SELECT NOW()');
//   res.json(result.rows[0]);
// });

// app.use('/api/motos', motosRoutes);

const server = app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Running on ${process.env.HOST}:${process.env.PORT}`);
  ensureBucket();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${process.env.PORT} is already in use. Please free it and try again.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
