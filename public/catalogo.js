const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

renderSidebar('catalogo');

async function apiFetch(url, options = {}) {
  const resposta = await fetch(url, {
    ...options,
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

function montarQueryString(filtros) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) params.append(chave, valor);
  });
  return params.toString();
}

async function buscarCatalogo() {
  const filtros = {
    codigo: document.getElementById('filtroCodigo').value,
    tamanho: document.getElementById('filtroTamanho').value,
    cor: document.getElementById('filtroCor').value,
    modelo: document.getElementById('filtroModelo').value,
  };

  const query = montarQueryString(filtros);
  const resposta = await apiFetch(`/catalogo?${query}`);
  const itens = await resposta.json();

  const resultado = document.getElementById('resultadoCatalogo');
  resultado.innerHTML = '';

  if (itens.length === 0) {
    resultado.innerHTML = '<p class="text-muted">Nada encontrado com esses filtros.</p>';
    return;
  }

  itens.forEach((item) => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="card p-3">
        <h6>${item.nome}</h6>
        <p class="mb-1">${item.cor || '-'} / ${item.tamanho || '-'}</p>
        <p class="mb-1">R$ ${item.preco}</p>
        <p class="text-muted mb-0">Estoque: ${item.quantidade_estoque}</p>
      </div>
    `;
    resultado.appendChild(col);
  });
}

document.getElementById('formFiltro').addEventListener('submit', (e) => {
  e.preventDefault();
  buscarCatalogo();
});

function getUsuarioIdFromToken() {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.id;
}

document.getElementById('btnCompartilhar').addEventListener('click', () => {
  const usuarioId = getUsuarioIdFromToken();
  const filtros = {
    codigo: document.getElementById('filtroCodigo').value,
    tamanho: document.getElementById('filtroTamanho').value,
    cor: document.getElementById('filtroCor').value,
    modelo: document.getElementById('filtroModelo').value,
  };

  const linkParams = new URLSearchParams({ loja: usuarioId });
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) linkParams.append(chave, valor);
  });

  const link = `${window.location.origin}/loja.html?${linkParams.toString()}`;
  const texto = `Olha o que eu separei pra você: ${link}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
});

buscarCatalogo();