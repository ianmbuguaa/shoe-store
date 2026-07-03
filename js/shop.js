// Supabase Configuration
const SUPABASE_URL = 'https://bgmutbfurqlgyszbkyxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXV0YmZ1cnFsZ3lzemJreXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ2NzksImV4cCI6MjA5NzcwMDY3OX0.iBkb1zSMcsfBrT0lqr53uDcjBSJX3yO87wSgPmb9ArE';

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== Product Data (load from Supabase) =====
let products = [];

async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });
  
  if (error) {
    console.error('Error loading products:', error);
    // Fallback to empty array or show error message
    products = [];
  } else {
    products = data || [];
  }
  
  renderProducts(getFiltered());
}

// ===== Cart (localStorage) =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

async function addToCart(id) {
  // Check current inventory before adding
  const { data: product, error } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', id)
    .single();
  
  if (error) {
    alert('Error checking inventory. Please try again.');
    return false;
  }
  
  const availableQty = product.quantity || 0;
  const cart = getCart();
  const cartItem = cart.find(i => i.id === id);
  const currentCartQty = cartItem ? cartItem.qty : 0;
  
  // Check if adding one more would exceed available quantity
  if (currentCartQty >= availableQty) {
    alert('Sorry, this item is out of stock or you have reached the maximum available quantity.');
    return false;
  }
  
  if (cartItem) {
    cartItem.qty++;
  } else {
    const productData = products.find(p => p.id === id);
    cart.push({ ...productData, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  return true;
}

function updateCartCount() {
  const total = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.getElementById("cart-count").textContent = total;
}

// ===== Render =====
function renderProducts(list) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = "<p class='empty-state'>No products match your search.</p>";
    return;
  }

  list.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("card");
    
    const quantity = product.quantity || 0;
    const isOutOfStock = quantity <= 0;
    
    // Add out-of-stock class if needed
    if (isOutOfStock) {
      card.classList.add("out-of-stock");
    }
    
    // Parse multiple images if available (comma-separated URLs)
    const imageUrl = product.image_url || product.image || 'https://placehold.co/400x200?text=Shoe';
    const images = product.images ? product.images.split(',').map(img => img.trim()).filter(img => img) : [imageUrl];
    
    // If only one image URL is stored, use it for all slides
    const imageArray = images.length > 1 ? images : [imageUrl];
    
    card.innerHTML = `
      <div class="card-image-container" data-product-id="${product.id}">
        ${imageArray.map((img, index) => `
          <img src="${img}" 
               alt="${product.name}" 
               class="card-image ${index === 0 ? 'active' : ''}" 
               data-index="${index}"
               onerror="this.src='https://placehold.co/400x200?text=Shoe'" />
        `).join('')}
        ${imageArray.length > 1 ? `
          <div class="image-dots">
            ${imageArray.map((_, index) => `
              <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="card-body">
        <span class="category-tag">${product.category}</span>
        <h3>${product.name}</h3>
        <span class="price">KSh ${parseFloat(product.price).toFixed(2)}</span>
        ${isOutOfStock 
          ? '<button class="add-to-cart" disabled style="background: #999; cursor: not-allowed;">Out of Stock</button>'
          : `<button class="add-to-cart" data-id="${product.id}">Add to Cart</button>`
        }
        ${quantity > 0 && quantity <= 10 
          ? `<p style="font-size: 0.8rem; color: #e94560; margin-top: 0.5rem;">Only ${quantity} left!</p>`
          : ''
        }
      </div>
    `;
    grid.appendChild(card);
    
    // Add hover slideshow functionality if multiple images
    if (imageArray.length > 1) {
      setupImageSlideshow(card, imageArray.length);
    }
  });
}

// ===== Image Slideshow on Hover =====
function setupImageSlideshow(card, imageCount) {
  const container = card.querySelector('.card-image-container');
  const images = container.querySelectorAll('.card-image');
  const dots = container.querySelectorAll('.dot');
  let currentIndex = 0;
  let interval = null;
  
  function showImage(index) {
    images.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentIndex = index;
  }
  
  function nextImage() {
    const nextIndex = (currentIndex + 1) % imageCount;
    showImage(nextIndex);
  }
  
  // Start slideshow on hover
  card.addEventListener('mouseenter', () => {
    interval = setInterval(nextImage, 1000); // Change image every 1 second
  });
  
  // Stop slideshow on mouse leave and reset to first image
  card.addEventListener('mouseleave', () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    showImage(0); // Reset to first image
  });
  
  // Click on dots to change image
  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      showImage(index);
      // Restart interval
      if (interval) {
        clearInterval(interval);
        interval = setInterval(nextImage, 1000);
      }
    });
  });
}

