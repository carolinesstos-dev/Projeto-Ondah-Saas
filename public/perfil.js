const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

renderSidebar('perfil');

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

async function carregarPerfil() {
  const resposta = await apiFetch('/usuarios/me');
  if (!resposta.ok) {
    console.error('Erro ao carregar perfil:', resposta.status);
    return;
  }
  const usuario = await resposta.json();

  document.getElementById('nome').value = usuario.nome || '';
  document.getElementById('email').value = usuario.email || '';
  document.getElementById('nomeLoja').value = usuario.nome_loja || '';
  document.getElementById('contato').value = usuario.contato || '';

  const linkLoja = `${window.location.origin}/loja.html?loja=${usuario.id}`;
  document.getElementById('linkLoja').value = linkLoja;
}

document.getElementById('formPerfil').addEventListener('submit', async (e) => {
  e.preventDefault();
  const mensagem = document.getElementById('mensagemPerfil');
  mensagem.textContent = '';

  const nome = document.getElementById('nome').value;
  const nomeLoja = document.getElementById('nomeLoja').value;
  const contato = document.getElementById('contato').value;

  const resposta = await apiFetch('/usuarios/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, nome_loja: nomeLoja, contato }),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    alert(erro.erro || 'Não foi possível salvar.');
    return;
  }

  mensagem.textContent = 'Salvo com sucesso!';
  setTimeout(() => { mensagem.textContent = ''; }, 3000);
});

document.getElementById('formSenha').addEventListener('submit', async (e) => {
  e.preventDefault();
  const mensagem = document.getElementById('mensagemSenha');
  mensagem.textContent = '';

  const senhaAtual = document.getElementById('senhaAtual').value;
  const novaSenha = document.getElementById('novaSenha').value;

  const resposta = await apiFetch('/usuarios/me/senha', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senhaAtual, novaSenha }),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    alert(erro.erro || 'Não foi possível alterar a senha.');
    return;
  }

  mensagem.textContent = 'Senha alterada!';
  document.getElementById('formSenha').reset();
  setTimeout(() => { mensagem.textContent = ''; }, 3000);
});

document.getElementById('btnCopiarLink').addEventListener('click', () => {
  const input = document.getElementById('linkLoja');
  input.select();
  navigator.clipboard.writeText(input.value);
  const botao = document.getElementById('btnCopiarLink');
  const textoOriginal = botao.textContent;
  botao.textContent = 'Copiado!';
  setTimeout(() => { botao.textContent = textoOriginal; }, 2000);
});

carregarPerfil();