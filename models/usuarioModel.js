const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function criarUsuario(nome, email, senha) {
  const senhaHash = await bcrypt.hash(senha, 10);
  const result = await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
    [nome, email, senhaHash]
  );
  return result.rows[0];
}

async function buscarUsuarioPorEmail(email) {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
}

async function buscarUsuarioPorId(id) {
  const result = await pool.query(
    'SELECT id, nome, email, nome_loja, contato, criado_em FROM usuarios WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function atualizarPerfil(id, nome, nomeLoja, contato) {
  const result = await pool.query(
    `UPDATE usuarios SET nome = $1, nome_loja = $2, contato = $3
     WHERE id = $4
     RETURNING id, nome, email, nome_loja, contato, criado_em`,
    [nome, nomeLoja || null, contato || null, id]
  );
  return result.rows[0];
}

async function atualizarSenha(id, novaSenha) {
  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await pool.query('UPDATE usuarios SET senha_hash = $1 WHERE id = $2', [senhaHash, id]);
}

module.exports = {
  criarUsuario,
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  atualizarPerfil,
  atualizarSenha,
};