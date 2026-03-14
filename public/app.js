// Estado Global
let cart = JSON.parse(localStorage.getItem('nexora-cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('nexora-wishlist')) || [];
let products = [];
let filteredProducts = [];

// Elementos do DOM
const productsGrid = document.getElementById('productsGrid');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const wishlistToggleBtn = document.getElementById('wishlistToggleBtn');
const mobileCartBtn = document.getElementById('mobileCartBtn');
const mobileWishlistBtn = document.getElementById('mobileWishlistBtn');
const cartSidebar = document.getElementById('cartSidebar');
const wishlistSidebar = document.getElementById('wishlistSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');
const closeWishlistBtn = document.getElementById('closeWishlistBtn');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cartItems');
const wishlistItemsContainer = document.getElementById('wishlistItems');
const cartBadge = document.getElementById('cartBadge');
const wishlistBadge = document.getElementById('wishlistBadge');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const toastContainer = document.getElementById('toastContainer');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// Registro do Service Worker (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('SW Registered!', reg))
            .catch(err => console.log('SW Failed!', err));
    });
}

// Formatação de Preço
const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
};

// Salvar no LocalStorage
const saveState = () => {
    localStorage.setItem('nexora-cart', JSON.stringify(cart));
    localStorage.setItem('nexora-wishlist', JSON.stringify(wishlist));
};

// Fetch Produtos
const fetchProducts = async () => {
    try {
        const response = await fetch('/api/produtos');
        if (!response.ok) throw new Error('Falha ao carregar produtos');
        products = await response.json();
        filteredProducts = [...products];
        renderProducts(filteredProducts);
        updateUI();
    } catch (error) {
        console.error(error);
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: #ef4444; padding: 40px;">
                <p>Erro ao conectar ao servidor.</p>
            </div>
        `;
    }
};

// Renderizar Produtos
const renderProducts = (list) => {
    productsGrid.innerHTML = '';
    if (list.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Nenhum produto encontrado.</p>';
        return;
    }
    
    list.forEach(p => {
        const isWish = wishlist.some(i => i.id === p.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.name}" class="product-image">
            </div>
            <span class="product-category">${p.category}</span>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-description">${p.description}</p>
            <div class="product-footer">
                <span class="product-price">${formatPrice(p.price)}</span>
                <button class="btn-icon ${isWish ? 'active' : ''}" onclick="toggleWishlist(${p.id})">
                    <i class="ph ph-heart"></i>
                </button>
                <button class="add-to-cart-btn" onclick="addToCart(${p.id})">
                    <i class="ph ph-plus"></i>
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
};

// Busca & Filtros Dinâmicos
const handleFilters = () => {
    const term = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    // Filtro de Busca
    let result = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );

    // Ordenação
    if (sortBy === 'low') {
        result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high') {
        result.sort((a, b) => b.price - a.price);
    } else {
        // 'featured' - ordem original da API
        result.sort((a, b) => a.id - b.id);
    }

    filteredProducts = result;
    renderProducts(filteredProducts);
};

searchInput.addEventListener('input', handleFilters);
sortSelect.addEventListener('change', handleFilters);

// Lógica de Carrinho
const addToCart = (id) => {
    const item = products.find(p => p.id === id);
    const inCart = cart.find(i => i.id === id);
    if (inCart) inCart.quantity++;
    else cart.push({ ...item, quantity: 1 });
    updateUI();
    showToast(`Adicionado ao carrinho: ${item.name}`);
};

const changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        updateUI();
    }
};

// Lógica de Favoritos
const toggleWishlist = (id) => {
    const item = products.find(p => p.id === id);
    const index = wishlist.findIndex(i => i.id === id);
    if (index !== -1) {
        wishlist.splice(index, 1);
        showToast('Removido dos favoritos', 'error');
    } else {
        wishlist.push(item);
        showToast('Adicionado aos favoritos');
    }
    updateUI();
    renderProducts(filteredProducts); // Re-render to update heart icon
};

// Atualizar Interface
const updateUI = () => {
    saveState();
    
    // Badge Cart
    const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
    cartBadge.textContent = cartCount;
    
    // Badge Wishlist
    wishlistBadge.textContent = wishlist.length;
    
    // Preço Total
    const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
    cartTotalPrice.textContent = formatPrice(total);
    checkoutBtn.disabled = cart.length === 0;

    // Render Carrinho
    renderSidebarItems(cart, cartItemsContainer, true);
    // Render Wishlist
    renderSidebarItems(wishlist, wishlistItemsContainer, false);
};

const renderSidebarItems = (list, container, isCart) => {
    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-message">
                <i class="ph ${isCart ? 'ph-shopping-bag' : 'ph-heart'}"></i>
                <p>Lista vazia</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">${formatPrice(item.price)}</span>
                <div class="cart-item-actions">
                    ${isCart ? `
                        <div class="qty-control">
                            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                        </div>
                    ` : `
                        <button class="btn btn-secondary" style="padding: 4px 12px; font-size: 0.8rem;" onclick="addToCart(${item.id})">Adicionar</button>
                    `}
                    <button class="remove-item-btn" onclick="${isCart ? `changeQty(${item.id}, -Infinity)` : `toggleWishlist(${item.id})`}">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
};

// Toasts
const showToast = (msg, type = 'success') => {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="ph ${type === 'success' ? 'ph-check-circle' : 'ph-x-circle'}"></i> <span>${msg}</span>`;
    toastContainer.appendChild(t);
    setTimeout(() => {
        t.classList.add('hide');
        setTimeout(() => t.remove(), 300);
    }, 3000);
};

// Checkout
checkoutBtn.addEventListener('click', async () => {
    checkoutBtn.disabled = true;
    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Pedido finalizado com sucesso!');
            cart = [];
            updateUI();
            closeAllSidebars();
        }
    } catch (e) {
        showToast('Erro no checkout', 'error');
    } finally {
        checkoutBtn.disabled = false;
    }
});

// Navegação Sidebars
const openSidebar = (sb) => {
    closeAllSidebars();
    sb.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
};

const closeAllSidebars = () => {
    [cartSidebar, wishlistSidebar].forEach(s => s.classList.remove('open'));
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
};

// Listeners
cartToggleBtn.onclick = () => openSidebar(cartSidebar);
mobileCartBtn.onclick = () => openSidebar(cartSidebar);
wishlistToggleBtn.onclick = () => openSidebar(wishlistSidebar);
mobileWishlistBtn.onclick = () => openSidebar(wishlistSidebar);
closeCartBtn.onclick = closeAllSidebars;
closeWishlistBtn.onclick = closeAllSidebars;
overlay.onclick = closeAllSidebars;

// Início
fetchProducts();
