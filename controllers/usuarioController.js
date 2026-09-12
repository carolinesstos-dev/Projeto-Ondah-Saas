const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

async function cadastrar(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios' });
  }

  try {
    const usuario = await usuarioModel.criarUsuario(nome, email, senha);
    res.status(201).json(usuario);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar usuária' });
  }
}

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
  }

  const usuario = await usuarioModel.buscarUsuarioPorEmail(email);
  if (!usuario) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
}

async function perfil(req, res) {
  const usuario = await usuarioModel.buscarUsuarioPorId(req.usuarioId);
  if (!usuario) return res.status(404).json({ erro: 'Usuária não encontrada' });
  res.json(usuario);
}

async function atualizarPerfil(req, res) {
  const { nome, nome_loja, contato } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });

  const usuarioAtualizado = await usuarioModel.atualizarPerfil(
    req.usuarioId,
    nome,
    nome_loja,
    contato,
  );
  res.json(usuarioAtualizado);
}

async function alterarSenha(req, res) {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias' });
  }
  if (novaSenha.length < 6) {
    return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres' });
  }

  const usuario = await usuarioModel.buscarUsuarioPorEmail(
    (await usuarioModel.buscarUsuarioPorId(req.usuarioId)).email,
  );

  const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha_hash);
  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Senha atual incorreta' });
  }

  await usuarioModel.atualizarSenha(req.usuarioId, novaSenha);
  res.json({ mensagem: 'Senha alterada com sucesso' });
}

module.exports = { cadastrar, login, perfil, atualizarPerfil, alterarSenha };