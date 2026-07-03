// Supabase Configuration
const SUPABASE_URL = 'https://bgmutbfurqlgyszbkyxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXV0YmZ1cnFsZ3lzemJreXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ2NzksImV4cCI6MjA5NzcwMDY3OX0.iBkb1zSMcsfBrT0lqr53uDcjBSJX3yO87wSgPmb9ArE';

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== Product Data =====
const products = [
  {
    id: 1,
    name: "Coastal Drift",
    price: 89.99,
    image: "images/shoe1.jpg",
    category: "Beach"
  },
  {
    id: 2,
    name: "Tide Walker",
    price: 74.99,
    image: "images/shoe2.jpg",
    category: "Beach"
  },
  {
    id: 3,
    name: "Palm Stride",
    price: 99.99,
    image: "images/shoe3.jpg",
    category: "Casual"
  },
  {
    id: 4,
    name: "Dune Runner",
    price: 119.99,
    image: "images/shoe4.jpg",
    category: "Trail"
  }
];

const bestSellers = [
  {
    id: 5,
    name: "Lagoon Sandal",
    price: 64.99,
    image: "images/shoe1.jpg",
    category: "Beach",
    badge: "🔥 Best Seller"
  },
  {
    id: 6,
    name: "Terra Wrap",
    price: 79.99,
    image: "images/shoe2.jpg",
    category: "Trail",
    badge: "⭐ Top Rated"
  },
  {
    id: 7,
    name: "Breeze Slip",
    price: 54.99,
    image: "images/shoe3.jpg",
    category: "Casual",
    badge: "💚 Eco Pick"
  },
  {
    id: 8,
    name: "Mangrove Mule",
    price: 109.99,
    image: "images/shoe4.jpg",
    category: "Eco",
    badge: "🌿 New"
  }
];

// ===== Cart =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = total;
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
}

// ===== Build Card HTML =====
function buildCard(product, badgeText = null) {
  const card = document.createElement("div");
  card.classList.add("card");
  
  // Parse multiple images if available (comma-separated URLs)
  const imageUrl = product.image || 'https://placehold.co/400x210?text=Sandal';
  const images = product.images ? product.images.split(',').map(img => img.trim()).filter(img => img) : [imageUrl];
  
  // If only one image URL is stored, use it for all slides
  const imageArray = images.length > 1 ? images : [imageUrl];
  
  card.innerHTML = `
    ${badgeText ? `
      <div class="card-image-container" data-product-id="${product.id}">
        ${imageArray.map((img, index) => `
          <img src="${img}" 
               alt="${product.name}" 
               class="card-image ${index === 0 ? 'active' : ''}" 
               data-index="${index}"
               onerror="this.src='https://placehold.co/400x210?text=Sandal'" />
        `).join('')}
        <span style="position:absolute;top:10px;left:10px;background:var(--brown-dark);color:var(--beige-mid);font-size:0.72rem;font-weight:700;padding:4px 10px;border-radius:20px;z-index:10;">${badgeText}</span>
        ${imageArray.length > 1 ? `
          <div class="image-dots">
            ${imageArray.map((_, index) => `
              <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    ` : `
      <div class="card-image-container" data-product-id="${product.id}">
        ${imageArray.map((img, index) => `
          <img src="${img}" 
               alt="${product.name}" 
               class="card-image ${index === 0 ? 'active' : ''}" 
               data-index="${index}"
               onerror="this.src='https://placehold.co/400x210?text=Sandal'" />
        `).join('')}
        ${imageArray.length > 1 ? `
          <div class="image-dots">
            ${imageArray.map((_, index) => `
              <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `}
    <div class="card-body">
      <span class="category-tag">${product.category}</span>
      <h3>${product.name}</h3>
      <span class="price">KSh ${product.price.toFixed(2)}</span>
      <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
    </div>
  `;
  
  // Add hover slideshow functionality if multiple images
  if (imageArray.length > 1) {
    setTimeout(() => setupImageSlideshow(card, imageArray.length), 0);
  }
  
  return card;
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

// ===== Render Featured Sandals =====
function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  products.forEach(p => grid.appendChild(buildCard(p)));
}

// ===== Render Best Sellers =====
function renderBestSellers() {
  const grid = document.getElementById("best-sellers-grid");
  if (!grid) return;
  bestSellers.forEach(p => grid.appendChild(buildCard(p, p.badge)));
}

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
      <img src="${product.image}" alt="${product.name}" 
           onerror="this.src='https://placehold.co/200x150?text=Shoe'" 
           style="max-width: 200px; border-radius: 8px; margin-bottom: 1rem;" />
      <p style="font-size: 1.2rem; color: var(--sage); font-weight: 600; margin-bottom: 1.5rem;">
        KSh ${product.price.toFixed(2)}
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
          KSh ${product.price.toFixed(2)}
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
  const pricePerUnit = product.price;

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

  document.getElementById("confirm-add").addEventListener("click", () => {
    // Validate size selection
    if (!selectedSize) {
      document.getElementById('size-error').textContent = 'Please select a size';
      return;
    }

    addToCartWithQuantity(product, currentQty, selectedSize);
    modal.remove();
    
    // Show success feedback
    const btn = document.querySelector(`button[data-id="${product.id}"]`);
    if (btn) {
      btn.textContent = "Added ✓";
      btn.style.background = "var(--green-mid)";
      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.style.background = "";
      }, 1500);
    }
  });

  updateDisplay();
}

function addToCartWithQuantity(product, quantity, size = null) {
  const cart = getCart();
  // Find cart item with matching id AND size
  const existing = cart.find(i => i.id === product.id && i.selectedSize === size);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + quantity;
  } else {
    cart.push({ ...product, quantity: quantity, selectedSize: size });
  }
  saveCart(cart);
  updateCartCount();
}

// ===== Event Delegation for Add to Cart =====
document.addEventListener("click", async function (e) {
  if (!e.target.classList.contains("add-to-cart")) return;

  const id = parseInt(e.target.dataset.id);
  const allProducts = [...products, ...bestSellers];
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  // Check inventory from Supabase if id exists in database
  try {
    const { data: inventoryData, error } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', id)
      .single();
    
    if (!error && inventoryData) {
      const availableQty = inventoryData.quantity || 0;
      const cart = getCart();
      const cartItem = cart.find(i => i.id === id);
      const currentCartQty = cartItem ? (cartItem.quantity || 1) : 0;
      const remainingQty = availableQty - currentCartQty;
      
      if (remainingQty <= 0) {
        alert('Sorry, this item is out of stock.');
        return;
      }
      
      // Open quantity modal
      openQuantityModal(product, remainingQty);
    } else {
      // Product not in database, use default quantity modal with limit of 99
      openQuantityModal(product, 99);
    }
  } catch (err) {
    console.error('Error checking inventory:', err);
    // Fallback: open modal with default limit
    openQuantityModal(product, 99);
  }
});

// ===== Init =====
updateCartCount();
renderProducts();
renderBestSellers();
