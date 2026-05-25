const express = require('express');
const { getReviewById, addReview, deleteReview, updateReview, getReviews, getUserReviewsController, checkPurchase } = require('../controllers/reviewController');

const router = express.Router();

const { isClientLogged } = require('../middleware/isClientLogged');

router.get('/my-reviews', isClientLogged, getUserReviewsController);
router.get('/check-purchase', isClientLogged, checkPurchase);
router.get('/product/:productId', getReviews);
router.get('/:reviewId', getReviewById);
router.post('/add', isClientLogged, addReview);
router.post('/delete', isClientLogged, deleteReview);
router.post('/update', isClientLogged, updateReview);

module.exports = router;