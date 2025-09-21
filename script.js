document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");
    });

    const scrollTopBtn = document.getElementById("scrollTopBtn");
    window.onscroll = () => {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            scrollTopBtn.classList.add("show");
        } else {
            scrollTopBtn.classList.remove("show");
        }
    };
    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let cart = [];
    let orders = [];
    let isLoggedIn = false; 

    const cartButton = document.getElementById('cart-button');
    const closeCartButton = document.getElementById('close-cart-button');
    const cartModalBackdrop = document.getElementById('cart-modal-backdrop');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');
    const menuContainer = document.querySelector('.main-content');
    const checkoutButton = document.getElementById('checkout-btn');
    const loginLogoutButton = document.getElementById('login-logout-button');
    const ordersContainer = document.getElementById('orders-container');
    const customAlert = document.getElementById('custom-alert');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const checkoutModalBackdrop = document.getElementById('checkout-modal-backdrop');
    const closeCheckoutButton = document.getElementById('close-checkout-button');
    const confirmOrderButton = document.getElementById('confirm-order-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSummaryContainer = document.getElementById('checkout-summary');

    const saveState = () => {
        localStorage.setItem('foodCart', JSON.stringify(cart));
        localStorage.setItem('foodOrders', JSON.stringify(orders));
        localStorage.setItem('foodUserLogin', JSON.stringify(isLoggedIn)); 
    };

    const loadState = () => {
        cart = JSON.parse(localStorage.getItem('foodCart')) || [];
        orders = JSON.parse(localStorage.getItem('foodOrders')) || [];
        isLoggedIn = JSON.parse(localStorage.getItem('foodUserLogin')) || false; 
    };

    const filterMenu = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const menuItems = menuContainer.querySelectorAll('.box');
        let itemsFound = 0;
        menuContainer.querySelector('.no-results-message')?.remove();

        menuItems.forEach(item => {
            const itemName = item.dataset.name.toLowerCase();
            const isVisible = itemName.includes(searchTerm);
            item.style.display = isVisible ? 'block' : 'none';
            if (isVisible) itemsFound++;
        });

        if (itemsFound === 0) {
            menuContainer.insertAdjacentHTML('beforeend', `<p class="no-results-message">No food found for "${searchInput.value}"</p>`);
        }
    };

    const toggleCartModal = (show) => cartModalBackdrop.classList.toggle('hidden', !show);
    const toggleCheckoutModal = (show) => checkoutModalBackdrop.classList.toggle('hidden', !show);

    const addToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        updateCart();
        cartCountElement.parentElement.classList.add('cart-bump');
        setTimeout(() => cartCountElement.parentElement.classList.remove('cart-bump'), 300);
    };

    const updateQuantity = (itemId, change) => {
        const item = cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(cartItem => cartItem.id !== itemId);
            }
        }
        updateCart();
    };

    const handleCheckout = () => {
        if (!isLoggedIn) {
            showCustomAlert('Please log in to proceed to checkout.');
            toggleCartModal(false); 
            return;
        }

        if (cart.length === 0) {
            showCustomAlert('Your cart is empty.');
            return;
        }
        toggleCartModal(false);
        renderCheckoutSummary();
        toggleCheckoutModal(true);
    };
    
    const handleConfirmOrder = (e) => {
        e.preventDefault();
        const shippingDetails = {
            fullName: document.getElementById('fullName').value.trim(),
            address: document.getElementById('address').value.trim(),
            pinCode: document.getElementById('pinCode').value.trim(),
            phone: document.getElementById('phone').value.trim()
        };

        if (!shippingDetails.fullName || !shippingDetails.address || !shippingDetails.pinCode || !shippingDetails.phone) {
            showCustomAlert('Please fill out all shipping details.');
            return;
        }

        const newOrder = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shipping: shippingDetails
        };

        orders.push(newOrder);
        cart = [];
        saveState();
        updateCart();
        renderOrders();
        toggleCheckoutModal(false);
        checkoutForm.reset();
        showCustomAlert('Order placed successfully!');
    };

    const updateCart = () => {
        cartItemsContainer.innerHTML = cart.length === 0 
            ? '<p>Your cart is empty.</p>'
            : cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>RS ${item.price}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                        <button class="remove-item" data-id="${item.id}">×</button>
                    </div>
                </div>`).join('');
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartCountElement.textContent = totalItems;
        cartTotalElement.textContent = `RS ${totalPrice}`;
        saveState();
    };
    
    const renderCheckoutSummary = () => {
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        checkoutSummaryContainer.innerHTML = cart.map(item => `
            <div class="summary-item">
                <span>${item.name} (x${item.quantity})</span>
                <span>RS ${item.price * item.quantity}</span>
            </div>`).join('') + `
            <div class="summary-item summary-total">
                <span>Total</span>
                <span>RS ${totalPrice}</span>
            </div>`;
    };
    
    const updateLoginStatus = () => {
        if (isLoggedIn) {
            loginLogoutButton.textContent = 'Logout';
            loginLogoutButton.href = '#';
        } else {
            loginLogoutButton.textContent = 'Login';
            loginLogoutButton.href = 'login.html';
        }
    };

    const renderOrders = () => {
        ordersContainer.innerHTML = !isLoggedIn
            ? '<p>Please log in to see your order history.</p>'
            : orders.length === 0
            ? '<p>You have no past orders.</p>'
            : orders.map(order => `
                <div class="order-card">
                    <div class="order-card-header">
                        <h4>Order #${order.id}</h4>
                        <span>${order.date}</span>
                    </div>
                    <div class="order-card-body">
                        <div class="order-card-shipping">
                            <strong>Shipped to:</strong> ${order.shipping.fullName}<br>
                            ${order.shipping.address}, ${order.shipping.pinCode}<br>
                            Contact: ${order.shipping.phone}
                        </div>
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span>${item.name} (x${item.quantity})</span>
                                <span>RS ${item.price * item.quantity}</span>
                            </div>`).join('')}
                    </div>
                    <div class="order-card-footer">Total: RS ${order.total}</div>
                </div>`).join('');
    };

    const showCustomAlert = (message) => {
        customAlert.textContent = message;
        customAlert.classList.remove('hidden');
        setTimeout(() => customAlert.classList.add('hidden'), 3000);
    };

    if (searchForm) {
        searchForm.addEventListener('submit', e => e.preventDefault());
        searchInput.addEventListener('input', filterMenu);
    }

    menuContainer.addEventListener('click', (e) => {
        const productBox = e.target.closest('.box');
        if (!productBox) return;

        if (!isLoggedIn) {
            showCustomAlert('Please log in to add items to your cart.');
            return; 
        }
       
        const item = {
            id: productBox.dataset.id,
            name: productBox.dataset.name,
            price: parseInt(productBox.dataset.price),
            image: productBox.dataset.image,
        };

        if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(item);
            showCustomAlert(`${item.name} added to cart!`);
        } else if (e.target.classList.contains('buy-now-btn')) {
            addToCart(item);
            toggleCartModal(true);
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const itemId = target.dataset.id;
        if (target.classList.contains('quantity-btn')) {
            updateQuantity(itemId, parseInt(target.dataset.change));
        } else if (target.classList.contains('remove-item')) {
            const item = cart.find(i => i.id === itemId);
            if (item) updateQuantity(itemId, -item.quantity);
        }
    });
    
    checkoutButton.addEventListener('click', handleCheckout);
    confirmOrderButton.addEventListener('click', handleConfirmOrder);
    
    if (loginLogoutButton) {
        loginLogoutButton.addEventListener('click', (e) => {
            if (isLoggedIn) {
                e.preventDefault();
                isLoggedIn = false;
                cart = [];
                orders = [];
                updateLoginStatus();
                updateCart();
                renderOrders();
                saveState(); 
                showCustomAlert('You have been logged out.');
            }
          
        });
    }

    cartButton.addEventListener('click', (e) => { e.preventDefault(); toggleCartModal(true); });
    closeCartButton.addEventListener('click', () => toggleCartModal(false));
    closeCheckoutButton.addEventListener('click', () => toggleCheckoutModal(false));
    cartModalBackdrop.addEventListener('click', (e) => { if (e.target === cartModalBackdrop) toggleCartModal(false); });
    checkoutModalBackdrop.addEventListener('click', (e) => { if (e.target === checkoutModalBackdrop) toggleCheckoutModal(false); });

    loadState();
    updateCart();
    renderOrders();
    updateLoginStatus();
});