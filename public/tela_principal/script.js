// Em: public/tela_principal/script.js

// Estado inicial da aplicação
const state = {
    selectedCategories: new Set(),
    text: "",
    categoryInSearch: "all",
    sort: "relevance",
    onlyPrime: false, // Nota: seu backend não tem lógica para "prime", mantenha no state por enquanto.
    onlyDeals: false, // Nota: seu backend não tem lógica para "deal", mantenha no state por enquanto.
    onlyStock: true,
    cartCount: 0
};

// Mapeamento dos elementos do DOM
const els = {
    grid: document.getElementById("productGrid"),
    resultsCount: document.getElementById("resultsCount"),
    sortSelect: document.getElementById("sortSelect"),
    searchForm: document.getElementById("searchForm"),
    searchInput: document.getElementById("searchInput"),
    searchCategory: document.getElementById("searchCategory"),
    filterPrime: document.getElementById("filterPrime"),
    filterDeals: document.getElementById("filterDeals"),
    filterInStock: document.getElementById("filterInStock"),
    categoryList: document.getElementById("categoryList"),
    clearFilters: document.getElementById("clearFilters"),
    cartCount: document.getElementById("cartCount"),
    menuToggle: document.getElementById("menuToggle"),
    sidebar: document.getElementById("sidebar"),
    subnavLinks: document.querySelectorAll(".subnav-links a"),
    modal: document.getElementById("productModal"),
    modalImg: document.getElementById("modalImg"),
    modalTitle: document.getElementById("modalTitle"),
    modalDesc: document.getElementById("modalDesc"),
    modalNow: document.getElementById("modalNow"),
    modalOld: document.getElementById("modalOld"),
    modalBadges: document.getElementById("modalBadges"),
    modalRating: document.getElementById("modalRating"),
    modalStock: document.getElementById("modalStock"),
    modalAdd: document.getElementById("modalAdd")
};

function salvarCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Função para carregar o carrinho do localStorage
function carregarCarrinho() {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
}

// Função para atualizar o contador do carrinho no ícone
function atualizarContadorCarrinho() {
    const carrinho = carregarCarrinho();
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    els.cartCount.textContent = totalItens;
    state.cartCount = totalItens; // Atualiza o state também
}

async function verificarLogin() {
    const token = localStorage.getItem('authToken');
    const accountArea = document.querySelector('.account-area');

    if (!token || !accountArea) {
        // Se não há token, garante que o link de login padrão seja exibido
        accountArea.innerHTML = `
            <a href="/login.cadastro/login.html" class="account-link">
                <span class="small">Olá, faça login</span>
                <span class="big">Contas e Listas ▾</span>
            </a>
            <a href="/login.cadastro/login.html" class="account-link">
                <span class="small">Devoluções</span>
                <span class="big">e Pedidos</span>
            </a>
            <a href="#" class="cart" aria-label="Carrinho">
                🛒 <span id="cartCount" class="cart-count">0</span>
            </a>`;
        return; // Sai da função
    }

    try {
        const response = await fetch('/api/usuarios/meuperfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            // Se o token for inválido, limpa e sai
            localStorage.removeItem('authToken');
            return;
        }

        const usuario = await response.json();

        // Se o login for bem-sucedido, altera o HTML do cabeçalho
        accountArea.innerHTML = `
            <a href="/MeuUsuario.html" class="account-link">
                <span class="small">Olá, ${usuario.nome.split(' ')[0]}</span>
                <span class="big">Sua Conta ▾</span>
            </a>
            
            <a href="/Conta/meus-pedidos.html" class="account-link">
                <span class="small">Seus</span>
                <span class="big">Pedidos</span>
            </a>
            
            <a href="carrinho.html" class="cart" aria-label="Carrinho">
                🛒 <span id="cartCount" class="cart-count">${state.cartCount}</span>
            </a>`;
        els.cartCount = document.getElementById("cartCount"); 

    } catch (error) {
        console.error('Erro ao verificar login:', error);
        localStorage.removeItem('authToken'); // Limpa token quebrado
    }
}


