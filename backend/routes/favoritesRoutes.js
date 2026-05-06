const express = require('express');
const router = express.Router();
const { addToFavorites, removeFromFavorites, getFavoritesController } = require('../controllers/favoritesController');
const { isClientLogged } = require('../middleware/isClientLogged');

router.post('/add', isClientLogged, addToFavorites);
router.post('/remove', isClientLogged, removeFromFavorites);
router.get('/', isClientLogged, getFavoritesController);

module.exports = router;
