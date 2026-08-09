document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;

  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const subcategoryFilter = document.getElementById('subcategory-filter');
  const sortFilter = document.getElementById('sort-filter');

  // New UI elements
  const catPills = document.querySelectorAll('.cat-pill');
  const filterToggle = document.getElementById('filter-toggle-btn');
  const filterDrawer = document.getElementById('filter-drawer');
  const filterOverlay = document.getElementById('filter-overlay');
  const filterClose = document.getElementById('filter-drawer-close');
  const filterApply = document.getElementById('filter-apply');
  const filterClear = document.getElementById('filter-clear');
  const subcategoryChips = document.getElementById('subcategory-chips');
  const sortChips = document.querySelectorAll('#sort-chips .filter-chip');
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');

  // State
  let activeCategory = 'all';
  let activeSubcategories = [];
  let activeSortBy = 'default';
  let allProducts = [...products]; // merged static + dynamic

  // Fisher-Yates shuffle
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let currentProducts = shuffle(allProducts.filter(p => p.type === 'product'));

  // -- Filter Drawer Toggle --
  function openDrawer() {
    if (filterDrawer) filterDrawer.classList.add('active');
    if (filterOverlay) filterOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (filterDrawer) filterDrawer.classList.remove('active');
    if (filterOverlay) filterOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (filterToggle) filterToggle.addEventListener('click', openDrawer);
  if (filterClose) filterClose.addEventListener('click', closeDrawer);
  if (filterOverlay) filterOverlay.addEventListener('click', closeDrawer);

  // -- Category Pills --
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      if (categoryFilter) categoryFilter.value = activeCategory;
      activeSubcategories = [];
      updateSubcategoryChips();
      applyFilters();
    });
  });

  // -- Subcategory Chips --
  function updateSubcategoryChips() {
    if (!subcategoryChips) return;
    let relevantProducts = allProducts.filter(p => p.type === 'product');
    if (activeCategory !== 'all') {
      relevantProducts = relevantProducts.filter(p => p.category === activeCategory);
    }
    const subs = [...new Set(relevantProducts.map(p => p.subcategory).filter(Boolean))].sort();

    subcategoryChips.innerHTML = '<button class="filter-chip active" data-sub="all">All</button>';
    subs.forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.dataset.sub = sub;
      btn.textContent = sub;
      subcategoryChips.appendChild(btn);
    });

    subcategoryChips.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const allChip = subcategoryChips.querySelector('[data-sub="all"]');
        if (chip.dataset.sub === 'all') {
          activeSubcategories = [];
          subcategoryChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          allChip.classList.add('active');
        } else {
          allChip.classList.remove('active');
          chip.classList.toggle('active');
          const sub = chip.dataset.sub;
          if (activeSubcategories.includes(sub)) {
            activeSubcategories = activeSubcategories.filter(s => s !== sub);
          } else {
            activeSubcategories.push(sub);
          }
          if (activeSubcategories.length === 0) {
            allChip.classList.add('active');
          }
        }
      });
    });
  }

  // -- Sort Chips --
  sortChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sortChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeSortBy = chip.dataset.sort;
    });
  });

  // -- Apply Filters (from drawer) --
  if (filterApply) {
    filterApply.addEventListener('click', () => {
      applyFilters();
      closeDrawer();
    });
  }

  // -- Clear Filters --
  if (filterClear) {
    filterClear.addEventListener('click', () => {
      activeSubcategories = [];
      activeSortBy = 'default';
      if (priceMin) priceMin.value = '';
      if (priceMax) priceMax.value = '';

      if (subcategoryChips) {
        subcategoryChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        const allChip = subcategoryChips.querySelector('[data-sub="all"]');
        if (allChip) allChip.classList.add('active');
      }
      sortChips.forEach(c => c.classList.remove('active'));
      const defaultSort = document.querySelector('[data-sort="default"]');
      if (defaultSort) defaultSort.classList.add('active');

      applyFilters();
      closeDrawer();
    });
  }

  // -- Render Products --
  function renderProducts(items) {
    productGrid.innerHTML = '';

    if (items.length === 0) {
      productGrid.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <h3 style="color: var(--text-muted);">No products found matching your criteria.</h3>
        </div>
      `;
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'product-card fade-in visible';
      card.style.animationDelay = `${index * 0.03}s`;

      card.innerHTML = `
        <div class="product-img-wrapper" style="cursor: pointer;" onclick="window.location.href='product.html?id=${item.id}'">
          <img src="${item.image}" alt="${item.name}" class="product-img" loading="lazy">
        </div>
        <div class="product-info">
          <h3 class="product-title" style="cursor: pointer;" onclick="window.location.href='product.html?id=${item.id}'">${item.name}</h3>
          <p class="product-category" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">${item.category}</p>
          <p class="product-subcategory" style="font-size: 0.8rem; color: var(--accent-color); margin-bottom: 0.5rem; opacity: 0.8;">${item.subcategory || ''}</p>
          <div class="product-price">${formatCurrency(item.price)}</div>
          <div class="product-actions">
            <button class="btn btn-primary add-to-cart-btn" data-id="${item.id}">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
          </div>
        </div>
      `;
      productGrid.appendChild(card);
    });

    productGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = String(e.currentTarget.dataset.id); // SUPPORT UUIDs
        const product = allProducts.find(p => String(p.id) === id); // FIXED String comparison
        if (product) {
          cart.addItem(product);
        }
      });
    });
  }

  // -- Filter Logic --
  function applyFilters() {
    let filtered = shuffle(allProducts.filter(p => p.type === 'product'));

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(searchTerm))
      );
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (activeSubcategories.length > 0) {
      filtered = filtered.filter(p => activeSubcategories.includes(p.subcategory));
    }

    const minPrice = priceMin ? parseInt(priceMin.value) : NaN;
    const maxPrice = priceMax ? parseInt(priceMax.value) : NaN;
    if (!isNaN(minPrice)) filtered = filtered.filter(p => p.price >= minPrice);
    if (!isNaN(maxPrice)) filtered = filtered.filter(p => p.price <= maxPrice);

    if (activeSortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (activeSortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    currentProducts = filtered;
    renderProducts(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);

  // ── Fetch Dynamic Products & merge, then init ──────────────────────
  async function loadAndInit() {
    if (window.ensureDynamicProductsLoaded) {
      await window.ensureDynamicProductsLoaded();
    }
    
    // allProducts integrates everything from the global products array securely
    allProducts = [...products]; 
    
    currentProducts = shuffle(allProducts.filter(p => p.type === 'product'));
    updateSubcategoryChips();
    renderProducts(currentProducts);

    // Handle ?cat= URL param
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    if (cat) {
      const pill = document.querySelector(`.cat-pill[data-category="${cat}"]`);
      if (pill) pill.click();
    }
  }

  loadAndInit();
});

