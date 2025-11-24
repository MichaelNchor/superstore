/**
 * Modern E-Commerce UI Enhancements
 * Handles animations, interactions, and dynamic UI updates
 */

(function() {
  'use strict';

  // Toast Notification System
  const Toast = {
    show: function(message, type = 'info', duration = 3000) {
      const toast = document.createElement('div');
      toast.className = `toast-modern toast-${type} fade-in`;
      
      const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
      };
      
      toast.innerHTML = `
        ${icons[type] || icons.info}
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280;">&times;</button>
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  // Add to window for global access
  window.Toast = Toast;

  // Smooth Scroll for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Lazy Loading for Images
  const lazyImages = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('fade-in');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }

  // Add to Cart with Animation
  window.addToCartModern = function(productId, button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    button.disabled = true;

    // Simulate API call (replace with actual implementation)
    setTimeout(() => {
      button.innerHTML = '<i class="fas fa-check"></i> Added!';
      Toast.show('Product added to cart successfully!', 'success');
      
      // Update cart count
      updateCartCount();
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
      }, 1500);
    }, 500);
  };

  // Add to Wishlist with Animation
  window.addToWishlistModern = function(productId, button) {
    button.classList.toggle('active');
    const icon = button.querySelector('i');
    
    if (button.classList.contains('active')) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      icon.style.color = '#ef4444';
      Toast.show('Added to wishlist!', 'success');
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
      icon.style.color = '';
      Toast.show('Removed from wishlist', 'info');
    }
    
    // Update wishlist count
    updateWishlistCount();
  };

  // Update Cart Count
  function updateCartCount() {
    const cartBadge = document.querySelector('.cart-count-badge');
    if (cartBadge) {
      let count = parseInt(cartBadge.textContent) || 0;
      count++;
      cartBadge.textContent = count;
      cartBadge.classList.add('scale-in');
      setTimeout(() => cartBadge.classList.remove('scale-in'), 300);
    }
  }

  // Update Wishlist Count
  function updateWishlistCount() {
    const wishlistBadge = document.querySelector('.wishlist-count-badge');
    if (wishlistBadge) {
      let count = parseInt(wishlistBadge.textContent) || 0;
      // Toggle based on action
      wishlistBadge.textContent = count;
      wishlistBadge.classList.add('scale-in');
      setTimeout(() => wishlistBadge.classList.remove('scale-in'), 300);
    }
  }

  // Sticky Header on Scroll
  let lastScroll = 0;
  const header = document.querySelector('.modern-nav');
  
  if (header) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
      }
      
      if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        // Scroll down
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
      } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        // Scroll up
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
      }
      
      lastScroll = currentScroll;
    });
  }

  // Product Image Gallery
  window.initProductGallery = function() {
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    const mainImage = document.querySelector('.product-main-image');
    
    if (thumbnails.length && mainImage) {
      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
          thumbnails.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          
          const newSrc = this.dataset.image;
          mainImage.style.opacity = '0';
          
          setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.style.opacity = '1';
          }, 200);
        });
      });
    }
  };

  // Quantity Counter
  window.initQuantityCounters = function() {
    const quantityInputs = document.querySelectorAll('.quantity-input');
    
    quantityInputs.forEach(input => {
      const minusBtn = input.previousElementSibling;
      const plusBtn = input.nextElementSibling;
      
      if (minusBtn && minusBtn.classList.contains('quantity-minus')) {
        minusBtn.addEventListener('click', () => {
          let value = parseInt(input.value) || 1;
          if (value > 1) {
            input.value = value - 1;
            input.dispatchEvent(new Event('change'));
          }
        });
      }
      
      if (plusBtn && plusBtn.classList.contains('quantity-plus')) {
        plusBtn.addEventListener('click', () => {
          let value = parseInt(input.value) || 1;
          const max = parseInt(input.getAttribute('max')) || 999;
          if (value < max) {
            input.value = value + 1;
            input.dispatchEvent(new Event('change'));
          }
        });
      }
    });
  };

  // Search Functionality Enhancement
  const searchInput = document.querySelector('.search-modern input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      const query = this.value.trim();
      
      if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
          // Add loading state
          this.classList.add('searching');
          // Implement search logic here
          console.log('Searching for:', query);
        }, 300);
      }
    });
  }

  // Price Range Filter
  window.initPriceFilter = function() {
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const minValue = document.getElementById('minValue');
    const maxValue = document.getElementById('maxValue');
    
    if (minPrice && maxPrice) {
      minPrice.addEventListener('input', function() {
        if (minValue) minValue.textContent = this.value;
        filterProducts();
      });
      
      maxPrice.addEventListener('input', function() {
        if (maxValue) maxValue.textContent = this.value;
        filterProducts();
      });
    }
  };

  function filterProducts() {
    // Implement product filtering logic
    console.log('Filtering products...');
  }

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements with animate class
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // Mobile Menu Toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });

  // Form Validation Enhancement
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const inputs = this.querySelectorAll('input[required], textarea[required]');
      let isValid = true;
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('error');
          
          // Remove error class on input
          input.addEventListener('input', function() {
            this.classList.remove('error');
          }, { once: true });
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        Toast.show('Please fill in all required fields', 'error');
      }
    });
  });

  // Add loading state to buttons with data-loading attribute
  document.querySelectorAll('button[data-loading], a[data-loading]').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!this.classList.contains('loading')) {
        this.classList.add('loading');
        this.setAttribute('disabled', 'disabled');
        
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        // Remove loading state after 3 seconds (adjust as needed)
        setTimeout(() => {
          this.innerHTML = originalText;
          this.classList.remove('loading');
          this.removeAttribute('disabled');
        }, 3000);
      }
    });
  });

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    initQuantityCounters();
    initProductGallery();
    initPriceFilter();
    
    // Add fade-in animation to page content
    document.body.classList.add('fade-in');
    
    console.log('Modern UI enhancements loaded');
  });

  // Handle Add to Cart clicks
  document.addEventListener('click', function(e) {
    if (e.target.closest('.add-to-cart-btn')) {
      e.preventDefault();
      const button = e.target.closest('.add-to-cart-btn');
      const productId = button.dataset.productId;
      if (productId) {
        addToCartModern(productId, button);
      }
    }
    
    if (e.target.closest('.add-to-wishlist-btn')) {
      e.preventDefault();
      const button = e.target.closest('.add-to-wishlist-btn');
      const productId = button.dataset.productId;
      if (productId) {
        addToWishlistModern(productId, button);
      }
    }
  });

  // Back to Top Button
  const backToTop = document.createElement('button');
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTop.className = 'back-to-top';
  backToTop.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
    box-shadow: var(--shadow-lg);
    z-index: 999;
  `;
  
  document.body.appendChild(backToTop);
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTop.style.opacity = '1';
      backToTop.style.visibility = 'visible';
    } else {
      backToTop.style.opacity = '0';
      backToTop.style.visibility = 'hidden';
    }
  });
  
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

})();
