const express = require('express');
const router = express.Router();
const fotoController = require('../controllers/fotoController');
const verificarToken = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.delete('/:id', fotoController.remove);

module.exports = router;