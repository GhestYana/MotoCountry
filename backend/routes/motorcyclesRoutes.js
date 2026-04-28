const express = require('express');
const router = express.Router();

const {
  getMotorcyclesController,
  getMotorcycleByIdController
} = require('../controllers/motoProdController');

router.get('/', getMotorcyclesController);
router.get('/:id', getMotorcycleByIdController);

module.exports = router;