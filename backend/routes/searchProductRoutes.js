const express = require('express');
const { searchProduct } = require('../controllers/searchProductController');
const router = express.Router();

router.get('/', searchProduct);

module.exports = router;
