// Supabase Configuration
const SUPABASE_URL = 'https://bgmutbfurqlgyszbkyxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXV0YmZ1cnFsZ3lzemJreXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ2NzksImV4cCI6MjA5NzcwMDY3OX0.iBkb1zSMcsfBrT0lqr53uDcjBSJX3yO87wSgPmb9ArE';

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  container.innerHTML = cart.map(item => {
    const itemPrice = parseFloat(item.price || 0);
    return `
    <div class="cart-item">
      <img src="${item.image_url || item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/80x80?text=Shoe'" />
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        ${item.selectedSize ? `<p style="font-size: 0.85rem; color: var(--text-mid); margin: 0.25rem 0;">Size: ${item.selectedSize}</p>` : ''}
        <span class="price">KSh ${itemPrice.toFixed(2)}</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-id="${item.id}" data-size="${item.selectedSize || ''}" data-action="decrease">−</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-id="${item.id}" data-size="${item.selectedSize || ''}" data-action="increase">+</button>
      </div>
      <span class="item-total">KSh ${(itemPrice * item.qty).toFixed(2)}</span>
      <button class="remove-btn" data-id="${item.id}" data-size="${item.selectedSize || ''}">✕</button>
    </div>
  `;
  }).join("");

  const total = cart.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.qty), 0);
  summary.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>KSh ${total.toFixed(2)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>Free</span></div>
    <div class="summary-row total-row"><span>Total</span><span>KSh ${total.toFixed(2)}</span></div>
    <button class="btn checkout-btn" id="checkout-btn">Proceed to Checkout</button>
    <a href="shop.html" class="continue-link">← Continue Shopping</a>
  `;

  // Attach checkout handler
  document.getElementById("checkout-btn").addEventListener("click", handleCheckout);
}

// ===== Checkout Handler =====
async function handleCheckout() {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Not logged in - redirect to auth page with return URL
    window.location.href = 'auth.html?returnTo=checkout.html';
    return;
  }
  
  const cart = getCart();
  
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // User is authenticated, proceed to checkout page
  window.location.href = 'checkout.html';
}

// ===== Event Delegation =====
document.getElementById("cart-items").addEventListener("click", function (e) {
  const id = parseInt(e.target.dataset.id);
  const size = e.target.dataset.size || '';
  let cart = getCart();

  if (e.target.classList.contains("remove-btn")) {
    // Remove item matching both id and size
    cart = cart.filter(i => {
      const itemSize = i.selectedSize || '';
      return !(i.id === id && itemSize === size);
    });
  } else if (e.target.classList.contains("qty-btn")) {
    // Find item matching both id and size
    const item = cart.find(i => {
      const itemSize = i.selectedSize || '';
      return i.id === id && itemSize === size;
    });
    if (item) {
      if (e.target.dataset.action === "increase") {
        item.qty++;
      } else {
        item.qty--;
        if (item.qty <= 0) {
          cart = cart.filter(i => {
            const itemSize = i.selectedSize || '';
            return !(i.id === id && itemSize === size);
          });
        }
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
