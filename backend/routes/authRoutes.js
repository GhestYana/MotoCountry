const express = require('express');
const registerController = require('../controllers/authController.js').registerController;
const loginController = require('../controllers/authController.js').loginController;
const logoutController = require('../controllers/authController.js').logoutController;
const verifyEmailController = require('../controllers/authController.js').verifyEmailController;

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/logout', logoutController);
router.get('/verify-email/:token', verifyEmailController);


module.exports = router;
