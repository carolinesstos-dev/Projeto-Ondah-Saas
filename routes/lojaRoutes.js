const express = require('express');
const router = express.Router();
const lojaController = require('../controllers/lojaController');
const pedidoController = require('../controllers/pedidoController');

router.get('/:usuarioId/info', lojaController.info);
router.get('/:usuarioId/produtos', lojaController.listarProdutos);
router.post('/:usuarioId/pedidos', pedidoController.criar);

module.exports = router;