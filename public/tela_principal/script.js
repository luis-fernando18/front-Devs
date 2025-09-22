const PRODUCTS = [
    {
        id: 1, title: "Fone Bluetooth ANC X200", desc: "Cancelamento de ruído, 30h de bateria, USB-C.",
        price: 299.9, oldPrice: 399.9, rating: 4.6, stock: true, prime: true, deal: true,
        category: "Electronics",
        img: "https://images.unsplash.com/photo-1518446452496-9c67a1d57cc5?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 2, title: "Notebook 15.6” i5 16GB 512GB SSD", desc: "Leve, rápido e ideal para estudos e trabalho.",
        price: 3499.0, oldPrice: 3999.0, rating: 4.4, stock: true, prime: true, deal: false,
        category: "Computers",
        img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 3, title: "Cafeteira Automática 20 bar", desc: "Espresso cremoso com reservatório de 1L.",
        price: 529.9, oldPrice: 649.9, rating: 4.2, stock: true, prime: false, deal: true,
        category: "Home & Kitchen",
        img: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 4, title: "Camisa DryFit Unissex", desc: "Tecido respirável para treino e dia a dia.",
        price: 59.9, oldPrice: 79.9, rating: 4.1, stock: true, prime: true, deal: false,
        category: "Fashion",
        img: "https://images.unsplash.com/photo-1520975776934-304e9b48cdcc?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 5, title: "Coleira Ajustável para Pets", desc: "Confortável e resistente, várias cores.",
        price: 34.9, oldPrice: 49.9, rating: 4.7, stock: true, prime: true, deal: true,
        category: "Pet Supplies",
        img: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 6, title: "Kit Halteres Ajustáveis 20kg", desc: "Treino completo sem sair de casa.",
        price: 499.0, oldPrice: 649.0, rating: 4.5, stock: true, prime: false, deal: false,
        category: "Sports & Outdoors",
        img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 7, title: "Jogo de Panelas Antiaderentes 5pçs", desc: "Distribuição de calor uniforme e fácil limpeza.",
        price: 399.9, oldPrice: 549.9, rating: 4.3, stock: true, prime: true, deal: true,
        category: "Home & Kitchen",
        img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 8, title: "Livro: Clean Code (Português)", desc: "Práticas de código limpo para devs.",
        price: 129.9, oldPrice: 169.9, rating: 4.8, stock: true, prime: true, deal: false,
        category: "Books",
        img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 9, title: "Console Gamer 1TB + 2 Controles", desc: "Gráficos de última geração, modo online.",
        price: 3999.0, oldPrice: 4499.0, rating: 4.7, stock: true, prime: true, deal: false,
        category: "Video Games",
        img: "https://images.unsplash.com/photo-1606813907291-76a572545c4d?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 10, title: "Serra Tico-Tico 600W", desc: "Cortes precisos em madeira e metal.",
        price: 279.9, oldPrice: 329.9, rating: 4.0, stock: false, prime: false, deal: true,
        category: "Industrial & Scientific",
        img: "https://images.unsplash.com/photo-1616628188462-71f4f51e94b1?q=80&w=800&auto=format&fit=crop"
    },
];

const state = {
    selectedCategories: new Set(),
    text: "",
    categoryInSearch: "all",
    sort: "relevance",
    onlyPrime: false,
    onlyDeals: false,
    onlyStock: true,
    cartCount: 0
};

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

