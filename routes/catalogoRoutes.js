const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);
router.get('/', catalogoController.buscar);

module.exports = router;