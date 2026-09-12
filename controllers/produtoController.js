const produtoModel = require("../models/produtoModel");

async function index(req, res) {
  const { busca } = req.query;
  const produtos = await produtoModel.listarProdutos(req.usuarioId, busca);
  res.json(produtos);
}

async function show(req, res) {
  const produto = await produtoModel.buscarProdutoPorId(
    req.params.id,
    req.usuarioId,
  );
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
  res.json(produto);
}

async function create(req, res) {
  const { nome, descricao } = req.body;
  if (!nome) return res.status(400).json({ erro: "Nome é obrigatório" });
  const novoProduto = await produtoModel.criarProduto(
    nome,
    descricao,
    req.usuarioId,
  );
  res.status(201).json(novoProduto);
}

async function update(req, res) {
  const { nome, descricao } = req.body;
  const produtoAtualizado = await produtoModel.atualizarProduto(
    req.params.id,
    nome,
    descricao,
    req.usuarioId,
  );
  if (!produtoAtualizado)
    return res.status(404).json({ erro: "Produto não encontrado" });
  res.json(produtoAtualizado);
}

async function remove(req, res) {
  try {
    await produtoModel.excluirProduto(req.params.id, req.usuarioId);
    res.status(204).send();
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({
        erro: "Não é possível excluir: este produto já tem pedidos registrados.",
      });
    }
    throw err;
  }
}

module.exports = { index, show, create, update, remove };