// ===== Filter =====
function getFiltered() {
  const query = document.getElementById("search").value.toLowerCase();
  const category = document.getElementById("category-filter").value;
  return products.filter(p => {
    const matchName = p.name.toLowerCase().includes(query);
    const matchCat  = category === "all" || p.category === category;
    return matchName && matchCat;
  });
}

document.getElementById("search").addEventListener("input", () => renderProducts(getFiltered()));
document.getElementById("category-filter").addEventListener("change", () => renderProducts(getFiltered()));

// ===== Quantity Modal =====
function openQuantityModal(product, availableQty) {
  const existing = document.getElementById("quantity-modal");
  if (existing) existing.remove();

  // Parse available sizes from product.size field, or use default European sizes
  let availableSizes = product.size ? product.size.split(',').map(s => s.trim()).filter(s => s) : [];
  
  // If no sizes defined, use common European sizes
  if (availableSizes.length === 0) {
    availableSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  }

  const modal = document.createElement("div");
  modal.id = "quantity-modal";
  modal.classList.add("modal-overlay");
  modal.innerHTML = `
    <div class="modal" style="max-width: 450px; text-align: center;">
      <h3 style="margin-bottom: 1rem;">${product.name}</h3>
      <img src="${product.image_url || product.image}" alt="${product.name}" 
           onerror="this.src='https://placehold.co/200x150?text=Shoe'" 
           style="max-width: 200px; border-radius: 8px; margin-bottom: 1rem;" />
      <p style="font-size: 1.2rem; color: var(--sage); font-weight: 600; margin-bottom: 1.5rem;">
        KSh ${parseFloat(product.price).toFixed(2)}
      </p>
      
      <div style="margin: 1.5rem 0;">
        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-dark);">
          Select Size (EU)
        </label>
        <div id="size-selector" style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; max-width: 380px; margin: 0 auto;">
          ${availableSizes.map(size => `
            <button type="button" class="size-option" data-size="${size}" 
                    style="padding: 0.6rem 1rem; border: 2px solid var(--border); background: white; 
                           color: var(--text-dark); border-radius: 6px; cursor: pointer; font-weight: 600; 
                           font-size: 0.9rem; transition: all 0.2s; min-width: 55px;">
              ${size}
            </button>
          `).join('')}
        </div>
        <p id="size-error" style="font-size: 0.85rem; color: #e94560; margin-top: 0.5rem; min-height: 1.2rem;"></p>
      </div>
      
      <div style="margin: 1.5rem 0;">
        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-dark);">
          Select Quantity
        </label>
        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
          <button type="button" class="qty-modal-btn" id="qty-decrease" style="font-size: 1.5rem; width: 40px; height: 40px; border: 2px solid var(--sage); background: white; color: var(--sage); border-radius: 50%; cursor: pointer; font-weight: bold;">−</button>
          <span id="qty-display" style="font-size: 1.8rem; font-weight: 600; min-width: 50px; color: var(--text-dark);">1</span>
          <button type="button" class="qty-modal-btn" id="qty-increase" style="font-size: 1.5rem; width: 40px; height: 40px; border: 2px solid var(--sage); background: white; color: var(--sage); border-radius: 50%; cursor: pointer; font-weight: bold;">+</button>
        </div>
        ${availableQty <= 10 ? `<p style="font-size: 0.85rem; color: #e94560; margin-top: 0.75rem;">Only ${availableQty} available</p>` : ''}
      </div>
      
      <div style="margin: 1.5rem 0; padding: 1rem; background: var(--sage-light); border-radius: 8px;">
        <p style="font-size: 0.9rem; color: var(--text-mid); margin-bottom: 0.25rem;">Total Price</p>
        <p id="total-price" style="font-size: 1.5rem; font-weight: 700; color: var(--sage);">
          KSh ${parseFloat(product.price).toFixed(2)}
        </p>
      </div>
      
      <div class="modal-actions" style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
        <button class="btn" id="confirm-add" style="flex: 1;">Add to Cart</button>
        <button class="btn-sm" id="cancel-add" style="flex: 0 0 auto;">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  let currentQty = 1;
  let selectedSize = null;
  const maxQty = availableQty;
  const pricePerUnit = parseFloat(product.price);

  // Size selection handler
  const sizeButtons = document.querySelectorAll('.size-option');
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove selection from all buttons
      sizeButtons.forEach(b => {
        b.style.borderColor = 'var(--border)';
        b.style.background = 'white';
        b.style.color = 'var(--text-dark)';
      });
      // Highlight selected button
      btn.style.borderColor = 'var(--sage)';
      btn.style.background = 'var(--sage)';
      btn.style.color = 'white';
      selectedSize = btn.dataset.size;
      document.getElementById('size-error').textContent = '';
    });
  });

  function updateDisplay() {
    document.getElementById("qty-display").textContent = currentQty;
    document.getElementById("total-price").textContent = `KSh ${(pricePerUnit * currentQty).toFixed(2)}`;
    document.getElementById("qty-decrease").disabled = currentQty <= 1;
    document.getElementById("qty-increase").disabled = currentQty >= maxQty;
  }

  document.getElementById("qty-decrease").addEventListener("click", () => {
    if (currentQty > 1) {
      currentQty--;
      updateDisplay();
    }
  });

  document.getElementById("qty-increase").addEventListener("click", () => {
    if (currentQty < maxQty) {
      currentQty++;
      updateDisplay();
    }
  });

  document.getElementById("cancel-add").addEventListener("click", () => modal.remove());

  document.getElementById("confirm-add").addEventListener("click", async () => {
    // Validate size selection
    if (!selectedSize) {
      document.getElementById('size-error').textContent = 'Please select a size';
      return;
    }

    const confirmBtn = document.getElementById("confirm-add");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Adding...";

    const success = await addToCartWithQuantity(product.id, currentQty, selectedSize);
    
    if (success) {
      modal.remove();
      // Show success feedback on the original button
      const btn = document.querySelector(`button[data-id="${product.id}"]`);
      if (btn) {
        btn.textContent = "Added ✓";
        btn.style.background = "#28a745";
        setTimeout(() => {
          btn.textContent = "Add to Cart";
          btn.style.background = "";
        }, 1500);
      }
    } else {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Add to Cart";
    }
  });

  updateDisplay();
}

// ===== Add to Cart with Quantity =====
async function addToCartWithQuantity(id, quantity, size = null) {
  // Check current inventory before adding
  const { data: product, error } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', id)
    .single();
  
  if (error) {
    alert('Error checking inventory. Please try again.');
    return false;
  }
  
  const availableQty = product.quantity || 0;
  const cart = getCart();
  
  // Find cart item with matching id AND size
  const cartItem = cart.find(i => i.id === id && i.selectedSize === size);
  const currentCartQty = cartItem ? cartItem.qty : 0;
  
  // Check if adding this quantity would exceed available quantity
  if (currentCartQty + quantity > availableQty) {
    alert('Sorry, insufficient stock available.');
    return false;
  }
  
  if (cartItem) {
    cartItem.qty += quantity;
  } else {
    const productData = products.find(p => p.id === id);
    cart.push({ ...productData, qty: quantity, selectedSize: size });
  }
  saveCart(cart);
  updateCartCount();
  return true;
}

// ===== Add to Cart via delegation =====
document.getElementById("product-grid").addEventListener("click", async function (e) {
  if (e.target.classList.contains("add-to-cart") && !e.target.disabled) {
    const id = parseInt(e.target.dataset.id);
    const product = products.find(p => p.id === id);
    
    if (!product) return;
    
    // Fetch current inventory
    const { data: inventoryData, error } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', id)
      .single();
    
    if (error) {
      alert('Error loading product details. Please try again.');
      return;
    }
    
    const availableQty = inventoryData.quantity || 0;
    const cart = getCart();
    const cartItem = cart.find(i => i.id === id);
    const currentCartQty = cartItem ? cartItem.qty : 0;
    const remainingQty = availableQty - currentCartQty;
    
    if (remainingQty <= 0) {
      alert('Sorry, this item is out of stock or you have reached the maximum available quantity.');
      return;
    }
    
    // Open quantity modal
    openQuantityModal(product, remainingQty);
  }
});

// ===== Init =====
updateCartCount();
loadProducts();