// Ação de clique nos cards de produto
els.grid.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const card = e.target.closest(".card");
    const id = card?.dataset.id;
    const product = todosOsProdutos.find(p => p._id === id);
    if (!product) return;

    // --- INÍCIO DA MODIFICAÇÃO ---
    if (btn.dataset.action === "add") {
        const carrinho = carregarCarrinho();
        const itemExistente = carrinho.find(item => item.produtoId === product._id);

        if (itemExistente) {
            itemExistente.quantidade++; // Se já existe no carrinho, só aumenta a quantidade
        } else {
            carrinho.push({ // Se não existe, adiciona
                produtoId: product._id,
                nome: product.nome,
                preco: product.preco,
                imagemUrl: product.imagemUrl,
                quantidade: 1
            });
        }

        salvarCarrinho(carrinho);
        atualizarContadorCarrinho();

        // Feedback visual para o usuário
        btn.textContent = "Adicionado ✓";
        btn.disabled = true;
        setTimeout(() => { btn.textContent = "Adicionar ao carrinho"; btn.disabled = false; }, 1200);

    } else if (btn.dataset.action === "details") {
        openModal(product);
    }
    // --- FIM DA MODIFICAÇÃO ---
});

// Funções utilitárias
function stars(rating = 0) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
}
function formatBRL(value = 0) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Variável global para armazenar os produtos vindos do backend
let todosOsProdutos = [];

// Função para aplicar os filtros sobre a lista de produtos
function applyFilters(produtos) {
    let items = produtos.slice();

    const t = state.text.trim().toLowerCase();
    if (t) {
        items = items.filter(p => (p.nome + " " + p.descricao).toLowerCase().includes(t));
    }
    if (state.categoryInSearch !== "all") {
        items = items.filter(p => p.categoria === state.categoryInSearch);
    }

    if (state.selectedCategories.size) {
        items = items.filter(p => state.selectedCategories.has(p.categoria));
    }

    // Nota: A lógica de prime e deal é mantida aqui, mas seu backend precisa implementá-la para funcionar
    if (state.onlyPrime) items = items.filter(p => p.prime);
    if (state.onlyDeals) items = items.filter(p => p.deal);
    if (state.onlyStock) items = items.filter(p => p.estoque > 0);

    switch (state.sort) {
        case "price-asc": items.sort((a, b) => a.preco - b.preco); break;
        case "price-desc": items.sort((a, b) => b.preco - a.preco); break;
        case "rating-desc": items.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
        case "newest": items.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)); break;
        default: break;
    }
    return items;
}

// Função para renderizar os produtos na tela
function render(produtos) {
    const list = applyFilters(produtos);
    els.resultsCount.textContent = `${list.length} resultado${list.length !== 1 ? "s" : ""}`;
    els.grid.setAttribute("aria-busy", "true");
    els.grid.innerHTML = list.map(p => `
      <article class="card" data-id="${p._id}">
        <div class="card-media">
          <img src="${p.imagemUrl || 'https://via.placeholder.com/200'}" alt="${p.nome}" loading="lazy" />
        </div>
        <div class="card-body">
          <h3 class="card-title">${p.nome}</h3>
          <p class="card-desc">${p.descricao}</p>
          <div class="price">
            <span class="now">${formatBRL(p.preco)}</span>
          </div>
          <div class="badges">
            ${p.deal ? `<span class="badge">Oferta</span>` : ""}
            <span class="badge">${p.categoria || 'Sem Categoria'}</span>
          </div>
          <div class="rating" aria-label="Avaliação: ${p.rating || 0}">${stars(p.rating)} <span>(${(p.rating || 0).toFixed(1)})</span></div>
          <div class="stock">${p.estoque > 0 ? "Em estoque" : "Indisponível"}</div>
          <div class="card-actions">
            <button class="btn outline" data-action="details">Detalhes</button>
            <button class="btn primary" data-action="add">Adicionar ao carrinho</button>
          </div>
        </div>
      </article>
    `).join("");
    els.grid.setAttribute("aria-busy", "false");
}

// Função principal que busca os produtos no backend
async function carregarProdutosDoBackend() {
    els.grid.setAttribute("aria-busy", "true");
    try {
        const response = await fetch('/api/produtos');
        if (!response.ok) throw new Error('Erro ao buscar produtos do servidor.');
        todosOsProdutos = await response.json();
        render(todosOsProdutos);
    } catch (error) {
        console.error("Falha ao carregar produtos:", error);
        els.grid.innerHTML = `<p style="color: red; grid-column: 1 / -1;">${error.message}</p>`;
    } finally {
        els.grid.setAttribute("aria-busy", "false");
    }
}

// --- Event Listeners Corrigidos ---

els.sortSelect.addEventListener("change", e => {
    state.sort = e.target.value;
    render(todosOsProdutos);
});

els.searchInput.addEventListener("input", e => {
    state.text = e.target.value;
    render(todosOsProdutos);
});

els.searchCategory.addEventListener("change", e => {
    state.categoryInSearch = e.target.value;
    render(todosOsProdutos);
});

els.searchForm.addEventListener("submit", e => {
    e.preventDefault();
    render(todosOsProdutos);
});

