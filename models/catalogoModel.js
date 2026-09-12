const pool = require('../config/db');

async function buscarCatalogoFiltrado(usuarioId, filtros) {
  const { tamanho, cor, modelo, codigo } = filtros;

  let query = `
    SELECT p.id AS produto_id, p.nome, p.modelo, p.codigo,
           v.id AS variacao_id, v.cor, v.tamanho, v.preco, v.quantidade_estoque
    FROM produtos p
    JOIN variacoes v ON v.produto_id = p.id
    WHERE p.usuario_id = $1
      AND v.quantidade_estoque > 0
  `;

  const valores = [usuarioId];

  if (tamanho) {
    valores.push(tamanho);
    query += ` AND v.tamanho = $${valores.length}`;
  }

  if (cor) {
    valores.push(cor);
    query += ` AND v.cor = $${valores.length}`;
  }

  if (modelo) {
    valores.push(modelo);
    query += ` AND p.modelo = $${valores.length}`;
  }

  if (codigo) {
  valores.push(parseInt(codigo, 10));
  query += ` AND p.codigo = $${valores.length}`;
}

  query += ' ORDER BY p.nome, v.cor, v.tamanho';

  const result = await pool.query(query, valores);
  return result.rows;
}


module.exports = { buscarCatalogoFiltrado };