CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  modelo VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE variacoes (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  cor VARCHAR(50),
  tamanho VARCHAR(20),
  preco NUMERIC(10,2) NOT NULL,
  quantidade_estoque INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE movimentacoes_estoque (
  id SERIAL PRIMARY KEY,
  variacao_id INTEGER NOT NULL REFERENCES variacoes(id) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade INTEGER NOT NULL,
  motivo VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

ALTER TABLE produtos ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id);

ALTER TABLE produtos ADD COLUMN codigo SERIAL UNIQUE;

ALTER TABLE produtos ADD COLUMN descricao TEXT;

CREATE TABLE produto_fotos (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  cliente_nome VARCHAR(100) NOT NULL,
  cliente_contato VARCHAR(100),
  metodo_retirada VARCHAR(20) NOT NULL CHECK (metodo_retirada IN ('local', 'app_entrega')),
  status VARCHAR(20) NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'confirmado')),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  variacao_id INTEGER NOT NULL REFERENCES variacoes(id),
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL
);

ALTER TABLE produtos DROP CONSTRAINT produtos_codigo_key;
ALTER TABLE produtos ADD CONSTRAINT produtos_usuario_codigo_unique
  UNIQUE (usuario_id, codigo) DEFERRABLE INITIALLY DEFERRED;

 ALTER TABLE usuarios ADD COLUMN nome_loja VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN contato VARCHAR(150);