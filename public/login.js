document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const mensagemErro = document.getElementById('mensagemErro');

  mensagemErro.classList.add('d-none');

  try {
    const resposta = await fetch('/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemErro.textContent = dados.erro || 'Erro ao fazer login';
      mensagemErro.classList.remove('d-none');
      return;
    }

    localStorage.setItem('token', dados.token);
    window.location.href = '/produtos.html';
  } catch (err) {
    mensagemErro.textContent = 'Erro de conexão com o servidor';
    mensagemErro.classList.remove('d-none');
  }
});