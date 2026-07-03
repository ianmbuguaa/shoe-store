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
  const cart = getCart();
  
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Processing...";

  try {
    // Validate and update inventory for each item
    for (const item of cart) {
      // Fetch current product quantity from database
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.id)
        .single();

      if (fetchError) {
        throw new Error(`Error fetching product ${item.name}: ${fetchError.message}`);
      }

      // Check if sufficient quantity available
      const currentQuantity = product.quantity || 0;
      if (currentQuantity < item.qty) {
        throw new Error(`Insufficient stock for ${item.name}. Only ${currentQuantity} available.`);
      }

      // Deduct quantity from inventory
      const newQuantity = currentQuantity - item.qty;
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (updateError) {
        throw new Error(`Error updating inventory for ${item.name}: ${updateError.message}`);
      }
    }

    // Success! Clear cart and show confirmation
    localStorage.removeItem("cart");
    updateCartCount();
    
    // Show success message
    const container = document.getElementById("cart-items");
    container.innerHTML = `
      <div class="empty-cart" style="text-align: center; padding: 3rem 1rem;">
        <h2 style="color: var(--sage); margin-bottom: 1rem;">✓ Order Placed Successfully!</h2>
        <p style="color: var(--text-mid); margin-bottom: 2rem;">Thank you for your order. Your items will be shipped soon.</p>
        <a href="shop.html" class="btn">Continue Shopping</a>
      </div>`;
    
    document.getElementById("cart-summary").innerHTML = "";

  } catch (error) {
    console.error("Checkout error:", error);
    alert(error.message || "Checkout failed. Please try again.");
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Proceed to Checkout";
  }
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
