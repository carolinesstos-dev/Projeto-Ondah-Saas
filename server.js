require('dotenv').config();

const express = require("express");
const pool = require("./config/db");
const produtoRoutes = require("./routes/produtoRoutes");
const variacaoRoutes = require("./routes/variacaoRoutes");
const movimentacaoRoutes = require("./routes/movimentacaoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const catalogoRoutes = require("./routes/catalogoRoutes");
const variacaoItemRoutes = require("./routes/variacaoItemRoutes");
const fotoRoutes = require("./routes/fotoRoutes");
const fotoItemRoutes = require("./routes/fotoItemRoutes");
const lojaRoutes = require('./routes/lojaRoutes');
const pedidoItemRoutes = require('./routes/pedidoItemRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('etag', false);

app.use(express.json());

// Evita que o navegador cacheie/valide respostas das rotas de API com 304.
// Fica antes das rotas de API e antes do express.static, então os arquivos
// estáticos (html, css, js, imagens) continuam com cache normal.
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get("/", (req, res) => {
  res.send("Servidor rodando! 🎉");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Conectado ao banco! Hora do servidor: ${result.rows[0].now}`);
  } catch (err) {
    res.status(500).send("Erro ao conectar: " + err.message);
  }
});

app.use("/produtos", produtoRoutes);
app.use("/produtos/:produtoId/variacoes", variacaoRoutes);
app.use("/variacoes/:variacaoId/movimentacoes", movimentacaoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/catalogo", catalogoRoutes);
app.use(express.static("public"));
app.use("/variacoes", variacaoItemRoutes);
app.use("/produtos/:produtoId/fotos", fotoRoutes);
app.use("/fotos", fotoItemRoutes);
app.use('/loja', lojaRoutes);
app.use('/pedidos', pedidoItemRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});