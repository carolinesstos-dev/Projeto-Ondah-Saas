const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', pedidoController.listar);
router.get('/:id', pedidoController.detalhar);
router.put('/:id/confirmar', pedidoController.confirmar);

module.exports = router;