els.filterPrime.addEventListener("change", e => { state.onlyPrime = e.target.checked; render(todosOsProdutos); });
els.filterDeals.addEventListener("change", e => { state.onlyDeals = e.target.checked; render(todosOsProdutos); });
els.filterInStock.addEventListener("change", e => { state.onlyStock = e.target.checked; render(todosOsProdutos); });

els.categoryList.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", e => {
        const v = e.target.value;
        if (e.target.checked) state.selectedCategories.add(v);
        else state.selectedCategories.delete(v);
        render(todosOsProdutos);
    });
});

els.clearFilters.addEventListener("click", () => {
    state.selectedCategories.clear();
    els.categoryList.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
    state.onlyPrime = els.filterPrime.checked = false;
    state.onlyDeals = els.filterDeals.checked = false;
    state.onlyStock = els.filterInStock.checked = true;
    state.text = els.searchInput.value = "";
    state.categoryInSearch = els.searchCategory.value = "all";
    state.sort = els.sortSelect.value = "relevance";
    render(todosOsProdutos);
});

// O restante do seu arquivo (subnavLinks, menuToggle, modal, etc.) continua abaixo...

els.subnavLinks.forEach(a => {
    a.addEventListener("click", (e) => {
        e.preventDefault();
        // A lógica aqui dentro continua a mesma, mas a chamada final deve ser:
        render(todosOsProdutos);
    });
});

els.menuToggle.addEventListener("click", () => {
    const willOpen = !els.sidebar.classList.contains("open");
    els.sidebar.classList.toggle("open", willOpen);
    els.menuToggle.setAttribute("aria-expanded", willOpen.toString());
});

let lastFocused = null;

function openModal(product) {
    lastFocused = document.activeElement;

    els.modalImg.src = product.imagemUrl || 'https://via.placeholder.com/300';
    els.modalImg.alt = product.nome;
    els.modalTitle.textContent = product.nome;
    els.modalDesc.textContent = product.descricao;
    els.modalNow.textContent = formatBRL(product.preco);

    els.modalBadges.innerHTML = `
      ${product.deal ? `<span class="badge">Oferta</span>` : ""}
      <span class="badge">${product.categoria || 'Sem Categoria'}</span>
    `;
    els.modalRating.innerHTML = `${stars(product.rating)} <span>(${(product.rating || 0).toFixed(1)})</span>`;
    els.modalStock.textContent = product.estoque > 0 ? "Em estoque" : "Indisponível";

    els.modal.classList.add("open");
    const closeBtn = els.modal.querySelector(".modal-close");
    closeBtn?.focus();

    els.modalAdd.onclick = () => {
        state.cartCount += 1;
        els.cartCount.textContent = state.cartCount;
        els.modalAdd.textContent = "Adicionado ✓";
        els.modalAdd.disabled = true;
        setTimeout(() => { els.modalAdd.textContent = "Adicionar ao carrinho"; els.modalAdd.disabled = false; }, 1200);
    };
}

function closeModal() {
    els.modal.classList.remove("open");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
}

els.modal.addEventListener("click", (e) => {
    if (e.target.dataset.close === "true") closeModal();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && els.modal.classList.contains("open")) closeModal();
});

els.grid.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const card = e.target.closest(".card");
    const id = card?.dataset.id; // O ID do MongoDB é uma string
    const product = todosOsProdutos.find(p => p._id === id); // Busca no array correto
    if (!product) return;

    if (btn.dataset.action === "add") {
        state.cartCount += 1;
        els.cartCount.textContent = state.cartCount;
        btn.textContent = "Adicionado ✓";
        btn.disabled = true;
        setTimeout(() => { btn.textContent = "Adicionar ao carrinho"; btn.disabled = false; }, 1200);
    } else if (btn.dataset.action === "details") {
        openModal(product);
    }
});

// Suporte (código existente)
const supportBtn = document.getElementById('supportToggle');
const supportBox = document.getElementById('supportBox');
const closeBtn = document.getElementById('closeSupport');
const sendBtn = document.getElementById('sendMessage');
const chatBody = document.getElementById('chatBody');
const userMessage = document.getElementById('userMessage');

supportBtn.addEventListener('click', () => {
  supportBox.style.display = supportBox.style.display === 'flex' ? 'none' : 'flex';
});

closeBtn.addEventListener('click', () => {
  supportBox.style.display = 'none';
});

sendBtn.addEventListener('click', () => {
  if (userMessage.value.trim() !== '') {
    let msg = document.createElement('p');
    msg.innerHTML = `<strong>Você:</strong> ${userMessage.value}`;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    userMessage.value = '';
  }
});

document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    carregarProdutosDoBackend();
    atualizarContadorCarrinho();
});