const pool = require('../config/db');

async function listarProdutos(usuarioId, busca) {
  if (busca) {
    const result = await pool.query(
      `SELECT * FROM produtos
       WHERE usuario_id = $1
         AND (nome ILIKE $2 OR codigo::text = $3)
       ORDER BY id`,
      [usuarioId, `%${busca}%`, busca]
    );
    return result.rows;
  }

  const result = await pool.query(
    'SELECT * FROM produtos WHERE usuario_id = $1 ORDER BY id',
    [usuarioId]
  );
  return result.rows;
}

async function buscarProdutoPorId(id, usuarioId) {
  const result = await pool.query(
    'SELECT * FROM produtos WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return result.rows[0];
}

async function criarProduto(nome, descricao, usuarioId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Trava por usuária: evita que dois cadastros simultâneos calculem o mesmo próximo código
    await client.query('SELECT pg_advisory_xact_lock($1)', [usuarioId]);

    const proximoCodigoResult = await client.query(
      'SELECT COALESCE(MAX(codigo), 0) + 1 AS proximo FROM produtos WHERE usuario_id = $1',
      [usuarioId]
    );
    const proximoCodigo = proximoCodigoResult.rows[0].proximo;

    const result = await client.query(
      'INSERT INTO produtos (nome, descricao, usuario_id, codigo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, descricao, usuarioId, proximoCodigo]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function atualizarProduto(id, nome, descricao, usuarioId) {
  const result = await pool.query(
    'UPDATE produtos SET nome = $1, descricao = $2 WHERE id = $3 AND usuario_id = $4 RETURNING *',
    [nome, descricao, id, usuarioId]
  );
  return result.rows[0];
}

async function excluirProduto(id, usuarioId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET CONSTRAINTS ALL DEFERRED');

    await client.query('DELETE FROM produtos WHERE id = $1 AND usuario_id = $2', [id, usuarioId]);

    await client.query(
      `UPDATE produtos p
       SET codigo = n.novo_codigo
       FROM (
         SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS novo_codigo
         FROM produtos
         WHERE usuario_id = $1
       ) n
       WHERE p.id = n.id`,
      [usuarioId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  excluirProduto,
};