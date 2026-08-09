// Cart core logic handling interaction with localStorage and calculating totals
class CartManager {
  constructor() {
    this.cartKey = 'vb_cart';
    this.items = this.getCart();
    this.initCartBadge();
  }

  getCart() {
    const data = localStorage.getItem(this.cartKey);
    return data ? JSON.parse(data) : [];
  }

  saveCart() {
    localStorage.setItem(this.cartKey, JSON.stringify(this.items));
    this.updateBadge();
    
    // Dispatch custom event indicating cart change so UI updates immediately
    window.dispatchEvent(new Event('cartUpdated'));
  }

  addItem(product) {
    const existing = this.items.find(item => String(item.id) === String(product.id)); // Fix matching
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({
        ...product,
        quantity: 1
      });
    }
    this.saveCart();
    this.showToast(`Added ${product.name} to cart`);
  }

  removeItem(productId) {
    this.items = this.items.filter(item => String(item.id) !== String(productId)); // Fix matching
    this.saveCart();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => String(item.id) === String(productId)); // Fix matching
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  getTotalPrice() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  generateWhatsAppLink() {
    const phoneNumber = "919059707303";
    let message = "Hi VB Collections, I want to order:\n\n";
    
    this.items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} - ${item.quantity} x ${formatCurrency(item.price)}\n`;
    });
    
    message += `\n*Total: ${formatCurrency(this.getTotalPrice())}*`;
    
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }

  // UI helpers
  initCartBadge() {
    this.updateBadge();
  }

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = this.getTotalItems();
      
      // Animate badge
      badge.classList.remove('pop');
      void badge.offsetWidth; // Trigger reflow
      badge.classList.add('pop');
    });
  }

  showToast(message) {
    // Check if toast container exists
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = 'var(--primary-color)';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = 'var(--radius-pill)';
    toast.style.boxShadow = 'var(--shadow-md)';
    toast.style.fontFamily = 'var(--font-family)';
    toast.style.fontWeight = '500';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
}

// Global instance to use across pages
const cart = new CartManager();
