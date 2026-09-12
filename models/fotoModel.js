const pool = require('../config/db');

async function contarFotosPorProduto(produtoId) {
  const result = await pool.query(
    'SELECT COUNT(*) FROM produto_fotos WHERE produto_id = $1',
    [produtoId]
  );
  return parseInt(result.rows[0].count, 10);
}

async function criarFoto(produtoId, url) {
  const result = await pool.query(
    'INSERT INTO produto_fotos (produto_id, url) VALUES ($1, $2) RETURNING *',
    [produtoId, url]
  );
  return result.rows[0];
}

async function listarFotosPorProduto(produtoId) {
  const result = await pool.query(
    'SELECT * FROM produto_fotos WHERE produto_id = $1 ORDER BY id',
    [produtoId]
  );
  return result.rows;
}

async function buscarFotoComDono(fotoId) {
  const result = await pool.query(
    `SELECT f.*, p.usuario_id
     FROM produto_fotos f
     JOIN produtos p ON f.produto_id = p.id
     WHERE f.id = $1`,
    [fotoId]
  );
  return result.rows[0];
}

async function excluirFoto(id) {
  await pool.query('DELETE FROM produto_fotos WHERE id = $1', [id]);
}

module.exports = {
  contarFotosPorProduto,
  criarFoto,
  listarFotosPorProduto,
  buscarFotoComDono,
  excluirFoto,
};