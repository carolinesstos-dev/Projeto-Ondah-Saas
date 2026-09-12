const express = require('express');
const router = express.Router();
const variacaoController = require('../controllers/variacaoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/:id', variacaoController.show);
router.put('/:id', variacaoController.update);
router.delete('/:id', variacaoController.remove);

module.exports = router;