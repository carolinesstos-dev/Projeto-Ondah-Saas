const lojaModel = require('../models/lojaModel');
const usuarioModel = require('../models/usuarioModel');

async function listarProdutos(req, res) {
  const { tamanho, cor, modelo, codigo } = req.query;
  const produtos = await lojaModel.listarProdutosDaLoja(req.params.usuarioId, { tamanho, cor, modelo, codigo });
  res.json(produtos);
}

async function info(req, res) {
  const usuario = await usuarioModel.buscarUsuarioPorId(req.params.usuarioId);
  if (!usuario) return res.status(404).json({ erro: 'Loja não encontrada' });
  res.json({ nome_loja: usuario.nome_loja || usuario.nome });
}

module.exports = { listarProdutos, info };