function stars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
}
function formatBRL(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function applyFilters() {
    let items = PRODUCTS.slice();


    const t = state.text.trim().toLowerCase();
    if (t) {
        items = items.filter(p => (p.title + " " + p.desc).toLowerCase().includes(t));
    }
    if (state.categoryInSearch !== "all") {
        items = items.filter(p => p.category === state.categoryInSearch);
    }


    if (state.selectedCategories.size) {
        items = items.filter(p => state.selectedCategories.has(p.category));
    }

    if (state.onlyPrime) items = items.filter(p => p.prime);
    if (state.onlyDeals) items = items.filter(p => p.deal);
    if (state.onlyStock) items = items.filter(p => p.stock);


    switch (state.sort) {
        case "price-asc": items.sort((a, b) => a.price - b.price); break;
        case "price-desc": items.sort((a, b) => b.price - a.price); break;
        case "rating-desc": items.sort((a, b) => b.rating - a.rating); break;
        case "newest": items.sort((a, b) => b.id - a.id); break;
        default: break;
    }
    return items;
}

function render() {
    const list = applyFilters();
    els.resultsCount.textContent = `${list.length} resultado${list.length !== 1 ? "s" : ""}`;
    els.grid.setAttribute("aria-busy", "true");
    els.grid.innerHTML = list.map(p => `
      <article class="card" data-id="${p.id}">
        <div class="card-media">
          <img src="${p.img}" alt="${p.title}" loading="lazy" />
        </div>
        <div class="card-body">
          <h3 class="card-title">${p.title}</h3>
          <p class="card-desc">${p.desc}</p>
          <div class="price">
            <span class="now">${formatBRL(p.price)}</span>
            ${p.oldPrice ? `<span class="old">${formatBRL(p.oldPrice)}</span>` : ""}
          </div>
          <div class="badges">
            ${p.prime ? `<span class="badge">Entrega Rápida</span>` : ""}
            ${p.deal ? `<span class="badge">Oferta</span>` : ""}
            <span class="badge">${p.category}</span>
          </div>
          <div class="rating" aria-label="Avaliação: ${p.rating}">${stars(p.rating)} <span>(${p.rating.toFixed(1)})</span></div>
          <div class="stock">${p.stock ? "Em estoque" : "Indisponível"}</div>
          <div class="card-actions">
            <button class="btn outline" data-action="details">Detalhes</button>
            <button class="btn primary" data-action="add">Adicionar ao carrinho</button>
          </div>
        </div>
      </article>
    `).join("");
    els.grid.setAttribute("aria-busy", "false");
}


els.sortSelect.addEventListener("change", e => { state.sort = e.target.value; render(); });

els.searchInput.addEventListener("input", e => { state.text = e.target.value; render(); });

els.searchCategory.addEventListener("change", e => { state.categoryInSearch = e.target.value; render(); });


els.searchForm.addEventListener("submit", e => {
    e.preventDefault();
    state.text = els.searchInput.value;
    state.categoryInSearch = els.searchCategory.value;
    render();
});

els.filterPrime.addEventListener("change", e => { state.onlyPrime = e.target.checked; render(); });
els.filterDeals.addEventListener("change", e => { state.onlyDeals = e.target.checked; render(); });
els.filterInStock.addEventListener("change", e => { state.onlyStock = e.target.checked; render(); });

els.categoryList.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", e => {
        const v = e.target.value;
        if (e.target.checked) state.selectedCategories.add(v);
        else state.selectedCategories.delete(v);
        render();
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
    render();
});

els.subnavLinks.forEach(a => {
    a.addEventListener("click", (e) => {
        e.preventDefault();
        const tag = a.dataset.tag;

        state.selectedCategories.clear();
        els.categoryList.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
        state.text = els.searchInput.value = "";
        state.categoryInSearch = els.searchCategory.value = "all";
        state.onlyPrime = els.filterPrime.checked = false;
        state.onlyDeals = els.filterDeals.checked = false;
        state.onlyStock = els.filterInStock.checked = true;
        state.sort = els.sortSelect.value = "relevance";

        switch (tag) {
            case "ofertas":
                state.onlyDeals = els.filterDeals.checked = true;
                break;
            case "prime":
                state.onlyPrime = els.filterPrime.checked = true;
                break;
            case "lancamentos":
                state.sort = "newest";
                break;
            case "mais-vendidos":
                state.sort = els.sortSelect.value = "rating-desc";
                break;
            case "atendimento":
                document.querySelector(".footer")?.scrollIntoView({ behavior: "smooth" });
                break;
        }
        render();
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

    els.modalImg.src = product.img;
    els.modalImg.alt = product.title;
    els.modalTitle.textContent = product.title;
    els.modalDesc.textContent = product.desc;
    els.modalNow.textContent = formatBRL(product.price);
    els.modalOld.textContent = product.oldPrice ? formatBRL(product.oldPrice) : "";
    els.modalOld.style.display = product.oldPrice ? "inline" : "none";

    els.modalBadges.innerHTML = `
      ${product.prime ? `<span class="badge">Entrega Rápida</span>` : ""}
      ${product.deal ? `<span class="badge">Oferta</span>` : ""}
      <span class="badge">${product.category}</span>
    `;
    els.modalRating.innerHTML = `${stars(product.rating)} <span>(${product.rating.toFixed(1)})</span>`;
    els.modalStock.textContent = product.stock ? "Em estoque" : "Indisponível";

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
    const id = Number(card?.dataset.id);
    const product = PRODUCTS.find(p => p.id === id);
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


render();

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

