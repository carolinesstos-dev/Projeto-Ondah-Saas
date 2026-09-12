const pool = require('../config/db');

async function criarPedido(usuarioId, clienteNome, clienteContato, metodoRetirada, itens) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoResult = await client.query(
      `INSERT INTO pedidos (usuario_id, cliente_nome, cliente_contato, metodo_retirada)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [usuarioId, clienteNome, clienteContato, metodoRetirada]
    );
    const pedido = pedidoResult.rows[0];

    for (const item of itens) {
      await client.query(
        `INSERT INTO pedido_itens (pedido_id, variacao_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedido.id, item.variacaoId, item.quantidade, item.precoUnitario]
      );
    }

    await client.query('COMMIT');
    return pedido;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { criarPedido };

async function listarPedidosPorUsuario(usuarioId) {
  const result = await pool.query(
    'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY criado_em DESC',
    [usuarioId]
  );
  return result.rows;
}

async function buscarPedidoComItens(id, usuarioId) {
  const pedidoResult = await pool.query(
    'SELECT * FROM pedidos WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  const pedido = pedidoResult.rows[0];
  if (!pedido) return null;

  const itensResult = await pool.query(
    `SELECT pi.*, v.cor, v.tamanho, p.nome AS produto_nome
     FROM pedido_itens pi
     JOIN variacoes v ON pi.variacao_id = v.id
     JOIN produtos p ON v.produto_id = p.id
     WHERE pi.pedido_id = $1`,
    [id]
  );

  return { ...pedido, itens: itensResult.rows };
}

async function confirmarPedido(id, usuarioId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoResult = await client.query(
      'SELECT * FROM pedidos WHERE id = $1 AND usuario_id = $2 FOR UPDATE',
      [id, usuarioId]
    );
    const pedido = pedidoResult.rows[0];
    if (!pedido) throw new Error('Pedido não encontrado');
    if (pedido.status === 'confirmado') throw new Error('Pedido já foi confirmado antes');

    const itensResult = await client.query(
      'SELECT * FROM pedido_itens WHERE pedido_id = $1',
      [id]
    );

    for (const item of itensResult.rows) {
      const variacaoResult = await client.query(
        'SELECT quantidade_estoque FROM variacoes WHERE id = $1 FOR UPDATE',
        [item.variacao_id]
      );
      const estoqueAtual = variacaoResult.rows[0].quantidade_estoque;

      if (estoqueAtual < item.quantidade) {
        throw new Error('Estoque insuficiente para confirmar este pedido');
      }

      await client.query(
        'UPDATE variacoes SET quantidade_estoque = quantidade_estoque - $1 WHERE id = $2',
        [item.quantidade, item.variacao_id]
      );

      await client.query(
        `INSERT INTO movimentacoes_estoque (variacao_id, tipo, quantidade, motivo)
         VALUES ($1, 'saida', $2, 'pedido confirmado')`,
        [item.variacao_id, item.quantidade]
      );
    }

    const atualizado = await client.query(
      `UPDATE pedidos SET status = 'confirmado' WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query('COMMIT');
    return atualizado.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { criarPedido, listarPedidosPorUsuario, buscarPedidoComItens, confirmarPedido };