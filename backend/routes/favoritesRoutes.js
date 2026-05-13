const express = require('express');
const router = express.Router();
const { addToFavorites, removeFromFavorites, getFavoritesController, updateFavorite, getFavoriteById } = require('../controllers/favoritesController');
const { isClientLogged } = require('../middleware/isClientLogged');

router.post('/add', isClientLogged, addToFavorites);
router.post('/remove', isClientLogged, removeFromFavorites);
router.get('/', isClientLogged, getFavoritesController);
router.post('/update', isClientLogged, updateFavorite);
router.get('/:favoriteId', isClientLogged, getFavoriteById);


module.exports = router;
