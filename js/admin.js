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
      <td>KSh ${parseFloat(p.price).toFixed(2)}</td>
      <td>${p.size || 'N/A'}</td>
      <td>${p.quantity !== undefined ? p.quantity : 'N/A'}</td>
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
  
  // Parse existing images if available
  const existingImages = product && product.images ? product.images.split(',').map(img => img.trim()).filter(img => img) : [];
  
  modal.innerHTML = `
    <div class="modal" style="max-width: 600px;">
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
      <label>Size (EU)<input id="m-size" type="text" placeholder="e.g., 39, 40, 41, 42, 43" value="${product ? (product.size || "") : ""}" /></label>
      <label>Quantity<input id="m-quantity" type="number" min="0" value="${product ? (product.quantity || 0) : 0}" /></label>
      
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
    const size     = document.getElementById("m-size").value.trim();
    const quantity = parseInt(document.getElementById("m-quantity").value);
    const imagesUrls = document.getElementById("m-images-urls").value.trim();

    if (!name || isNaN(price)) {
      alert("Please fill in all required fields.");
      return;
    }

    if (isNaN(quantity) || quantity < 0) {
      alert("Please enter a valid quantity (0 or more).");
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
          size: size || null,
          quantity,
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
      
      Object.assign(product, { name, category, price, size, quantity, image_url: primaryImageUrl, images: imagesUrls });
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert([{ 
          name, 
          category, 
          price, 
          size: size || null, 
          quantity, 
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
});
