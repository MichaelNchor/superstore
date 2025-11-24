// AJAX Cart Operations - No Page Reload
(function() {
    'use strict';
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `ajax-toast ajax-toast-${type}`;
        toast.innerHTML = `
            <div class="ajax-toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            </div>
            <div class="ajax-toast-content">
                <div class="ajax-toast-title">${type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}</div>
                <div class="ajax-toast-message">${message}</div>
            </div>
            <button class="ajax-toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('ajax-toast-show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('ajax-toast-show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Update cart count in navbar
    function updateCartCount(count) {
        const cartBadge = document.querySelector('.nav-icons .badge');
        if (cartBadge) {
            cartBadge.textContent = count;
            cartBadge.classList.add('badge-pulse');
            setTimeout(() => cartBadge.classList.remove('badge-pulse'), 600);
        }
    }
    
    // Update wishlist count in navbar
    function updateWishlistCount(count) {
        const wishlistBadges = document.querySelectorAll('[href="/wishlist"] .badge');
        wishlistBadges.forEach(badge => {
            badge.textContent = count;
            badge.classList.add('badge-pulse');
            setTimeout(() => badge.classList.remove('badge-pulse'), 600);
        });
    }
    
    // Add to Cart AJAX
    document.addEventListener('click', function(e) {
        const addToCartBtn = e.target.closest('a[href*="/cart/add/"]');
        if (addToCartBtn && !addToCartBtn.classList.contains('ajax-disabled')) {
            e.preventDefault();
            
            const url = addToCartBtn.getAttribute('href');
            const productSlug = url.split('/cart/add/')[1];
            
            // Disable button temporarily
            const originalHtml = addToCartBtn.innerHTML;
            addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding...';
            addToCartBtn.classList.add('ajax-disabled');
            
            fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message || 'Product added to cart!', 'success');
                    updateCartCount(data.cartCount);
                    
                    // Update button
                    addToCartBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Added!';
                    setTimeout(() => {
                        addToCartBtn.innerHTML = originalHtml;
                        addToCartBtn.classList.remove('ajax-disabled');
                    }, 1500);
                } else {
                    showToast(data.message || 'Failed to add product', 'error');
                    addToCartBtn.innerHTML = originalHtml;
                    addToCartBtn.classList.remove('ajax-disabled');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred. Please try again.', 'error');
                addToCartBtn.innerHTML = originalHtml;
                addToCartBtn.classList.remove('ajax-disabled');
            });
        }
    });
    
    // Add to Wishlist AJAX
    document.addEventListener('click', function(e) {
        const addToWishlistBtn = e.target.closest('.add-to-wishlist-btn, a[href*="/wishlist/add/"]');
        if (addToWishlistBtn && !addToWishlistBtn.classList.contains('ajax-disabled')) {
            e.preventDefault();
            
            const url = addToWishlistBtn.getAttribute('href');
            const icon = addToWishlistBtn.querySelector('i');
            const originalClass = icon ? icon.className : '';
            
            // Animate icon
            if (icon) {
                icon.className = 'fas fa-spinner fa-spin';
            }
            addToWishlistBtn.classList.add('ajax-disabled');
            
            fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message || 'Added to wishlist!', 'success');
                    if (data.wishlistCount !== undefined) {
                        updateWishlistCount(data.wishlistCount);
                    }
                    
                    // Update icon
                    if (icon) {
                        icon.className = 'fas fa-heart';
                        setTimeout(() => {
                            icon.className = originalClass;
                            addToWishlistBtn.classList.remove('ajax-disabled');
                        }, 1000);
                    }
                } else {
                    showToast(data.message || 'Failed to add to wishlist', 'error');
                    if (icon) {
                        icon.className = originalClass;
                    }
                    addToWishlistBtn.classList.remove('ajax-disabled');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred. Please try again.', 'error');
                if (icon) {
                    icon.className = originalClass;
                }
                addToWishlistBtn.classList.remove('ajax-disabled');
            });
        }
    });
    
    // Cart Update (Quantity) AJAX
    document.addEventListener('click', function(e) {
        const updateBtn = e.target.closest('a[href*="/cart/update/"]');
        if (updateBtn && !updateBtn.classList.contains('ajax-disabled')) {
            e.preventDefault();
            
            const url = updateBtn.getAttribute('href');
            updateBtn.classList.add('ajax-disabled');
            
            fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateCartCount(data.cartCount);
                    
                    // Update quantity display
                    const qtyInput = updateBtn.closest('.quantity-control')?.querySelector('.qty');
                    if (qtyInput && data.newQuantity !== undefined) {
                        qtyInput.value = data.newQuantity;
                    }
                    
                    // Update subtotal if available
                    if (data.subtotal !== undefined) {
                        const subtotalEl = updateBtn.closest('.cart-item-card')?.querySelector('.cart-item-subtotal');
                        if (subtotalEl) {
                            subtotalEl.textContent = '$' + data.subtotal.toFixed(2);
                        }
                    }
                    
                    // Update total if available
                    if (data.total !== undefined) {
                        const totalEl = document.querySelector('.cart-total-amount');
                        if (totalEl) {
                            totalEl.textContent = '$' + data.total.toFixed(2);
                        }
                    }
                    
                    // If quantity is 0, remove the item from view
                    if (data.newQuantity === 0) {
                        const cartItem = updateBtn.closest('.cart-item-card');
                        if (cartItem) {
                            cartItem.style.opacity = '0';
                            setTimeout(() => cartItem.remove(), 300);
                        }
                    }
                } else {
                    showToast(data.message || 'Failed to update cart', 'error');
                }
                updateBtn.classList.remove('ajax-disabled');
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred. Please try again.', 'error');
                updateBtn.classList.remove('ajax-disabled');
            });
        }
    });
    
    // Remove from Cart AJAX
    document.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('a[href*="/cart/clear/"]');
        if (removeBtn && !removeBtn.classList.contains('ajax-disabled')) {
            e.preventDefault();
            
            const url = removeBtn.getAttribute('href');
            const cartItem = removeBtn.closest('.cart-item-card');
            
            if (confirm('Are you sure you want to remove this item from your cart?')) {
                removeBtn.classList.add('ajax-disabled');
                
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast(data.message || 'Item removed from cart', 'success');
                        updateCartCount(data.cartCount);
                        
                        // Animate removal
                        if (cartItem) {
                            cartItem.style.opacity = '0';
                            cartItem.style.transform = 'translateX(100%)';
                            setTimeout(() => cartItem.remove(), 300);
                        }
                        
                        // Update total
                        if (data.total !== undefined) {
                            const totalEl = document.querySelector('.cart-total-amount');
                            if (totalEl) {
                                totalEl.textContent = '$' + data.total.toFixed(2);
                            }
                        }
                    } else {
                        showToast(data.message || 'Failed to remove item', 'error');
                        removeBtn.classList.remove('ajax-disabled');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast('An error occurred. Please try again.', 'error');
                    removeBtn.classList.remove('ajax-disabled');
                });
            }
        }
    });
    
    // Add toast styles
    const style = document.createElement('style');
    style.textContent = `
        .ajax-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            padding: 1rem 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 10000;
            min-width: 300px;
            max-width: 400px;
            opacity: 0;
            transform: translateX(400px);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .ajax-toast-show {
            opacity: 1;
            transform: translateX(0);
        }
        
        .ajax-toast-icon {
            font-size: 1.5rem;
        }
        
        .ajax-toast-success .ajax-toast-icon {
            color: #10b981;
        }
        
        .ajax-toast-error .ajax-toast-icon {
            color: #ef4444;
        }
        
        .ajax-toast-info .ajax-toast-icon {
            color: #3b82f6;
        }
        
        .ajax-toast-content {
            flex: 1;
        }
        
        .ajax-toast-title {
            font-weight: 700;
            font-size: 0.95rem;
            color: #1f2937;
            margin-bottom: 0.25rem;
        }
        
        .ajax-toast-message {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .ajax-toast-close {
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 0.25rem;
            font-size: 1rem;
            transition: color 0.2s;
        }
        
        .ajax-toast-close:hover {
            color: #374151;
        }
        
        .badge-pulse {
            animation: badgePulse 0.6s ease-in-out;
        }
        
        @keyframes badgePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
        }
        
        .ajax-disabled {
            pointer-events: none;
            opacity: 0.6;
        }
        
        @media (max-width: 576px) {
            .ajax-toast {
                right: 10px;
                left: 10px;
                min-width: auto;
            }
        }
    `;
    document.head.appendChild(style);
})();
