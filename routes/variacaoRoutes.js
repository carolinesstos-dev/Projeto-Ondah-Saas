const express = require('express');
const router = express.Router({ mergeParams: true });
const variacaoController = require('../controllers/variacaoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', variacaoController.index);
router.get('/:id', variacaoController.show);
router.post('/', variacaoController.create);
router.put('/:id', variacaoController.update);
router.delete('/:id', variacaoController.remove);

module.exports = router;