const express = require('express');
const router = express.Router();

const {
  getEquipmentController,
  getEquipmentByIdController,
  addEquipmentController,
  updateEquipmentController,
  deleteEquipmentController
} = require('../controllers/equipProdController');
const { isClientLogged, isAdmin } = require('../middleware/isClientLogged');

router.get('/', getEquipmentController);
router.get('/:id', getEquipmentByIdController);

router.post('/', isClientLogged, isAdmin, addEquipmentController);
router.put('/:id', isClientLogged, isAdmin, updateEquipmentController);
router.delete('/:id', isClientLogged, isAdmin, deleteEquipmentController);

module.exports = router;