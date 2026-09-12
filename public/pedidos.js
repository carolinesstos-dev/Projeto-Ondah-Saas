const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

renderSidebar('pedidos');

let modalDetalhe;
let pedidoAtualId = null;

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

function formatarData(dataIso) {
  const data = new Date(dataIso);
  return data.toLocaleString('pt-BR');
}

function rotuloStatus(status) {
  return status === 'confirmado'
    ? '<span class="badge bg-success">Confirmado</span>'
    : '<span class="badge bg-warning text-dark">Aguardando confirmação</span>';
}

function rotuloRetirada(metodo) {
  return metodo === 'app_entrega'
    ? 'Retirada com Uber/99 pago pelo comprador'
    : 'Retirar no local';
}

async function carregarPedidos() {
  const resposta = await apiFetch('/pedidos');
  if (!resposta.ok) {
    console.error('Erro ao carregar pedidos:', resposta.status);
    return;
  }

  const pedidos = await resposta.json();
  const lista = document.getElementById('listaPedidos');
  lista.innerHTML = '';

  if (pedidos.length === 0) {
    lista.innerHTML = '<p class="text-muted">Nenhum pedido recebido ainda.</p>';
    return;
  }

  pedidos.forEach((pedido) => {
    const card = document.createElement('div');
    card.className = 'card mb-3 p-3';
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">Pedido #${pedido.id} — ${pedido.cliente_nome}</h6>
          <small class="text-muted">${formatarData(pedido.criado_em)} · ${rotuloRetirada(pedido.metodo_retirada)}</small>
        </div>
        <div class="text-end">
          <div class="mb-2">${rotuloStatus(pedido.status)}</div>
          <button class="btn btn-sm btn-outline-primary btn-ver-detalhe" data-pedido-id="${pedido.id}">Ver detalhes</button>
        </div>
      </div>
    `;
    lista.appendChild(card);
  });

  document.querySelectorAll('.btn-ver-detalhe').forEach((botao) => {
    botao.addEventListener('click', () => abrirDetalhe(botao.dataset.pedidoId));
  });
}

async function abrirDetalhe(pedidoId) {
  const resposta = await apiFetch(`/pedidos/${pedidoId}`);
  if (!resposta.ok) {
    alert('Não foi possível carregar este pedido.');
    return;
  }

  const pedido = await resposta.json();
  pedidoAtualId = pedido.id;

  document.getElementById('detalheNumero').textContent = `#${pedido.id}`;
  document.getElementById('detalheCliente').textContent = pedido.cliente_nome;
  document.getElementById('detalheContato').textContent = pedido.cliente_contato || '-';
  document.getElementById('detalheRetirada').textContent = rotuloRetirada(pedido.metodo_retirada);
  document.getElementById('detalheStatus').innerHTML = rotuloStatus(pedido.status);

  const itensDiv = document.getElementById('detalheItens');
  itensDiv.innerHTML = pedido.itens.map((item) => `
    <div class="d-flex justify-content-between mb-1">
      <span>${item.produto_nome} (${item.cor || '-'} / ${item.tamanho || '-'}) × ${item.quantidade}</span>
      <span>R$ ${(item.preco_unitario * item.quantidade).toFixed(2)}</span>
    </div>
  `).join('');

  const total = pedido.itens.reduce((soma, item) => soma + item.preco_unitario * item.quantidade, 0);
  document.getElementById('detalheTotal').textContent = total.toFixed(2);

  const botaoConfirmar = document.getElementById('btnConfirmarPedido');
  if (pedido.status === 'confirmado') {
    botaoConfirmar.classList.add('d-none');
  } else {
    botaoConfirmar.classList.remove('d-none');
  }

  if (!modalDetalhe) {
    modalDetalhe = new bootstrap.Modal(document.getElementById('modalDetalhe'));
  }
  modalDetalhe.show();
}

document.getElementById('btnConfirmarPedido').addEventListener('click', async () => {
  if (!pedidoAtualId) return;

  const confirmar = confirm('Confirmar este pedido? O estoque será baixado automaticamente.');
  if (!confirmar) return;

  const resposta = await apiFetch(`/pedidos/${pedidoAtualId}/confirmar`, { method: 'PUT' });
  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.erro || 'Não foi possível confirmar o pedido.');
    return;
  }

  modalDetalhe.hide();
  carregarPedidos();
});

carregarPedidos();