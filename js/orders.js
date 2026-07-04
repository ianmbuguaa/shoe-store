// Orders Page - Customer view of their own orders
import { supabase, getCurrentUser } from './supabase-client.js';

let currentUser = null;

// ===== Update Cart Count =====
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById("cart-count").textContent = total;
}

// ===== Check Authentication =====
async function checkAuth() {
  currentUser = await getCurrentUser();
  
  if (!currentUser) {
    // Not logged in - redirect to auth
    window.location.href = 'auth.html?returnTo=orders.html';
    return false;
  }
  
  // Update auth link to show user email
  const authLink = document.getElementById('auth-link');
  authLink.textContent = currentUser.email;
  authLink.href = '#';
  authLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Sign out?')) {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    }
  });
  
  return true;
}

// ===== Load Orders =====
async function loadOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading orders:', error);
    showError('Failed to load orders');
    return;
  }
  
  renderOrders(orders || []);
}

// ===== Render Orders =====
function renderOrders(orders) {
  const container = document.getElementById('orders-container');
  const loading = document.getElementById('loading');
  
  if (loading) loading.remove();
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: var(--off-white); border-radius: 12px;">
        <p style="font-size: 1.2rem; color: var(--text-mid); margin-bottom: 1rem;">No orders yet</p>
        <p style="color: var(--text-light); margin-bottom: 2rem;">Start shopping to place your first order!</p>
        <a href="shop.html" class="btn">Browse Products</a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = orders.map(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    const itemCount = items.length;
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const statusColors = {
      pending: { bg: '#fff3cd', color: '#856404', text: 'Pending' },
      processing: { bg: '#d1ecf1', color: '#0c5460', text: 'Processing' },
      completed: { bg: '#d4edda', color: '#155724', text: 'Completed' },
      cancelled: { bg: '#f8d7da', color: '#721c24', text: 'Cancelled' }
    };
    
    const status = statusColors[order.status] || statusColors.pending;
    
    return `
      <div style="background: white; border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
          <div>
            <h3 style="margin: 0 0 0.5rem 0; font-family: 'Cormorant Garamond', serif; font-size: 1.4rem;">
              Order #${order.id.substring(0, 8).toUpperCase()}
            </h3>
            <p style="color: var(--text-mid); margin: 0; font-size: 0.9rem;">Placed on ${orderDate}</p>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; background: ${status.bg}; color: ${status.color};">
              ${status.text}
            </span>
            <p style="margin: 0.5rem 0 0 0; font-size: 1.2rem; font-weight: 700; color: var(--sage);">
              KSh ${parseFloat(order.total_amount).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 0.95rem; font-weight: 600;">Items (${itemCount})</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${items.map(item => `
              <div style="display: flex; gap: 1rem; align-items: center;">
                <img src="${item.image_url || item.image || 'https://placehold.co/60x60?text=Shoe'}" 
                     alt="${item.name}"
                     onerror="this.src='https://placehold.co/60x60?text=Shoe'"
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border);" />
                <div style="flex: 1;">
                  <p style="margin: 0 0 0.25rem 0; font-weight: 600;">${item.name}</p>
                  <p style="margin: 0; font-size: 0.85rem; color: var(--text-mid);">
                    Size: ${item.selectedSize || 'N/A'} • Qty: ${item.qty}
                  </p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-weight: 600; color: var(--sage);">
                    KSh ${(parseFloat(item.price) * item.qty).toFixed(2)}
                  </p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="background: var(--off-white); padding: 1rem; border-radius: 8px;">
          <p style="margin: 0 0 0.25rem 0; font-size: 0.85rem; color: var(--text-mid);">Shipping Address</p>
          <p style="margin: 0; font-weight: 500;">
            ${order.customer_address || 'N/A'}, ${order.customer_city || ''} ${order.customer_postal_code || ''}
          </p>
        </div>
      </div>
    `;
  }).join('');
}

// ===== Show Error =====
function showError(message) {
  const container = document.getElementById('orders-container');
  container.innerHTML = `
    <div style="text-align: center; padding: 3rem; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 12px; color: #721c24;">
      <p style="font-size: 1.1rem; margin: 0;">${message}</p>
    </div>
  `;
}

// ===== Initialize =====
updateCartCount();
checkAuth().then(authenticated => {
  if (authenticated) {
    loadOrders();
  }
});
