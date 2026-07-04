// Supabase Configuration
const SUPABASE_URL = 'https://bgmutbfurqlgyszbkyxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXV0YmZ1cnFsZ3lzemJreXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ2NzksImV4cCI6MjA5NzcwMDY3OX0.iBkb1zSMcsfBrT0lqr53uDcjBSJX3yO87wSgPmb9ArE';

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// ===== Authentication Check =====
async function checkAuth() {
  console.log('Starting auth check...');
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.log('No session found - redirecting to login');
    // No valid session - redirect to login
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = session.user;
  console.log('Current user:', currentUser.email, 'ID:', currentUser.id);
  
  // Check if user has admin role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();
  
  console.log('Profile query result:', { profile, error });
  
  if (error) {
    console.error('Error fetching profile:', error);
    
    // Profile doesn't exist yet - create it with admin role for this user
    if (error.code === 'PGRST116') {
      console.log('Profile not found, creating admin profile...');
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: currentUser.id, role: 'admin', full_name: 'Admin User' }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        await supabase.auth.signOut();
        alert('Error creating admin profile. Please contact support.');
        window.location.href = 'login.html';
        return;
      }
      
      console.log('Admin profile created:', newProfile);
    } else {
      await supabase.auth.signOut();
      alert('Access denied. Admin privileges required.');
      window.location.href = 'login.html';
      return;
    }
  } else if (!profile || profile.role !== 'admin') {
    console.log('User is not an admin. Role:', profile?.role);
    // User is not an admin - sign out and redirect
    await supabase.auth.signOut();
    alert('Access denied. Admin privileges required.');
    window.location.href = 'login.html';
    return;
  }
  
  console.log('Auth check passed! User is admin.');
  document.getElementById('admin-email').textContent = currentUser.email;
  
  // Set up logout button handler
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      console.log('Logout button clicked');
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Logout error:', error);
          alert('Error logging out: ' + error.message);
        } else {
          console.log('Logout successful, redirecting...');
          window.location.href = 'login.html';
        }
      } catch (err) {
        console.error('Logout exception:', err);
        alert('Error logging out. Please try again.');
      }
    });
  } else {
    console.error('Logout button not found!');
  }
  
  // Set up auth state listener for session changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // User signed out - redirect to login
      console.log('Auth state: SIGNED_OUT, redirecting to login');
      window.location.href = 'login.html';
    } else if (event === 'TOKEN_REFRESHED') {
      // Session refreshed successfully
      console.log('Session refreshed');
    }
  });
}

// ===== Product Data (load from Supabase) =====
let products = [];
let orders = [];

async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });
  
  if (error) {
    console.error('Error loading products:', error);
    // Fallback to localStorage
    products = JSON.parse(localStorage.getItem("admin_products") || "[]");
  } else {
    products = data || [];
  }
  
  renderTable();
}

async function loadOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading orders:', error);
    orders = [];
  } else {
    orders = data || [];
  }
  
  renderOrdersTable();
}

async function saveProducts() {
  // Keep localStorage sync for backward compatibility
  localStorage.setItem("admin_products", JSON.stringify(products));
}

// ===== Sidebar Navigation =====
document.querySelectorAll(".admin-sidebar a").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const target = this.getAttribute("href").replace("#", "");
    document.querySelectorAll(".admin-panel").forEach(p => p.style.display = "none");
    document.getElementById(target).style.display = "block";
    document.querySelectorAll(".admin-sidebar a").forEach(l => l.classList.remove("active"));
    this.classList.add("active");
  });
});

