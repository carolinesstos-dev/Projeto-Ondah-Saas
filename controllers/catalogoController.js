const catalogoModel = require('../models/catalogoModel');

async function buscar(req, res) {
  const { tamanho, cor, modelo, codigo } = req.query;
  const catalogo = await catalogoModel.buscarCatalogoFiltrado(req.usuarioId, { tamanho, cor, modelo, codigo });
  res.json(catalogo);
}

module.exports = { buscar };