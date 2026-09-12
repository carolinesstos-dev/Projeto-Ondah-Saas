function renderSidebar(paginaAtiva) {
  const links = [
    { id: "produtos", label: "Produtos", href: "/produtos.html" },
    { id: "catalogo", label: "Catálogo", href: "/catalogo.html" },
    { id: "pedidos", label: "Pedidos", href: "/pedidos.html" },
    { id: "perfil", label: "Perfil e Configurações", href: "/perfil.html" },
  ];

  const itensHtml = links
    .map(
      (link) => `
    <a href="${link.href}"
       class="list-group-item list-group-item-action ${link.id === paginaAtiva ? "active" : ""}">
      ${link.label}
    </a>
  `,
    )
    .join("");

  const sidebarHtml = `
    <div class="d-flex flex-column p-3" style="width: 240px; min-height: 100vh;">
      <img src="/logo.svg" alt="Ondah" style="width: 100%; max-width: 180px;" class="mb-4">
      <div class="list-group mb-4">
        ${itensHtml}
      </div>
      <button id="btnSair" class="btn btn-outline-secondary btn-sm mt-auto mb-3">Sair</button>

      <div class="small text-muted border-top pt-3">
        <p class="mb-1">Suporte: suporte@ondah.com.br</p>
        <p class="mb-1">Comercial: comercial@ondah.com.br</p>
        <p class="mb-0">(11) 4000-0000</p>
      </div>
    </div>
  `;

  document.getElementById("sidebar").innerHTML = sidebarHtml;

  document.getElementById("btnSair").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}