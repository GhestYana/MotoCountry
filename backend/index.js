
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productsRoutes = require('./routes/productsRoutes');
const cartItemRoutes = require('./routes/cartItemRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const isClientLogged = require('./middleware/isClientLogged').isClientLogged;
const motorcyclesRoutes = require('./routes/motorcyclesRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const componentsRoutes = require('./routes/componentsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productsRoutes)
app.use('/api/cart-items', isClientLogged, cartItemRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/motorcycles', motorcyclesRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/components', componentsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/favorites', favoritesRoutes);

app.use('/static', express.static('static'));

// app.get('/api/test', async (req, res) => {
//   const result = await pool.query('SELECT NOW()');
//   res.json(result.rows[0]);
// });

// app.use('/api/motos', motosRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Running on ${process.env.HOST}:${process.env.PORT}`);
});
