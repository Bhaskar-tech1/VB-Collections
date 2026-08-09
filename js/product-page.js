document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const detailContainer = document.getElementById('product-detail-container');
    const relatedSection = document.getElementById('related-products-section');
    const relatedGrid = document.getElementById('related-grid');

    // Product Info UI Elements
    const imgEl = document.getElementById('pd-image');
    const titleEl = document.getElementById('pd-title');
    const subcategoryEl = document.getElementById('pd-subcategory');
    const priceEl = document.getElementById('pd-price');
    const addBtn = document.getElementById('pd-add-to-cart');
    const shareBtn = document.getElementById('pd-share-btn');
    const crumbCategory = document.getElementById('crumb-category');

    // Helper to format currency (duplicate from filter.js to ensure availability)
    const formatCurrencyLocal = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id'); // REMOVED parseInt TO SUPPORT UUIDs

    const initPage = async () => {
        // Ensure dynamic products load first
        if (window.ensureDynamicProductsLoaded) {
            await window.ensureDynamicProductsLoaded();
        }

        setTimeout(() => {
            // Hide loader
            loadingContainer.style.display = 'none';

            if (!productId) {
                // Invalid ID
                errorContainer.style.display = 'block';
                return;
            }

            // Find the product safely comparing them as strings
            const product = products.find(p => String(p.id) === String(productId));

        if (!product) {
            // Product not found in products.js
            errorContainer.style.display = 'block';
            return;
        }

        // Render Product Data
        document.title = `${product.name} | VB Collections`;
        imgEl.src = product.image;
        imgEl.alt = product.name;
        titleEl.textContent = product.name;
        subcategoryEl.textContent = product.subcategory || product.category;
        priceEl.textContent = formatCurrencyLocal(product.price);

        crumbCategory.textContent = product.category;
        crumbCategory.href = `category.html?cat=${encodeURIComponent(product.category)}`;

        // Attach ADD TO CART event
        addBtn.addEventListener('click', () => {
            if (typeof cart !== 'undefined' && cart.addItem) {
                cart.addItem(product);
                // Optional: Provide UI feedback
                const originalText = addBtn.innerHTML;
                addBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
                addBtn.style.background = '#00c853'; // Success color
                setTimeout(() => {
                    addBtn.innerHTML = originalText;
                    addBtn.style.background = ''; // reset to CSS variable behavior
                }, 2000);
            }
        });

        // Attach SHARE event
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                const shareData = {
                    title: `${product.name} | VB Collections`,
                    text: `Check out the ${product.name} at VB Collections!`,
                    url: window.location.href
                };

                try {
                    if (navigator.share) {
                        await navigator.share(shareData);
                    } else {
                        // Fallback: Copy to clipboard
                        await navigator.clipboard.writeText(window.location.href);

                        // Temporary UI feedback
                        const icon = shareBtn.querySelector('i');
                        icon.className = 'fas fa-check';
                        setTimeout(() => {
                            icon.className = 'fas fa-share-alt';
                        }, 2000);
                        alert('Product link copied to clipboard!');
                    }
                } catch (err) {
                    // Usually user cancellation, safe to ignore natively
                    console.log('Sharing dismissed or failed:', err);
                }
            });
        }

        // Show Container
        detailContainer.style.display = 'grid';

        // Render Related Products
        renderRelatedProducts(product);

        }, 300); // Small timeout to simulate quick loading phase smoothly
    };

    // Load page data
    initPage();

    // Random shuffle helper
    function shuffleArray(arr) {
        let array = [...arr];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function renderRelatedProducts(currentProduct) {
        // Find products in same category, exclude current
        let related = products.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id && p.type === 'product');

        // If not enough in category, fallback to any random products
        if (related.length < 4) {
            const others = products.filter(p => p.id !== currentProduct.id && p.type === 'product' && p.category !== currentProduct.category);
            related = related.concat(shuffleArray(others).slice(0, 4 - related.length));
        }

        // Shuffle and pick 4
        related = shuffleArray(related).slice(0, 4);

        if (related.length > 0) {
            relatedSection.style.display = 'block';
            relatedGrid.innerHTML = ''; // clear

            related.forEach((item, index) => {
                const el = document.createElement('div');
                el.className = 'product-card fade-in visible';
                el.style.animationDelay = `${index * 0.1}s`;
                el.innerHTML = `
                    <div class="product-img-wrapper" style="cursor: pointer;" onclick="window.location.href='product.html?id=${item.id}'">
                        <img src="${item.image}" alt="${item.name}" class="product-img" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title" style="cursor: pointer;" onclick="window.location.href='product.html?id=${item.id}'">${item.name}</h3>
                        <p class="product-category" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">${item.category}</p>
                        <p style="font-size: 0.8rem; color: var(--accent-color); margin-bottom: 0.5rem; opacity: 0.8;">${item.subcategory || ''}</p>
                        <div class="product-price">${formatCurrencyLocal(item.price)}</div>
                        <div class="product-actions">
                            <button class="btn btn-primary add-to-cart-btn" data-id="${item.id}">
                                <i class="fas fa-shopping-cart"></i> Add
                            </button>
                        </div>
                    </div>
                `;
                relatedGrid.appendChild(el);
            });

            // Attach cart events to related product buttons specifically
            relatedGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent triggering row clicks if any
                    const id = String(e.currentTarget.dataset.id); // SUPPORT UUIDs
                    const prod = products.find(p => String(p.id) === id);
                    if (prod && typeof cart !== 'undefined') {
                        cart.addItem(prod);
                    }
                });
            });
        }
    }
});