// ===== Render Products Table =====
function renderTable() {
  const tbody = document.getElementById("products-tbody");
  tbody.innerHTML = products.map(p => {
    // Calculate total stock and format sizes
    let sizeDisplay = 'N/A';
    let totalStock = 0;
    
    if (p.size_quantities && typeof p.size_quantities === 'object') {
      const sizeEntries = Object.entries(p.size_quantities);
      if (sizeEntries.length > 0) {
        sizeDisplay = sizeEntries
          .map(([size, qty]) => `${size}: ${qty}`)
          .join(', ');
        totalStock = sizeEntries.reduce((sum, [_, qty]) => sum + parseInt(qty || 0), 0);
      }
    } else if (p.size || p.quantity !== undefined) {
      // Fallback for old schema (migration compatibility)
      sizeDisplay = `${p.size || 'N/A'}: ${p.quantity || 0}`;
      totalStock = p.quantity || 0;
    }
    
    return `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>KSh ${parseFloat(p.price).toFixed(2)}</td>
        <td style="font-size: 0.85rem;">${sizeDisplay}</td>
        <td><strong>${totalStock}</strong></td>
        <td>
          <button class="btn-sm edit-btn" data-id="${p.id}">Edit</button>
          <button class="btn-sm delete-btn danger" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

// ===== Render Orders Table =====
function renderOrdersTable() {
  const ordersPanel = document.getElementById('orders');
  
  if (orders.length === 0) {
    ordersPanel.innerHTML = `
      <div class="panel-header">
        <h2>Orders</h2>
      </div>
      <p class="empty-state">No orders yet.</p>
    `;
    return;
  }
  
  ordersPanel.innerHTML = `
    <div class="panel-header">
      <h2>Orders (${orders.length})</h2>
    </div>
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Email</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => {
          const itemCount = Array.isArray(order.items) ? order.items.length : 0;
          const orderDate = new Date(order.created_at).toLocaleDateString();
          const statusColors = {
            pending: 'background: #ffc107; color: #000',
            processing: 'background: #2196F3; color: #fff',
            completed: 'background: #4CAF50; color: #fff',
            cancelled: 'background: #f44336; color: #fff'
          };
          
          return `
            <tr>
              <td><strong>#${order.id.substring(0, 8)}</strong></td>
              <td>${order.customer_name}</td>
              <td style="font-size: 0.85rem;">${order.customer_email}</td>
              <td>${itemCount} item${itemCount !== 1 ? 's' : ''}</td>
              <td><strong>KSh ${parseFloat(order.total_amount).toFixed(2)}</strong></td>
              <td>
                <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; ${statusColors[order.status] || ''}">
                  ${order.status}
                </span>
              </td>
              <td style="font-size: 0.85rem;">${orderDate}</td>
              <td>
                <button class="btn-sm view-order-btn" data-order-id="${order.id}">View</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
  
  // Add event listeners for view buttons
  document.querySelectorAll('.view-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.target.dataset.orderId;
      const order = orders.find(o => o.id === orderId);
      if (order) {
        showOrderDetailsModal(order);
      }
    });
  });
}

// ===== Show Order Details Modal =====
function showOrderDetailsModal(order) {
  const modal = document.createElement("div");
  modal.id = "order-details-modal";
  modal.classList.add("modal-overlay");
  
  const items = Array.isArray(order.items) ? order.items : [];
  
  modal.innerHTML = `
    <div class="modal" style="max-width: 700px;">
      <h3>Order Details - #${order.id.substring(0, 8)}</h3>
      
      <div style="background: var(--off-white); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <p style="font-size: 0.85rem; color: var(--text-light); margin: 0;">Customer</p>
            <p style="font-weight: 600; margin: 0.25rem 0 0 0;">${order.customer_name}</p>
          </div>
          <div>
            <p style="font-size: 0.85rem; color: var(--text-light); margin: 0;">Email</p>
            <p style="font-weight: 600; margin: 0.25rem 0 0 0;">${order.customer_email}</p>
          </div>
          <div>
            <p style="font-size: 0.85rem; color: var(--text-light); margin: 0;">Phone</p>
            <p style="font-weight: 600; margin: 0.25rem 0 0 0;">${order.customer_phone || 'N/A'}</p>
          </div>
          <div>
            <p style="font-size: 0.85rem; color: var(--text-light); margin: 0;">Order Date</p>
            <p style="font-weight: 600; margin: 0.25rem 0 0 0;">${new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div style="margin-top: 1rem;">
          <p style="font-size: 0.85rem; color: var(--text-light); margin: 0;">Shipping Address</p>
          <p style="font-weight: 600; margin: 0.25rem 0 0 0;">${order.customer_address || 'N/A'}, ${order.customer_city || ''} ${order.customer_postal_code || ''}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.75rem;">Order Items</h4>
        <table class="admin-table" style="font-size: 0.9rem;">
          <thead>
            <tr>
              <th>Product</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.selectedSize || 'N/A'}</td>
                <td>${item.qty}</td>
                <td>KSh ${parseFloat(item.price).toFixed(2)}</td>
                <td><strong>KSh ${(parseFloat(item.price) * item.qty).toFixed(2)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--sage-light); border-radius: 8px; margin-bottom: 1.5rem;">
        <span style="font-size: 1.1rem; font-weight: 600;">Total Amount:</span>
        <span style="font-size: 1.3rem; font-weight: 700; color: var(--sage);">KSh ${parseFloat(order.total_amount).toFixed(2)}</span>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Update Order Status</label>
        <select id="order-status-select" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px;">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
          <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </div>
      
      <div class="modal-actions">
        <button class="btn" id="update-order-btn">Update Status</button>
        <button class="btn-sm" id="close-order-modal">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('close-order-modal').addEventListener('click', () => modal.remove());
  
  document.getElementById('update-order-btn').addEventListener('click', async () => {
    const newStatus = document.getElementById('order-status-select').value;
    const updateBtn = document.getElementById('update-order-btn');
    
    updateBtn.disabled = true;
    updateBtn.textContent = 'Updating...';
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', order.id);
    
    if (error) {
      alert('Error updating order: ' + error.message);
      updateBtn.disabled = false;
      updateBtn.textContent = 'Update Status';
      return;
    }
    
    // Update local orders array
    const orderIndex = orders.findIndex(o => o.id === order.id);
    if (orderIndex !== -1) {
      orders[orderIndex].status = newStatus;
    }
    
    renderOrdersTable();
    modal.remove();
  });
}

// ===== Delete =====
document.getElementById("products-tbody").addEventListener("click", async function (e) {
  const id = parseInt(e.target.dataset.id);

  if (e.target.classList.contains("delete-btn")) {
    if (confirm("Delete this product?")) {
      // Delete from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error deleting product: ' + error.message);
        return;
      }
      
      products = products.filter(p => p.id !== id);
      await saveProducts();
      renderTable();
    }
  }

  if (e.target.classList.contains("edit-btn")) {
    const product = products.find(p => p.id === id);
    openModal(product);
  }
});

// ===== Image Upload =====
async function uploadImage(file) {
  if (!file) return null;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return null;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return null;
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    alert('Error uploading image: ' + error.message);
    return null;
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);
  
  return urlData.publicUrl;
}

// ===== Modal (Add / Edit) =====
function openModal(product = null) {
  const existing = document.getElementById("product-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "product-modal";
  modal.classList.add("modal-overlay");
  
  // Parse existing images if available
  const existingImages = product && product.images ? product.images.split(',').map(img => img.trim()).filter(img => img) : [];
  
  // Parse existing size-quantities
  let existingSizes = [];
  if (product && product.size_quantities && typeof product.size_quantities === 'object') {
    existingSizes = Object.entries(product.size_quantities).map(([size, quantity]) => ({ size, quantity }));
  } else if (product && product.size) {
    // Fallback for old schema
    existingSizes = [{ size: product.size.split(',')[0].trim(), quantity: product.quantity || 0 }];
  }
  
  modal.innerHTML = `
    <div class="modal" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
      <h3>${product ? "Edit Product" : "Add Product"}</h3>
      <label>Name<input id="m-name" type="text" value="${product ? product.name : ""}" /></label>
      <label>Category
        <select id="m-category">
          ${["Running","Casual","Sneakers","Outdoor","Sandals","Boots"].map(c =>
            `<option ${product && product.category === c ? "selected" : ""}>${c}</option>`
          ).join("")}
        </select>
      </label>
      <label>Price (KSh)<input id="m-price" type="number" step="0.01" value="${product ? product.price : ""}" /></label>
      
      <!-- Size-Quantity Manager -->
      <div style="margin: 1.5rem 0; padding: 1rem; background: var(--off-white); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <label style="margin: 0; font-weight: 600;">Available Sizes & Quantities</label>
          <button type="button" id="add-size-btn" class="btn-sm" style="background: var(--sage);">+ Add Size</button>
        </div>
        <div id="size-quantity-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${existingSizes.length > 0 ? existingSizes.map((item, idx) => createSizeRowHTML(item.size, item.quantity, idx)).join('') : '<p style="color: var(--text-light); font-size: 0.85rem;">No sizes added yet. Click "+ Add Size" to start.</p>'}
        </div>
      </div>
      
      <div style="margin: 1rem 0;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Product Images</label>
        <p style="font-size: 0.8rem; color: var(--text-mid); margin-bottom: 0.75rem;">Upload multiple images (front, side, sole, etc.)</p>
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
          <input id="m-image-file" type="file" accept="image/*" multiple style="flex: 1;" />
          <button type="button" class="btn-sm" id="upload-btn" style="white-space: nowrap;">Upload Images</button>
        </div>
        
        <div id="uploaded-images" style="margin-top: 1rem;">
          ${existingImages.length > 0 ? `
            <p style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">Current Images:</p>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              ${existingImages.map((url, index) => `
                <div style="position: relative;">
                  <img src="${url}" alt="Product ${index + 1}" 
                       style="width: 100px; height: 100px; object-fit: cover; border-radius: 6px; border: 2px solid var(--border);" />
                  <button type="button" class="remove-image-btn" data-url="${url}" 
                          style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; 
                                 border-radius: 50%; background: #e94560; color: white; border: none; 
                                 cursor: pointer; font-size: 0.75rem; font-weight: bold;">✕</button>
                </div>
              `).join('')}
            </div>
          ` : '<p style="font-size: 0.85rem; color: var(--text-light);">No images uploaded yet</p>'}
        </div>
        
        <input id="m-images-urls" type="hidden" value="${existingImages.join(',')}" />
        <p id="upload-status" style="font-size: 0.85rem; color: var(--sage); margin-top: 0.75rem;"></p>
      </div>
      
      <div class="modal-actions">
        <button class="btn" id="m-save">Save Product</button>
        <button class="btn-sm" id="m-cancel">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  let uploadedImageUrls = [...existingImages];
  let sizeRowCounter = existingSizes.length;

  // Helper function to create a size row HTML
  function createSizeRowHTML(size = '', quantity = 0, index = 0) {
    const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    return `
      <div class="size-row" data-index="${index}" style="display: flex; gap: 0.75rem; align-items: center;">
        <select class="size-select" style="flex: 1; padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px;">
          <option value="">Select Size (EU)</option>
          ${sizes.map(s => `<option value="${s}" ${s === size ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <input type="number" class="qty-input" min="0" value="${quantity}" placeholder="Quantity" 
               style="width: 120px; padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px;" />
        <button type="button" class="remove-size-btn" style="padding: 0.5rem 0.75rem; background: #e94560; 
                color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">✕</button>
      </div>
    `;
  }

  // Add size button handler
  document.getElementById('add-size-btn').addEventListener('click', () => {
    const list = document.getElementById('size-quantity-list');
    
    // Remove empty state message if it exists
    const emptyMsg = list.querySelector('p');
    if (emptyMsg) emptyMsg.remove();
    
    const newRow = document.createElement('div');
    newRow.innerHTML = createSizeRowHTML('', 0, sizeRowCounter++);
    list.appendChild(newRow.firstElementChild);
  });

  // Remove size button handler (delegated)
  document.getElementById('size-quantity-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-size-btn')) {
      e.target.closest('.size-row').remove();
      
      // Show empty message if no rows left
      const list = document.getElementById('size-quantity-list');
      if (list.children.length === 0) {
        list.innerHTML = '<p style="color: var(--text-light); font-size: 0.85rem;">No sizes added yet. Click "+ Add Size" to start.</p>';
      }
    }
  });

  // Remove image handler
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-image-btn')) {
      const urlToRemove = e.target.dataset.url;
      uploadedImageUrls = uploadedImageUrls.filter(url => url !== urlToRemove);
      document.getElementById('m-images-urls').value = uploadedImageUrls.join(',');
      e.target.closest('div').remove();
      
      if (uploadedImageUrls.length === 0) {
        document.getElementById('uploaded-images').innerHTML = 
          '<p style="font-size: 0.85rem; color: var(--text-light);">No images uploaded yet</p>';
      }
    }
  });

  // Upload button handler - supports multiple files
  document.getElementById("upload-btn").addEventListener("click", async () => {
    const fileInput = document.getElementById("m-image-file");
    const files = Array.from(fileInput.files);
    const statusEl = document.getElementById("upload-status");
    const uploadBtn = document.getElementById("upload-btn");
    
    if (files.length === 0) {
      statusEl.textContent = 'Please select at least one image';
      statusEl.style.color = '#c33';
      return;
    }
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = `Uploading ${files.length} image(s)...`;
    statusEl.textContent = 'Uploading images...';
    statusEl.style.color = 'var(--sage)';
    
    const uploadPromises = files.map(file => uploadImage(file));
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(url => url !== null);
    
    if (successfulUploads.length > 0) {
      uploadedImageUrls.push(...successfulUploads);
      document.getElementById("m-images-urls").value = uploadedImageUrls.join(',');
      
      // Update display
      const uploadedImagesDiv = document.getElementById('uploaded-images');
      uploadedImagesDiv.innerHTML = `
        <p style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">Current Images:</p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          ${uploadedImageUrls.map((url, index) => `
            <div style="position: relative;">
              <img src="${url}" alt="Product ${index + 1}" 
                   style="width: 100px; height: 100px; object-fit: cover; border-radius: 6px; border: 2px solid var(--border);" />
              <button type="button" class="remove-image-btn" data-url="${url}" 
                      style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; 
                             border-radius: 50%; background: #e94560; color: white; border: none; 
                             cursor: pointer; font-size: 0.75rem; font-weight: bold;">✕</button>
            </div>
          `).join('')}
        </div>
      `;
      
      statusEl.textContent = `✓ ${successfulUploads.length} image(s) uploaded successfully!`;
      statusEl.style.color = 'var(--sage)';
      fileInput.value = ''; // Clear file input
    } else {
      statusEl.textContent = '✗ Upload failed';
      statusEl.style.color = '#c33';
    }
    
    uploadBtn.textContent = 'Upload Images';
    uploadBtn.disabled = false;
  });

  document.getElementById("m-cancel").addEventListener("click", () => modal.remove());

  document.getElementById("m-save").addEventListener("click", async () => {
    const name     = document.getElementById("m-name").value.trim();
    const category = document.getElementById("m-category").value;
    const price    = parseFloat(document.getElementById("m-price").value);
    const imagesUrls = document.getElementById("m-images-urls").value.trim();

    if (!name || isNaN(price)) {
      alert("Please fill in all required fields (Name and Price).");
      return;
    }

    // Collect size-quantity data
    const sizeQuantities = {};
    const sizeRows = document.querySelectorAll('.size-row');
    let hasValidSize = false;
    let hasDuplicateSize = false;
    const seenSizes = new Set();
    
    sizeRows.forEach(row => {
      const size = row.querySelector('.size-select').value.trim();
      const qty = parseInt(row.querySelector('.qty-input').value);
      
      if (size && !isNaN(qty) && qty >= 0) {
        if (seenSizes.has(size)) {
          hasDuplicateSize = true;
        } else {
          sizeQuantities[size] = qty;
          seenSizes.add(size);
          hasValidSize = true;
        }
      }
    });

    if (hasDuplicateSize) {
      alert("Duplicate sizes detected. Please ensure each size is unique.");
      return;
    }

    if (!hasValidSize) {
      alert("Please add at least one valid size with quantity.");
      return;
    }

    const saveBtn = document.getElementById("m-save");
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    // Use first image as primary image_url for backward compatibility
    const primaryImageUrl = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null;

    if (product) {
      // Update existing product
      const { error } = await supabase
        .from('products')
        .update({ 
          name, 
          category, 
          price,
          size_quantities: sizeQuantities, // Store as JSONB
          image_url: primaryImageUrl,
          images: imagesUrls || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);
      
      if (error) {
        alert('Error updating product: ' + error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Product';
        return;
      }
      
      Object.assign(product, { 
        name, 
        category, 
        price, 
        size_quantities: sizeQuantities,
        image_url: primaryImageUrl, 
        images: imagesUrls 
      });
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert([{ 
          name, 
          category, 
          price,
          size_quantities: sizeQuantities, // Store as JSONB
          image_url: primaryImageUrl,
          images: imagesUrls || null
        }])
        .select();
      
      if (error) {
        alert('Error creating product: ' + error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Product';
        return;
      }
      
      products.push(data[0]);
    }

    await saveProducts();
    await loadProducts(); // Reload from database
    modal.remove();
  });
}

document.getElementById("add-product-btn").addEventListener("click", () => openModal());

// ===== Init =====
checkAuth().then(() => {
  loadProducts();
  loadOrders();
});
