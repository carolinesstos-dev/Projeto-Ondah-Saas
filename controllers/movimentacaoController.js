const movimentacaoModel = require('../models/movimentacaoModel');

async function registrarVenda(req, res) {
  const { quantidade } = req.body;

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser maior que zero' });
  }

  try {
    const movimentacao = await movimentacaoModel.registrarVenda(req.params.variacaoId, quantidade);
    res.status(201).json(movimentacao);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

async function listarHistorico(req, res) {
  const historico = await movimentacaoModel.listarMovimentacoesPorVariacao(req.params.variacaoId);
  res.json(historico);
}

module.exports = { registrarVenda, listarHistorico };