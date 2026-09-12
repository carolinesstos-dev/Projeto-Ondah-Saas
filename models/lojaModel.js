const pool = require('../config/db');

async function listarProdutosDaLoja(usuarioId, filtros = {}) {
  const { tamanho, cor, modelo, codigo } = filtros;

  let queryProdutos = `SELECT id, nome, descricao, codigo, modelo FROM produtos WHERE usuario_id = $1`;
  const valoresProdutos = [usuarioId];

  if (modelo) {
    valoresProdutos.push(modelo);
    queryProdutos += ` AND modelo = $${valoresProdutos.length}`;
  }
  if (codigo) {
    valoresProdutos.push(parseInt(codigo, 10));
    queryProdutos += ` AND codigo = $${valoresProdutos.length}`;
  }
  queryProdutos += ' ORDER BY nome';

  const produtos = await pool.query(queryProdutos, valoresProdutos);
  const resultado = [];

  for (const produto of produtos.rows) {
    let queryVariacoes = `SELECT id, cor, tamanho, preco, quantidade_estoque FROM variacoes WHERE produto_id = $1 AND quantidade_estoque > 0`;
    const valoresVariacoes = [produto.id];

    if (tamanho) {
      valoresVariacoes.push(tamanho);
      queryVariacoes += ` AND tamanho = $${valoresVariacoes.length}`;
    }
    if (cor) {
      valoresVariacoes.push(cor);
      queryVariacoes += ` AND cor = $${valoresVariacoes.length}`;
    }

    const variacoes = await pool.query(queryVariacoes, valoresVariacoes);

    const fotos = await pool.query(
      `SELECT url FROM produto_fotos WHERE produto_id = $1 ORDER BY id`,
      [produto.id]
    );

    resultado.push({
      ...produto,
      variacoes: variacoes.rows,
      fotos: fotos.rows.map((f) => f.url),
    });
  }

  return resultado.filter((p) => p.variacoes.length > 0);
}

module.exports = { listarProdutosDaLoja };

