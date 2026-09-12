const pool = require('../config/db');

async function listarVariacoesPorProduto(produtoId) {
  const resultado = await pool.query(
    `SELECT id, produto_id, cor, tamanho, preco, quantidade_estoque, criado_em
     FROM variacoes
     WHERE produto_id = $1 AND ativo = true
     ORDER BY id`,
    [produtoId],
  );
  return resultado.rows;
}

async function buscarVariacaoPorId(id) {
  const resultado = await pool.query(
    `SELECT id, produto_id, cor, tamanho, preco, quantidade_estoque, criado_em
     FROM variacoes
     WHERE id = $1`,
    [id],
  );
  return resultado.rows[0] || null;
}

// Traz a variação junto com o usuario_id do dono do produto (para checagem de posse no controller)
async function buscarVariacaoComDono(variacaoId) {
  const resultado = await pool.query(
    `SELECT v.id, v.produto_id, v.cor, v.tamanho, v.preco, v.quantidade_estoque, v.criado_em,
            p.usuario_id
     FROM variacoes v
     JOIN produtos p ON p.id = v.produto_id
     WHERE v.id = $1`,
    [variacaoId],
  );
  return resultado.rows[0] || null;
}

async function criarVariacao(produtoId, cor, tamanho, preco, quantidadeEstoque) {
  const resultado = await pool.query(
    `INSERT INTO variacoes (produto_id, cor, tamanho, preco, quantidade_estoque)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, produto_id, cor, tamanho, preco, quantidade_estoque, criado_em`,
    [produtoId, cor || null, tamanho || null, preco, quantidadeEstoque],
  );
  return resultado.rows[0];
}

async function atualizarVariacao(id, cor, tamanho, preco, quantidadeEstoque) {
  const resultado = await pool.query(
    `UPDATE variacoes
     SET cor = $2, tamanho = $3, preco = $4, quantidade_estoque = $5
     WHERE id = $1
     RETURNING id, produto_id, cor, tamanho, preco, quantidade_estoque, criado_em`,
    [id, cor || null, tamanho || null, preco, quantidadeEstoque],
  );
  return resultado.rows[0];
}

async function excluirVariacao(id) {
  await pool.query('DELETE FROM variacoes WHERE id = $1', [id]);
}

// Usado quando a exclusão real falha por haver pedidos vinculados (FK 23503).
// Marca a variação como inativa: some das telas, mas o histórico dos pedidos continua íntegro.
async function desativarVariacao(id) {
  const resultado = await pool.query(
    `UPDATE variacoes SET ativo = false WHERE id = $1
     RETURNING id, produto_id, cor, tamanho, preco, quantidade_estoque, criado_em, ativo`,
    [id],
  );
  return resultado.rows[0];
}

module.exports = {
  listarVariacoesPorProduto,
  buscarVariacaoPorId,
  buscarVariacaoComDono,
  criarVariacao,
  atualizarVariacao,
  excluirVariacao,
  desativarVariacao,
};