const express = require('express');
const router = express.Router();

const {
  getMotorcyclesController,
  getMotorcycleByIdController,
  addMotorcycleController,
  updateMotorcycleController,
  deleteMotorcycleController
} = require('../controllers/motoProdController');
const { isClientLogged, isAdmin } = require('../middleware/isClientLogged');

router.get('/', getMotorcyclesController);
router.get('/:id', getMotorcycleByIdController);

router.post('/', isClientLogged, isAdmin, addMotorcycleController);
router.put('/:id', isClientLogged, isAdmin, updateMotorcycleController);
router.delete('/:id', isClientLogged, isAdmin, deleteMotorcycleController);

module.exports = router;