const express = require('express');
const router = express.Router();

const {
  getComponentsController,
  getComponentByIdController
} = require('../controllers/componProdController');

router.get('/', getComponentsController);
router.get('/:id', getComponentByIdController);

module.exports = router;