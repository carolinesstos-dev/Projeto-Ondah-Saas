const params = new URLSearchParams(window.location.search);
const usuarioId = params.get('loja');

let carrinho = [];

function formatarPreco(valor) {
  return Number(valor).toFixed(2);
}

async function carregarLoja() {
  const filtros = new URLSearchParams();
  ['modelo', 'codigo'].forEach((chave) => {
    const valor = params.get(chave);
    if (valor) filtros.append(chave, valor);
  });
  const query = filtros.toString() ? `?${filtros.toString()}` : '';

  const resposta = await fetch(`/loja/${usuarioId}/produtos${query}`);
  const produtos = await resposta.json();
  const lista = document.getElementById('listaLoja');
  lista.innerHTML = '';

  if (produtos.length === 0) {
    lista.innerHTML = '<p class="text-muted">Nenhum produto disponível no momento.</p>';
    return;
  }

  produtos.forEach((produto) => {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const foto = produto.fotos[0] || 'https://via.placeholder.com/300x300?text=Sem+foto';

    const opcoesVariacao = produto.variacoes.map((v) => `
      <option value="${v.id}" data-preco="${v.preco}" data-estoque="${v.quantidade_estoque}">
        ${v.cor || '-'} / ${v.tamanho || '-'} — R$ ${formatarPreco(v.preco)}
      </option>
    `).join('');

    col.innerHTML = `
      <div class="card h-100">
        <img src="${foto}" class="card-img-top" style="height: 220px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <h6>${produto.nome}</h6>
          ${produto.descricao ? `<p class="text-muted small">${produto.descricao}</p>` : ''}

          <select class="form-select form-select-sm mb-2 select-variacao">
            ${opcoesVariacao}
          </select>

          <button class="btn btn-primary btn-sm w-100 mt-auto btn-add-carrinho">
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    `;

    const select = col.querySelector('.select-variacao');
    const botao = col.querySelector('.btn-add-carrinho');

    botao.addEventListener('click', () => {
      const opcaoSelecionada = select.options[select.selectedIndex];
      const variacaoId = opcaoSelecionada.value;
      const preco = parseFloat(opcaoSelecionada.dataset.preco);
      const estoque = parseInt(opcaoSelecionada.dataset.estoque, 10);
      const detalhe = opcaoSelecionada.textContent.split('—')[0].trim();

      if (estoque <= 0) {
        alert('Essa opção está sem estoque.');
        return;
      }

      carrinho.push({
        variacaoId,
        nome: produto.nome,
        detalhe,
        preco,
      });
      atualizarCarrinho();

      botao.textContent = 'Adicionado ✓';
      setTimeout(() => { botao.textContent = 'Adicionar ao carrinho'; }, 1200);
    });

    lista.appendChild(col);
  });
}

function atualizarCarrinho() {
  document.getElementById('contadorCarrinho').textContent = carrinho.length;

  const itensDiv = document.getElementById('itensCarrinho');
  if (carrinho.length === 0) {
    itensDiv.innerHTML = '<p class="text-muted">Seu carrinho está vazio.</p>';
  } else {
    itensDiv.innerHTML = carrinho.map((item, index) => `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span>${item.nome} (${item.detalhe})</span>
        <span>R$ ${formatarPreco(item.preco)}
          <button class="btn btn-sm btn-link text-danger btn-remover-item" data-index="${index}">×</button>
        </span>
      </div>
    `).join('');
  }

  const total = carrinho.reduce((soma, item) => soma + item.preco, 0);
  document.getElementById('totalCarrinho').textContent = formatarPreco(total);

  document.querySelectorAll('.btn-remover-item').forEach((botao) => {
    botao.addEventListener('click', () => {
      carrinho.splice(parseInt(botao.dataset.index, 10), 1);
      atualizarCarrinho();
    });
  });
}

document.getElementById('btnFinalizar').addEventListener('click', async () => {
  const clienteNome = document.getElementById('clienteNome').value;
  const metodoRetirada = document.querySelector('input[name="retirada"]:checked').value;

  if (!clienteNome || carrinho.length === 0) {
    alert('Preencha seu nome e adicione itens ao carrinho.');
    return;
  }

  const clienteContato = document.getElementById('clienteContato').value;

  const itens = carrinho.map((item) => ({
    variacaoId: item.variacaoId,
    quantidade: 1,
    precoUnitario: item.preco,
  }));

  const resposta = await fetch(`/loja/${usuarioId}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente_nome: clienteNome,
      cliente_contato: clienteContato,
      metodo_retirada: metodoRetirada,
      itens,
    }),
  });

  const pedido = await resposta.json();

  if (!resposta.ok) {
    alert(pedido.erro || 'Não foi possível enviar o pedido.');
    return;
  }

  document.getElementById('formCheckout').classList.add('d-none');
  const confirmacao = document.getElementById('confirmacaoPedido');
  confirmacao.textContent = `Pedido #${pedido.id} feito com sucesso! Aguarde a confirmação da vendedora.`;
  confirmacao.classList.remove('d-none');

  carrinho = [];
  atualizarCarrinho();
});

carregarLoja();