const fs = require("fs");
const path = require("path");
const fotoModel = require("../models/fotoModel");
const produtoModel = require("../models/produtoModel");

async function index(req, res) {
  const produto = await produtoModel.buscarProdutoPorId(
    req.params.produtoId,
    req.usuarioId,
  );
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

  const fotos = await fotoModel.listarFotosPorProduto(req.params.produtoId);
  res.json(fotos);
}

async function upload(req, res) {
  const produto = await produtoModel.buscarProdutoPorId(
    req.params.produtoId,
    req.usuarioId,
  );
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

  const jaExistentes = await fotoModel.contarFotosPorProduto(
    req.params.produtoId,
  );
  const novosArquivos = req.files || [];

  if (jaExistentes + novosArquivos.length > 3) {
    novosArquivos.forEach((arquivo) => fs.unlinkSync(arquivo.path));
    return res.status(400).json({
      erro: `Limite de 3 fotos por produto. Já existem ${jaExistentes}.`,
    });
  }

  const fotosCriadas = [];
  for (const arquivo of novosArquivos) {
    const url = `/uploads/${arquivo.filename}`;
    const foto = await fotoModel.criarFoto(req.params.produtoId, url);
    fotosCriadas.push(foto);
  }

  res.status(201).json(fotosCriadas);
}

async function remove(req, res) {
  const foto = await fotoModel.buscarFotoComDono(req.params.id);
  if (!foto || foto.usuario_id !== req.usuarioId) {
    return res.status(404).json({ erro: "Foto não encontrada" });
  }

  const caminhoArquivo = path.join("public", foto.url);
  if (fs.existsSync(caminhoArquivo)) {
    fs.unlinkSync(caminhoArquivo);
  }

  await fotoModel.excluirFoto(req.params.id);
  res.status(204).send();
}

module.exports = { index, upload, remove };
