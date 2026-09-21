// Global App UI Logic
document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initScrollAnimations();
});

function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Change icon based on state
    const icon = menuBtn.querySelector('i');
    if (icon) {
      if (navLinks.classList.contains('active')) {
        icon.className = 'fas fa-times'; // Change to close icon
      } else {
        icon.className = 'fas fa-bars'; // Change to hamburger icon
      }
    }
  });

  // Close menu when clicking a link smoothly
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto') && !href.startsWith('tel')) {
        e.preventDefault();
        
        // Start closing the menu
        navLinks.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';

        // Simple, fast delay to let the menu slide out slightly before rapid navigation
        setTimeout(() => {
          window.location.href = href;
        }, 150);
      } else {
        navLinks.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  });
}

function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Optional: stop observing once animated
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
  });
}
