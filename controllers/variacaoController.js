const variacaoModel = require("../models/variacaoModel");
const produtoModel = require("../models/produtoModel");

async function index(req, res) {
  const produto = await produtoModel.buscarProdutoPorId(
    req.params.produtoId,
    req.usuarioId,
  );
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

  const variacoes = await variacaoModel.listarVariacoesPorProduto(
    req.params.produtoId,
  );
  res.json(variacoes);
}

async function show(req, res) {
  const variacao = await variacaoModel.buscarVariacaoComDono(req.params.id);
  if (!variacao || variacao.usuario_id !== req.usuarioId) {
    return res.status(404).json({ erro: "Variação não encontrada" });
  }
  res.json(variacao);
}

async function create(req, res) {
  const produto = await produtoModel.buscarProdutoPorId(
    req.params.produtoId,
    req.usuarioId,
  );
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

  const { cor, tamanho, preco, quantidade_estoque } = req.body;
  if (!preco) return res.status(400).json({ erro: "Preço é obrigatório" });
  const novaVariacao = await variacaoModel.criarVariacao(
    req.params.produtoId,
    cor,
    tamanho,
    preco,
    quantidade_estoque || 0,
  );
  res.status(201).json(novaVariacao);
}

async function update(req, res) {
  const variacaoExistente = await variacaoModel.buscarVariacaoComDono(
    req.params.id,
  );
  if (!variacaoExistente || variacaoExistente.usuario_id !== req.usuarioId) {
    return res.status(404).json({ erro: "Variação não encontrada" });
  }

  const { cor, tamanho, preco, quantidade_estoque } = req.body;
  if (!preco) return res.status(400).json({ erro: "Preço é obrigatório" });

  const variacaoAtualizada = await variacaoModel.atualizarVariacao(
    req.params.id,
    cor,
    tamanho,
    preco,
    quantidade_estoque,
  );
  res.json(variacaoAtualizada);
}

async function remove(req, res) {
  const variacaoExistente = await variacaoModel.buscarVariacaoComDono(
    req.params.id,
  );
  if (!variacaoExistente || variacaoExistente.usuario_id !== req.usuarioId) {
    return res.status(404).json({ erro: "Variação não encontrada" });
  }

  try {
    await variacaoModel.excluirVariacao(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err.code === "23503") {
      // Já existem pedidos vinculados: não dá pra apagar sem quebrar o histórico.
      // Em vez de bloquear, desativa a variação (some das telas, mas o registro é preservado).
      const desativada = await variacaoModel.desativarVariacao(req.params.id);
      return res.status(200).json({
        aviso: "Esta variação já tem pedidos registrados e foi desativada em vez de excluída.",
        variacao: desativada,
      });
    }
    throw err;
  }
}

module.exports = { index, show, create, update, remove };