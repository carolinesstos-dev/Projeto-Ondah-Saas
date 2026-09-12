const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/cadastrar', usuarioController.cadastrar);
router.post('/login', usuarioController.login);

router.get('/me', verificarToken, usuarioController.perfil);
router.put('/me', verificarToken, usuarioController.atualizarPerfil);
router.put('/me/senha', verificarToken, usuarioController.alterarSenha);

module.exports = router;