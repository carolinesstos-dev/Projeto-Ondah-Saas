const pool = require('../config/db');
const pedidoModel = require('../models/pedidoModel');

const METODOS_VALIDOS = ['local', 'app_entrega'];

async function criar(req, res) {
  const usuarioId = req.params.usuarioId;
  const { cliente_nome, cliente_contato, metodo_retirada, itens } = req.body;

  if (!cliente_nome) {
    return res.status(400).json({ erro: 'Nome do cliente é obrigatório' });
  }
  if (!METODOS_VALIDOS.includes(metodo_retirada)) {
    return res.status(400).json({ erro: 'Método de retirada inválido' });
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'O carrinho está vazio' });
  }

  try {
    // Busca o preço e confere se cada variação realmente pertence a essa vendedora
    // (nunca confiar no preço vindo do cliente).
    const itensValidados = [];
    for (const item of itens) {
      const variacaoResult = await pool.query(
        `SELECT v.id, v.preco, v.quantidade_estoque
         FROM variacoes v
         JOIN produtos p ON p.id = v.produto_id
         WHERE v.id = $1 AND p.usuario_id = $2 AND v.ativo = true`,
        [item.variacaoId, usuarioId],
      );
      const variacao = variacaoResult.rows[0];
      if (!variacao) {
        return res.status(400).json({ erro: `Item do carrinho não encontrado (id ${item.variacaoId})` });
      }
      if (!item.quantidade || item.quantidade <= 0) {
        return res.status(400).json({ erro: 'Quantidade inválida no carrinho' });
      }
      if (variacao.quantidade_estoque < item.quantidade) {
        return res.status(400).json({ erro: `Estoque insuficiente para o item ${item.variacaoId}` });
      }
      itensValidados.push({
        variacaoId: variacao.id,
        quantidade: item.quantidade,
        precoUnitario: variacao.preco,
      });
    }

    const pedido = await pedidoModel.criarPedido(
      usuarioId,
      cliente_nome,
      cliente_contato,
      metodo_retirada,
      itensValidados,
    );
    res.status(201).json(pedido);
  } catch (err) {
    res.status(400).json({ erro: err.message || 'Não foi possível criar o pedido' });
  }
}

async function listar(req, res) {
  const pedidos = await pedidoModel.listarPedidosPorUsuario(req.usuarioId);
  res.json(pedidos);
}

async function detalhar(req, res) {
  const pedido = await pedidoModel.buscarPedidoComItens(req.params.id, req.usuarioId);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
  res.json(pedido);
}

async function confirmar(req, res) {
  try {
    const pedido = await pedidoModel.confirmarPedido(req.params.id, req.usuarioId);
    res.json(pedido);
  } catch (err) {
    if (err.message === 'Pedido não encontrado') {
      return res.status(404).json({ erro: err.message });
    }
    res.status(400).json({ erro: err.message });
  }
}

module.exports = { criar, listar, detalhar, confirmar };