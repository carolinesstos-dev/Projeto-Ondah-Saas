const express = require('express');
const router = express.Router({ mergeParams: true });
const movimentacaoController = require('../controllers/movimentacaoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.post('/vender', movimentacaoController.registrarVenda);
router.get('/', movimentacaoController.listarHistorico);

module.exports = router;