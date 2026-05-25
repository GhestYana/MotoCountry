const reviewService = require('../services/reviewService');

module.exports.addReview = async (req, res) => {
  try {
    const { userId, motorcycleId, equipmentId, componentId, rating, text } = req.body;
    const result = await reviewService.addReview(userId, motorcycleId, equipmentId, componentId, rating, text);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'PURCHASE_REQUIRED') {
      return res.status(403).json({ message: 'Ви можете залишити відгук лише на куплений товар' });
    }
    if (error.message === 'ALREADY_REVIEWED') {
      return res.status(409).json({ message: 'Ви вже залишали відгук на цей товар' });
    }
    res.status(500).json({ message: 'Error adding review' });
  }
}

module.exports.checkPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { motorcycleId, equipmentId, componentId } = req.query;
    const purchased = await reviewService.hasUserPurchasedProduct(
      userId,
      motorcycleId || null,
      equipmentId || null,
      componentId || null
    );
    res.json({ purchased });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error checking purchase' });
  }
}

module.exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await reviewService.getReviews(productId, productId, productId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting reviews' });
  }
}

module.exports.getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const result = await reviewService.getReviewById(reviewId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting review' });
  }
}

module.exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    const userId = req.user.id;
    const result = await reviewService.deleteReview(reviewId, userId);
    if (!result) return res.status(403).json({ message: 'Unauthorized or review not found' });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting review' });
  }
}

module.exports.updateReview = async (req, res) => {
  try {
    const { reviewId, rating, text } = req.body;
    const userId = req.user.id;
    const result = await reviewService.updateReview(reviewId, userId, rating, text);
    if (!result) return res.status(403).json({ message: 'Unauthorized or review not found' });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating review' });
  }
}

module.exports.getUserReviewsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await reviewService.getUserReviews(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting user reviews' });
  }
}
