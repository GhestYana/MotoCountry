
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productsRoutes = require('./routes/productsRoutes');
const cartItemRoutes = require('./routes/cartItemRoutes');
const authRoutes = require('./routes/authRoutes');
const isClientLogged = require('./middleware/isClientLogged').isClientLogged;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productsRoutes)
app.use('/api/cart-items', isClientLogged, cartItemRoutes)
app.use('/api/auth', authRoutes);

app.use('/static', express.static('static'));




// app.get('/api/test', async (req, res) => {
//   const result = await pool.query('SELECT NOW()');
//   res.json(result.rows[0]);
// });

// app.use('/api/motos', motosRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Running on ${process.env.HOST}:${process.env.PORT}`);
});
