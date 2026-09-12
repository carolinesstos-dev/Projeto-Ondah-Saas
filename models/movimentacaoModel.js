const pool = require('../config/db');

async function registrarVenda(variacaoId, quantidade) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const variacaoResult = await client.query(
      'SELECT quantidade_estoque FROM variacoes WHERE id = $1 FOR UPDATE',
      [variacaoId]
    );

    if (variacaoResult.rows.length === 0) {
      throw new Error('Variação não encontrada');
    }

    const estoqueAtual = variacaoResult.rows[0].quantidade_estoque;

    if (estoqueAtual < quantidade) {
      throw new Error(`Estoque insuficiente. Disponível: ${estoqueAtual}`);
    }

    await client.query(
      'UPDATE variacoes SET quantidade_estoque = quantidade_estoque - $1 WHERE id = $2',
      [quantidade, variacaoId]
    );

    const movimentacaoResult = await client.query(
      `INSERT INTO movimentacoes_estoque (variacao_id, tipo, quantidade, motivo)
       VALUES ($1, 'saida', $2, 'venda') RETURNING *`,
      [variacaoId, quantidade]
    );

    await client.query('COMMIT');
    return movimentacaoResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listarMovimentacoesPorVariacao(variacaoId) {
  const result = await pool.query(
    'SELECT * FROM movimentacoes_estoque WHERE variacao_id = $1 ORDER BY criado_em DESC',
    [variacaoId]
  );
  return result.rows;
}

module.exports = { registrarVenda, listarMovimentacoesPorVariacao };