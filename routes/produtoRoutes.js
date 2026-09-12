const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', produtoController.index);
router.get('/:id', produtoController.show);
router.post('/', produtoController.create);
router.put('/:id', produtoController.update);
router.delete('/:id', produtoController.remove);

module.exports = router;