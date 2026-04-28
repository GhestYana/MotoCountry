const express = require('express');
const router = express.Router();

const {
  getEquipmentController,
  getEquipmentByIdController
} = require('../controllers/equipProdController');

router.get('/', getEquipmentController);
router.get('/:id', getEquipmentByIdController);

module.exports = router;