// ===== Cart (localStorage) =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const total = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.getElementById("cart-count").textContent = total;
}

// ===== Render Cart =====
function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const summary   = document.getElementById("cart-summary");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <a href="shop.html" class="btn">Continue Shopping</a>
      </div>`;
    summary.innerHTML = "";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/80x80?text=Shoe'" />
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <span class="price">$${item.price.toFixed(2)}</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-id="${item.id}" data-action="decrease">−</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
      </div>
      <span class="item-total">$${(item.price * item.qty).toFixed(2)}</span>
      <button class="remove-btn" data-id="${item.id}">✕</button>
    </div>
  `).join("");

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  summary.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>$${total.toFixed(2)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>Free</span></div>
    <div class="summary-row total-row"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    <button class="btn checkout-btn">Proceed to Checkout</button>
    <a href="shop.html" class="continue-link">← Continue Shopping</a>
  `;
}

// ===== Event Delegation =====
document.getElementById("cart-items").addEventListener("click", function (e) {
  const id = parseInt(e.target.dataset.id);
  let cart = getCart();

  if (e.target.classList.contains("remove-btn")) {
    cart = cart.filter(i => i.id !== id);
  } else if (e.target.classList.contains("qty-btn")) {
    const item = cart.find(i => i.id === id);
    if (item) {
      if (e.target.dataset.action === "increase") {
        item.qty++;
      } else {
        item.qty--;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
      }
    }
  }

  saveCart(cart);
  updateCartCount();
  renderCart();
});

// ===== Init =====
updateCartCount();
renderCart();
