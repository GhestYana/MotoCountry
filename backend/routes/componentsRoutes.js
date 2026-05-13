const express = require('express');
const router = express.Router();

const {
  getComponentsController,
  getComponentByIdController,
  addComponentController,
  updateComponentController,
  deleteComponentController
} = require('../controllers/componProdController');
const { isClientLogged, isAdmin } = require('../middleware/isClientLogged');

router.get('/', getComponentsController);
router.get('/:id', getComponentByIdController);

router.post('/', isClientLogged, isAdmin, addComponentController);
router.put('/:id', isClientLogged, isAdmin, updateComponentController);
router.delete('/:id', isClientLogged, isAdmin, deleteComponentController);

module.exports = router;