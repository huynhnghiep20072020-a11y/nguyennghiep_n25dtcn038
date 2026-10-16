const CART_KEY = 'minishop_cart';

const DEFAULT_CART_ITEMS = [
    {
        name: 'Chuột không dây M1',
        price: 250000,
        quantity: 1
    },
    {
        name: 'Bàn phím cơ K2',
        price: 790000,
        quantity: 1
    }
];

function formatCurrency(amount) {
    return Number(amount).toLocaleString('vi-VN') + ' đ';
}

function getCart() {
    const rawData = localStorage.getItem(CART_KEY);
    if (!rawData) {
        return null;
    }
    try {
        const parsed = JSON.parse(rawData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Lỗi khi đọc giỏ hàng từ localStorage:', e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (!cartCountEl) return;

    const cart = getCart();
    if (!cart || cart.length === 0) {
        cartCountEl.textContent = '0';
        return;
    }

    const totalQuantity = cart.reduce((total, item) => {
        return total + (Number(item.quantity) || 0);
    }, 0);

    cartCountEl.textContent = totalQuantity;
}

function initCartDataIfEmpty() {
    if (localStorage.getItem(CART_KEY) === null) {
        saveCart(DEFAULT_CART_ITEMS);
    }
}

function setupCartPage() {
    const cartTable = document.querySelector('.cart-table');
    if (!cartTable) return;

    const tbody = cartTable.querySelector('tbody');
    const grandTotalEl = document.getElementById('cart-grand-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout-btn');

    function renderCartTable() {
        const cart = getCart();

        if (!cart || cart.length === 0) {
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 25px; color: #64748b;">
                            Giỏ hàng của bạn đang trống. <a href="index.html" style="color: #214d78; font-weight: bold;">Mua sắm ngay</a>
                        </td>
                    </tr>
                `;
            }
            if (grandTotalEl) {
                grandTotalEl.innerHTML = '<strong>0 đ</strong>';
            }
            return;
        }

        if (tbody) {
            tbody.innerHTML = '';
            let grandTotal = 0;

            cart.forEach((item, index) => {
                const itemTotal = Number(item.price) * Number(item.quantity);
                grandTotal += itemTotal;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td class="unit-price">${formatCurrency(item.price)}</td>
                    <td>
                        <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="cart-qty-input">
                    </td>
                    <td class="item-subtotal">${formatCurrency(itemTotal)}</td>
                `;
                tbody.appendChild(tr);
            });

            if (grandTotalEl) {
                grandTotalEl.innerHTML = `<strong>${formatCurrency(grandTotal)}</strong>`;
            }
        }
    }

    cartTable.addEventListener('input', function (event) {
        const target = event.target;
        if (target && target.classList.contains('cart-qty-input')) {
            const index = Number(target.getAttribute('data-index'));
            let newQty = parseInt(target.value, 10);

            if (isNaN(newQty) || newQty < 1) {
                newQty = 1;
                target.value = 1;
            }

            const cart = getCart();
            if (cart && cart[index]) {
                cart[index].quantity = newQty;
                saveCart(cart);
                updateCartCount();

                const tr = target.closest('tr');
                if (tr) {
                    const subtotalEl = tr.querySelector('.item-subtotal');
                    if (subtotalEl) {
                        subtotalEl.textContent = formatCurrency(cart[index].price * newQty);
                    }
                }

                const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                if (grandTotalEl) {
                    grandTotalEl.innerHTML = `<strong>${formatCurrency(grandTotal)}</strong>`;
                }
            }
        }
    });

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function () {
            const confirmDelete = confirm("Xóa toàn bộ giỏ hàng?");
            if (confirmDelete) {
                localStorage.removeItem(CART_KEY);
                updateCartCount();
                renderCartTable();
                alert("Đã xóa toàn bộ giỏ hàng thành công!");
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            const cart = getCart();
            if (!cart || cart.length === 0) {
                alert("Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm trước khi đặt hàng.");
                return;
            }
            alert("Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đã được tiếp nhận thành công.");
        });
    }

    renderCartTable();
}

function setupProductPage() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (!addToCartBtn) return;

    addToCartBtn.addEventListener('click', function () {
        const name = addToCartBtn.getAttribute('data-name') || 'Sản phẩm';
        const price = Number(addToCartBtn.getAttribute('data-price')) || 0;

        let cart = getCart();
        if (!cart) {
            cart = [];
        }

        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity = (Number(existingItem.quantity) || 1) + 1;
        } else {
            cart.push({ name: name, price: price, quantity: 1 });
        }

        saveCart(cart);
        updateCartCount();
        alert(`Đã thêm "${name}" vào giỏ hàng thành công!`);
    });
}

function setupContactForm() {
    const contactForm = document.querySelector('form[action="contact.html"]');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (event) {
        const messageInput = document.getElementById('contact-message');
        if (messageInput) {
            const message = messageInput.value.trim();
            if (message.length < 10) {
                event.preventDefault();
                alert("Nội dung tin nhắn quá ngắn! Vui lòng nhập tối thiểu 10 ký tự.");
                messageInput.focus();
                return false;
            }
        }
        alert("Gửi liên hệ thành công! Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.");
    });
}

function setupRegisterForm() {
    const registerForm = document.querySelector('form[action="register.html"]');
    if (!registerForm) return;

    registerForm.addEventListener('submit', function (event) {
        const passwordInput = document.getElementById('password');
        const password2Input = document.getElementById('password2');

        if (passwordInput && password2Input) {
            if (passwordInput.value !== password2Input.value) {
                event.preventDefault();
                alert("Mật khẩu nhập lại không khớp! Vui lòng kiểm tra lại.");
                password2Input.focus();
                return false;
            }
        }
        alert("Đăng ký tài khoản thành công!");
    });
}

function setupLoginForm() {
    const loginForm = document.querySelector('form[action="login.html"]');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function (event) {
        alert("Đăng nhập thành công!");
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initCartDataIfEmpty();
    updateCartCount();
    setupCartPage();
    setupProductPage();
    setupContactForm();
    setupRegisterForm();
    setupLoginForm();
});
