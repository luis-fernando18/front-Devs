document.addEventListener('DOMContentLoaded', () => {
    // 1. Mapeamento de todos os elementos do DOM
    const els = {
        grid: document.getElementById("productGrid"),
        resultsCount: document.getElementById("resultsCount"),
        sortSelect: document.getElementById("sortSelect"),
        searchForm: document.getElementById("searchForm"),
        searchInput: document.getElementById("searchInput"),
        categoryList: document.getElementById("categoryList"),
        clearFilters: document.getElementById("clearFilters"),
        cartCount: document.getElementById("cartCount"),
        accountArea: document.querySelector('.account-area'),
        // Elementos do Modal (Adicionados)
        modal: document.getElementById("productModal"),
        modalImg: document.getElementById("modalImg"),
        modalTitle: document.getElementById("modalTitle"),
        modalDesc: document.getElementById("modalDesc"),
        modalNow: document.getElementById("modalNow"),
        modalOld: document.getElementById("modalOld"),
        modalBadges: document.getElementById("modalBadges"),
        modalStock: document.getElementById("modalStock"),
        modalFavorite: document.getElementById("modalFavorite")
    };

    // 2. Estado da aplicação
    const state = {
        todosOsProdutos: [],
        selectedCategories: new Set(),
        text: "",
        sort: "relevance",
        onlyStock: true,
        favoritos: new Set(),
        cart: JSON.parse(localStorage.getItem('carrinho')) || []
    };

    // 3. Funções Utilitárias
    const formatBRL = (value = 0) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const salvarCarrinho = (carrinho) => localStorage.setItem('carrinho', JSON.stringify(carrinho));

    // 4. Funções Principais
    function atualizarContadorCarrinho() {
        const totalItens = state.cart.reduce((total, item) => total + item.quantidade, 0);
        // Acessa o elemento pelo ID toda vez, pois ele pode ser recriado pela função de login
        const cartCountEl = document.getElementById("cartCount");
        if (cartCountEl) {
            cartCountEl.textContent = totalItens;
        }
    }

    function render(produtos) {
        const list = applyFilters(produtos);
        els.resultsCount.textContent = `${list.length} resultado${list.length !== 1 ? "s" : ""}`;
        els.grid.innerHTML = list.map(p => `
            <article class="card" data-id="${p._id}">
                <div class="card-media"><img src="${p.imagemUrl || 'https://via.placeholder.com/200'}" alt="${p.nome}" loading="lazy" /></div>
                <div class="card-body">
                    <h3 class="card-title">${p.nome}</h3>
                    <p class="card-desc">${p.descricao}</p>
                    <div class="price"><span class="now">${formatBRL(p.preco)}</span></div>
                    <div class="badges"><span class="badge">${p.categoria || 'Sem Categoria'}</span></div>
                    <div class="stock">${p.estoque > 0 ? "Em estoque" : "Indisponível"}</div>
                    <div class="card-actions">
                        <button class="btn outline" data-action="details">Detalhes</button>
                        <button class="btn primary" data-action="add">Adicionar ao carrinho</button>
                    </div>
                </div>
            </article>
        `).join("");
    }
    
    let lastFocused = null;
    function openModal(product) {
        lastFocused = document.activeElement;
        els.modalImg.src = product.imagemUrl || 'https://via.placeholder.com/300';
        els.modalImg.alt = product.nome;
        els.modalTitle.textContent = product.nome;
        els.modalDesc.textContent = product.descricao;
        els.modalNow.textContent = formatBRL(product.preco);
        els.modalOld.textContent = '';
        els.modalBadges.innerHTML = `<span class="badge">${product.categoria || 'Sem Categoria'}</span>`;
        els.modalStock.textContent = product.estoque > 0 ? "Em estoque" : "Indisponível";
        els.modal.classList.add("open");
        els.modal.querySelector(".modal-close")?.focus();

        // Verifica se o produto atual é um favorito e atualiza o estilo do botão
    if (state.favoritos.has(product._id)) {
        els.modalFavorite.classList.add('is-favorite');
    } else {
        els.modalFavorite.classList.remove('is-favorite');
    }

    // Atribui a função de clique ao botão de favorito
    els.modalFavorite.onclick = () => toggleFavorito(product._id);
    }

    function closeModal() {
        els.modal.classList.remove("open");
        if (lastFocused) lastFocused.focus();
    }

    function applyFilters(produtos) {
        let items = [...produtos];
        const t = state.text.trim().toLowerCase();
        if (t) {
            items = items.filter(p => (p.nome + " " + p.descricao).toLowerCase().includes(t));
        }
        if (state.selectedCategories.size > 0) {
            items = items.filter(p => state.selectedCategories.has(p.categoria));
        }
        if (state.onlyStock) {
            items = items.filter(p => p.estoque > 0);
        }
        switch (state.sort) {
            case "price-asc": items.sort((a, b) => a.preco - b.preco); break;
            case "price-desc": items.sort((a, b) => b.preco - a.preco); break;
        }
        return items;
    }

    async function carregarProdutosDoBackend() {
        try {
            const response = await fetch('/api/produtos');
            if (!response.ok) throw new Error('Erro ao buscar produtos.');
            state.todosOsProdutos = await response.json();
            render(state.todosOsProdutos);
        } catch (error) {
            console.error("Falha ao carregar produtos:", error);
            els.grid.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    async function verificarLogin() {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const response = await fetch('/api/usuarios/meuperfil', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) {
                localStorage.removeItem('authToken'); return;
            }
            const usuario = await response.json();
            els.accountArea.innerHTML = `
                <a href="/MeuUsuario.html" class="account-link"><span class="small">Olá, ${usuario.nome.split(' ')[0]}</span><span class="big">Sua Conta ▾</span></a>
                <a href="/Conta/meus-pedidos.html" class="account-link"><span class="small">Seus</span><span class="big">Pedidos</span></a>
                <a href="/tela_principal/carrinho.html" class="cart" aria-label="Carrinho">🛒 <span id="cartCount" class="cart-count">0</span></a>`;

            // Após logar, busca os favoritos do usuário
        const responseFavoritos = await fetch('/api/usuarios/favoritos', { headers: { 'Authorization': `Bearer ${token}` } });
        if (responseFavoritos.ok) {
            const favoritos = await responseFavoritos.json();
            // Limpa o set e adiciona os IDs dos produtos favoritos
            state.favoritos.clear();
            favoritos.forEach(produto => state.favoritos.add(produto._id));
        }

         atualizarContadorCarrinho();

        } catch (error) {
            console.error('Erro ao verificar login:', error);
            localStorage.removeItem('authToken');
        }
    }

    // 5. Lógica de Eventos

    // Pesquisa "ao vivo" enquanto o usuário digita
    els.searchInput.addEventListener("input", e => {
        state.text = e.target.value;
        render(state.todosOsProdutos);
    });

    els.searchForm.addEventListener("submit", e => {
        e.preventDefault(); // Apenas impede o recarregamento da página
        render(state.todosOsProdutos);
    });

    els.sortSelect.addEventListener("change", e => {
        state.sort = e.target.value;
        render(state.todosOsProdutos);
    });

    els.categoryList.querySelectorAll("input[type=checkbox]").forEach(cb => {
        cb.addEventListener("change", e => {
            if (e.target.checked) state.selectedCategories.add(e.target.value);
            else state.selectedCategories.delete(e.target.value);
            render(state.todosOsProdutos);
        });
    });

    els.grid.addEventListener("click", e => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const card = e.target.closest(".card");
        const id = card?.dataset.id;
        const product = state.todosOsProdutos.find(p => p._id === id);
        if (!product) return;
        if (btn.dataset.action === "add") {
            const itemExistente = state.cart.find(item => item.produtoId === product._id);
            if (itemExistente) itemExistente.quantidade++;
            else state.cart.push({ produtoId: product._id, nome: product.nome, preco: product.preco, imagemUrl: product.imagemUrl, quantidade: 1 });
            salvarCarrinho(state.cart);
            atualizarContadorCarrinho();
            btn.textContent = "Adicionado ✓";
            btn.disabled = true;
            setTimeout(() => { btn.textContent = "Adicionar ao carrinho"; btn.disabled = false; }, 1200);
        } else if (btn.dataset.action === "details") {
            openModal(product);
        }
    });
    
    els.modal.addEventListener("click", e => {
        if (e.target.dataset.close === "true") closeModal();
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && els.modal.classList.contains("open")) closeModal();
    });

    async function toggleFavorito(produtoId) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Você precisa estar logado para adicionar favoritos.');
        return;
    }

    const ehFavorito = state.favoritos.has(produtoId);
    const method = ehFavorito ? 'DELETE' : 'POST';

    try {
        const response = await fetch(`/api/usuarios/favoritos/${produtoId}`, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Falha ao atualizar favoritos.');

        // Atualiza o estado local
        if (ehFavorito) {
            state.favoritos.delete(produtoId);
            els.modalFavorite.classList.remove('is-favorite');
            alert('Produto removido dos favoritos!');
        } else {
            state.favoritos.add(produtoId);
            els.modalFavorite.classList.add('is-favorite');
            alert('Produto adicionado aos favoritos!');
        }

    } catch (error) {
        alert(error.message);
    }
}

    // 6. Inicialização
    verificarLogin();
    carregarProdutosDoBackend();
    atualizarContadorCarrinho();
});