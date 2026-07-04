// Supabase Configuration
const SUPABASE_URL = 'https://bgmutbfurqlgyszbkyxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXV0YmZ1cnFsZ3lzemJreXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ2NzksImV4cCI6MjA5NzcwMDY3OX0.iBkb1zSMcsfBrT0lqr53uDcjBSJX3yO87wSgPmb9ArE';

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// ===== Check Authentication =====
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Not logged in - redirect to auth
    window.location.href = 'auth.html?returnTo=checkout.html';
    return false;
  }
  
  currentUser = session.user;
  
  // Pre-fill user data
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', currentUser.id)
    .single();
  
  if (customer) {
    document.getElementById('full-name').value = customer.full_name || '';
    document.getElementById('email').value = customer.email || currentUser.email || '';
    document.getElementById('phone').value = customer.phone || '';
    document.getElementById('address').value = customer.address || '';
    document.getElementById('city').value = customer.city || '';
    document.getElementById('postal-code').value = customer.postal_code || '';
  } else {
    document.getElementById('email').value = currentUser.email || '';
  }
  
  return true;
}

// ===== Cart Functions =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById("cart-count").textContent = total;
}

// ===== Render Order Summary =====
function renderOrderSummary() {
  const cart = getCart();
  const orderItemsDiv = document.getElementById('order-items');
  
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }
  
  orderItemsDiv.innerHTML = cart.map(item => {
    const itemPrice = parseFloat(item.price || 0);
    return `
      <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
        <img src="${item.image_url || item.image}" alt="${item.name}" 
             onerror="this.src='https://placehold.co/60x60?text=Shoe'" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;" />
        <div style="flex: 1;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.9rem;">${item.name}</h4>
          ${item.selectedSize ? `<p style="font-size: 0.8rem; color: var(--text-mid); margin: 0;">Size: ${item.selectedSize}</p>` : ''}
          <p style="font-size: 0.8rem; color: var(--text-mid); margin: 0;">Qty: ${item.qty}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 600; color: var(--sage);">KSh ${(itemPrice * item.qty).toFixed(2)}</p>
        </div>
      </div>
    `;
  }).join('');
  
  const total = cart.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.qty), 0);
  document.getElementById('subtotal').textContent = `KSh ${total.toFixed(2)}`;
  document.getElementById('total').textContent = `KSh ${total.toFixed(2)}`;
}

// ===== Create Orders Table if Needed =====
async function ensureOrdersTable() {
  // This will be used to store orders - we'll create it via migration if it doesn't exist
  return true;
}

// ===== Handle Checkout Form =====
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty!');
    window.location.href = 'cart.html';
    return;
  }
  
  const fullName = document.getElementById('full-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const postalCode = document.getElementById('postal-code').value.trim();
  const paymentMethod = document.getElementById('payment-method').value;
  
  const placeOrderBtn = document.getElementById('place-order-btn');
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Processing Order...';
  
  try {
    // Update customer information
    const { error: customerError } = await supabase
      .from('customers')
      .upsert({
        id: currentUser.id,
        email: email,
        full_name: fullName,
        phone: phone,
        address: address,
        city: city,
        postal_code: postalCode,
        updated_at: new Date().toISOString()
      });
    
    if (customerError) {
      console.warn('Customer update warning:', customerError);
    }
    
    // Calculate total
    const total = cart.reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.qty), 0);
    
    // Create order in database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: currentUser.id,
        customer_email: email,
        customer_name: fullName,
        customer_phone: phone,
        customer_address: address,
        customer_city: city,
        customer_postal_code: postalCode,
        items: cart,
        total_amount: total,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (orderError) {
      throw new Error('Failed to create order: ' + orderError.message);
    }
    
    const order = orderData;
    
    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();
    
    // Show success page
    document.querySelector('main').innerHTML = `
      <div style="text-align: center; padding: 4rem 2rem; max-width: 600px; margin: 0 auto;">
        <div style="width: 80px; height: 80px; background: var(--sage); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; font-size: 3rem;">
          ✓
        </div>
        <h1 style="color: var(--sage); margin-bottom: 1rem; font-family: 'Cormorant Garamond', serif;">Order Placed Successfully!</h1>
        <p style="color: var(--text-mid); font-size: 1.1rem; margin-bottom: 2rem;">
          Thank you for your order, ${fullName}!<br/>
          Order ID: #${order.id}
        </p>
        <div style="background: var(--sage-light); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; text-align: left;">
          <h3 style="margin-bottom: 1rem;">Order Details</h3>
          <p><strong>Total:</strong> KSh ${total.toFixed(2)}</p>
          <p><strong>Payment:</strong> ${paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}</p>
          <p><strong>Shipping to:</strong> ${address}, ${city}</p>
        </div>
        <p style="color: var(--text-mid); margin-bottom: 2rem;">
          We've sent a confirmation email to <strong>${email}</strong><br/>
          Your order will be delivered within 3-5 business days.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <a href="shop.html" class="btn">Continue Shopping</a>
          <a href="index.html" class="btn-sm" style="background: transparent; color: var(--sage); border: 2px solid var(--sage);">Go to Homepage</a>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('Checkout error:', error);
    alert(error.message || 'Order failed. Please try again.');
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
  }
});

// ===== Initialize =====
updateCartCount();
checkAuth().then(authenticated => {
  if (authenticated) {
    renderOrderSummary();
  }
});
