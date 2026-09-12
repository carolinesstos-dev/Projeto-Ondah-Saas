const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

renderSidebar('produtos');

async function apiFetch(url, options = {}) {
  const resposta = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (resposta.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
    throw new Error('Não autenticado');
  }

  return resposta;
}

async function carregarProdutos() {
  const busca = document.getElementById('busca').value;
  const query = busca ? `?busca=${encodeURIComponent(busca)}` : '';
  const resposta = await apiFetch(`/produtos${query}`);

  if (!resposta.ok) {
    console.error('Erro ao carregar produtos:', resposta.status);
    return;
  }

  const produtos = await resposta.json();
  const lista = document.getElementById('listaProdutos');
  lista.innerHTML = '';

  for (const produto of produtos) {
    const variacoesResp = await apiFetch(`/produtos/${produto.id}/variacoes`);
    if (!variacoesResp.ok) {
      console.error('Erro ao carregar variações do produto', produto.id, variacoesResp.status);
      continue;
    }
    const variacoes = await variacoesResp.json();

    const fotosResp = await apiFetch(`/produtos/${produto.id}/fotos`);
    if (!fotosResp.ok) {
      console.error('Erro ao carregar fotos do produto', produto.id, fotosResp.status);
      continue;
    }
    const fotos = await fotosResp.json();

    const variacoesHtml = variacoes.map((v) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${v.cor || '-'} / ${v.tamanho || '-'}</span>
        <span>R$ ${v.preco} — Estoque: ${v.quantidade_estoque}</span>
        <span>
          <button class="btn btn-sm btn-outline-secondary btn-editar-variacao"
                  data-variacao-id="${v.id}"
                  data-cor="${v.cor || ''}"
                  data-tamanho="${v.tamanho || ''}"
                  data-preco="${v.preco}"
                  data-estoque="${v.quantidade_estoque}">Editar</button>
          <button class="btn btn-sm btn-outline-danger btn-excluir-variacao" data-variacao-id="${v.id}">Excluir</button>
        </span>
      </li>
    `).join('');

    const fotosHtml = fotos.map((f) => `
      <div class="position-relative d-inline-block me-2 mb-2">
        <img src="${f.url}" style="width: 80px; height: 80px; object-fit: cover;" class="rounded border">
        <button class="btn btn-sm btn-danger btn-excluir-foto position-absolute top-0 end-0"
                data-foto-id="${f.id}" style="padding: 0 6px;">×</button>
      </div>
    `).join('');

    const card = document.createElement('div');
    card.className = 'card mb-3 p-3';
    const codigoFormatado = String(produto.codigo).padStart(4, '0');

    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <h5>${produto.nome} <small class="text-muted">#${codigoFormatado}</small></h5>
        <div>
          <button class="btn btn-sm btn-outline-secondary btn-editar-produto"
                  data-produto-id="${produto.id}"
                  data-nome="${produto.nome}"
                  data-descricao="${produto.descricao || ''}">Editar</button>
          <button class="btn btn-sm btn-outline-danger btn-excluir-produto"
                  data-produto-id="${produto.id}">Excluir Produto</button>
        </div>
      </div>
      ${produto.descricao ? `<p class="text-muted small">${produto.descricao}</p>` : ''}

      <div class="mb-2">${fotosHtml}</div>
      ${fotos.length < 3 ? `
        <form class="mb-3 form-foto" data-produto-id="${produto.id}">
          <input type="file" name="fotos" accept="image/*" multiple class="form-control form-control-sm d-inline-block w-auto">
          <button type="submit" class="btn btn-sm btn-outline-secondary">Enviar foto(s)</button>
        </form>
      ` : '<p class="text-muted small">Limite de 3 fotos atingido</p>'}

      <ul class="list-group mb-3">${variacoesHtml || '<li class="list-group-item text-muted">Nenhuma variação ainda</li>'}</ul>

      <form class="row g-2 form-variacao" data-produto-id="${produto.id}">
        <div class="col-md-2"><input type="text" class="form-control" placeholder="Cor" name="cor"></div>
        <div class="col-md-2"><input type="text" class="form-control" placeholder="Tamanho" name="tamanho"></div>
        <div class="col-md-2"><input type="number" step="0.01" class="form-control" placeholder="Preço" name="preco" required></div>
        <div class="col-md-2"><input type="number" class="form-control" placeholder="Estoque" name="quantidade_estoque"></div>
        <div class="col-md-2"><button type="submit" class="btn btn-outline-primary w-100">+ Variação</button></div>
      </form>
    `;

    lista.appendChild(card);
  }

  document.querySelectorAll('.form-variacao').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const produtoId = form.dataset.produtoId;
      const dados = Object.fromEntries(new FormData(form));

      await apiFetch(`/produtos/${produtoId}/variacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      carregarProdutos();
    });
  });

  document.querySelectorAll('.btn-excluir-variacao').forEach((botao) => {
  botao.addEventListener('click', async () => {
    const confirmar = confirm('Tem certeza que quer excluir essa variação?');
    if (!confirmar) return;

    const variacaoId = botao.dataset.variacaoId;
    const resposta = await apiFetch(`/variacoes/${variacaoId}`, { method: 'DELETE' });

    if (!resposta.ok) {
      const erro = await resposta.json();
      alert(erro.erro || 'Não foi possível excluir.');
      return;
    }

    // 204 = excluída de verdade. 200 = tinha pedido vinculado e foi desativada em vez de excluída.
    if (resposta.status === 200) {
      const dados = await resposta.json();
      if (dados.aviso) alert(dados.aviso);
    }

    carregarProdutos();
  });
});

  document.querySelectorAll('.btn-editar-variacao').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const novaCor = prompt('Cor:', botao.dataset.cor);
      if (novaCor === null) return;
      const novoTamanho = prompt('Tamanho:', botao.dataset.tamanho);
      if (novoTamanho === null) return;
      const novoPreco = prompt('Preço:', botao.dataset.preco);
      if (novoPreco === null) return;
      const precoNormalizado = novoPreco.replace(',', '.');
      if (isNaN(parseFloat(precoNormalizado))) {
        alert('Preço inválido. Use apenas números (ex: 89.90 ou 89,90).');
        return;
      }
      const novoEstoque = prompt('Estoque:', botao.dataset.estoque);
      if (novoEstoque === null) return;

      const variacaoId = botao.dataset.variacaoId;
      const resposta = await apiFetch(`/variacoes/${variacaoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cor: novaCor,
          tamanho: novoTamanho,
          preco: precoNormalizado,
          quantidade_estoque: novoEstoque,
        }),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        alert(erro.erro || 'Não foi possível salvar as alterações.');
        return;
      }

      carregarProdutos();
    });
  });

 document.querySelectorAll('.btn-excluir-produto').forEach((botao) => {
  botao.addEventListener('click', async () => {
    const confirmar = confirm('Excluir esse produto e todas as suas variações e fotos?');
    if (!confirmar) return;

    const produtoId = botao.dataset.produtoId;
    const resposta = await apiFetch(`/produtos/${produtoId}`, { method: 'DELETE' });

    if (!resposta.ok) {
      const erro = await resposta.json();
      alert(erro.erro || 'Não foi possível excluir.');
      return;
    }

    carregarProdutos();
  });
});

  document.querySelectorAll('.btn-editar-produto').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const novoNome = prompt('Nome / Modelo:', botao.dataset.nome);
      if (novoNome === null) return;
      const novaDescricao = prompt('Descrição:', botao.dataset.descricao);

      const produtoId = botao.dataset.produtoId;
      await apiFetch(`/produtos/${produtoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome, descricao: novaDescricao }),
      });
      carregarProdutos();
    });
  });

  document.querySelectorAll('.form-foto').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const produtoId = form.dataset.produtoId;
      const formData = new FormData(form);

      await apiFetch(`/produtos/${produtoId}/fotos`, {
        method: 'POST',
        body: formData,
      });

      carregarProdutos();
    });
  });

  document.querySelectorAll('.btn-excluir-foto').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const confirmar = confirm('Excluir essa foto?');
      if (!confirmar) return;

      const fotoId = botao.dataset.fotoId;
      await apiFetch(`/fotos/${fotoId}`, { method: 'DELETE' });
      carregarProdutos();
    });
  });
}

document.getElementById('formNovoProduto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const descricao = document.getElementById('descricao').value;

  await apiFetch('/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, descricao }),
  });

  document.getElementById('formNovoProduto').reset();
  carregarProdutos();
});

document.getElementById('busca').addEventListener('input', () => {
  carregarProdutos();
});

carregarProdutos();