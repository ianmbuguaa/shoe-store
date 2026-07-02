// Supabase Configuration
const SUPABASE_URL = 'https://bgmutbfurqlgyszbkyxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXV0YmZ1cnFsZ3lzemJreXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ2NzksImV4cCI6MjA5NzcwMDY3OX0.iBkb1zSMcsfBrT0lqr53uDcjBSJX3yO87wSgPmb9ArE';

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// ===== Authentication Check =====
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // No valid session - redirect to login
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = session.user;
  document.getElementById('admin-email').textContent = currentUser.email;
  
  // Set up auth state listener for session changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // User signed out - redirect to login
      window.location.href = 'login.html';
    } else if (event === 'TOKEN_REFRESHED') {
      // Session refreshed successfully
      console.log('Session refreshed');
    }
  });
}

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

// ===== Product Data (load from Supabase) =====
let products = [];

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
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>$${parseFloat(p.price).toFixed(2)}</td>
      <td>
        <button class="btn-sm edit-btn" data-id="${p.id}">Edit</button>
        <button class="btn-sm delete-btn danger" data-id="${p.id}">Delete</button>
      </td>
    </tr>
  `).join("");
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
  modal.innerHTML = `
    <div class="modal" style="max-width: 500px;">
      <h3>${product ? "Edit Product" : "Add Product"}</h3>
      <label>Name<input id="m-name" type="text" value="${product ? product.name : ""}" /></label>
      <label>Category
        <select id="m-category">
          ${["Running","Casual","Sneakers","Outdoor","Sandals","Boots"].map(c =>
            `<option ${product && product.category === c ? "selected" : ""}>${c}</option>`
          ).join("")}
        </select>
      </label>
      <label>Price<input id="m-price" type="number" step="0.01" value="${product ? product.price : ""}" /></label>
      
      <div style="margin: 1rem 0;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Product Image</label>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <input id="m-image-file" type="file" accept="image/*" style="flex: 1;" />
          <button type="button" class="btn-sm" id="upload-btn" style="white-space: nowrap;">Upload Image</button>
        </div>
        ${product && product.image_url ? `
          <div style="margin-top: 1rem;">
            <img src="${product.image_url}" alt="Current" style="max-width: 150px; border-radius: 4px; border: 1px solid var(--border);" />
            <p style="font-size: 0.8rem; color: var(--text-mid); margin-top: 0.5rem;">Current image</p>
          </div>
        ` : ''}
        <input id="m-image-url" type="hidden" value="${product ? (product.image_url || '') : ''}" />
        <p id="upload-status" style="font-size: 0.85rem; color: var(--sage); margin-top: 0.5rem;"></p>
      </div>
      
      <div class="modal-actions">
        <button class="btn" id="m-save">Save Product</button>
        <button class="btn-sm" id="m-cancel">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Upload button handler
  document.getElementById("upload-btn").addEventListener("click", async () => {
    const fileInput = document.getElementById("m-image-file");
    const file = fileInput.files[0];
    const statusEl = document.getElementById("upload-status");
    const uploadBtn = document.getElementById("upload-btn");
    
    if (!file) {
      statusEl.textContent = 'Please select an image first';
      statusEl.style.color = '#c33';
      return;
    }
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    statusEl.textContent = 'Uploading image...';
    statusEl.style.color = 'var(--sage)';
    
    const imageUrl = await uploadImage(file);
    
    if (imageUrl) {
      document.getElementById("m-image-url").value = imageUrl;
      statusEl.textContent = '✓ Image uploaded successfully!';
      statusEl.style.color = 'var(--sage)';
      uploadBtn.textContent = 'Upload Image';
      uploadBtn.disabled = false;
    } else {
      statusEl.textContent = '✗ Upload failed';
      statusEl.style.color = '#c33';
      uploadBtn.textContent = 'Upload Image';
      uploadBtn.disabled = false;
    }
  });

  document.getElementById("m-cancel").addEventListener("click", () => modal.remove());

  document.getElementById("m-save").addEventListener("click", async () => {
    const name     = document.getElementById("m-name").value.trim();
    const category = document.getElementById("m-category").value;
    const price    = parseFloat(document.getElementById("m-price").value);
    const imageUrl = document.getElementById("m-image-url").value.trim();

    if (!name || isNaN(price)) {
      alert("Please fill in all required fields.");
      return;
    }

    const saveBtn = document.getElementById("m-save");
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    if (product) {
      // Update existing product
      const { error } = await supabase
        .from('products')
        .update({ 
          name, 
          category, 
          price, 
          image_url: imageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);
      
      if (error) {
        alert('Error updating product: ' + error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Product';
        return;
      }
      
      Object.assign(product, { name, category, price, image_url: imageUrl });
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert([{ name, category, price, image_url: imageUrl || null }])
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
});
