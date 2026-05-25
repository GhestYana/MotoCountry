const express = require('express');
const { getAllUsersController, blockUserController, unblockUserController } = require('../controllers/userController');
const { isClientLogged, isAdmin } = require('../middleware/isClientLogged');

const router = express.Router();

router.get('/', isClientLogged, isAdmin, getAllUsersController);
router.patch('/:userId/block', isClientLogged, isAdmin, blockUserController);
router.patch('/:userId/unblock', isClientLogged, isAdmin, unblockUserController);

module.exports = router;
