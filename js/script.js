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
  card.innerHTML = `
    ${badgeText ? `<div style="position:relative;">
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x210?text=Sandal'" />
      <span style="position:absolute;top:10px;left:10px;background:var(--brown-dark);color:var(--beige-mid);font-size:0.72rem;font-weight:700;padding:4px 10px;border-radius:20px;">${badgeText}</span>
    </div>` : `<img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x210?text=Sandal'" />`}
    <div class="card-body">
      <span class="category-tag">${product.category}</span>
      <h3>${product.name}</h3>
      <span class="price">$${product.price.toFixed(2)}</span>
      <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
    </div>
  `;
  return card;
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

// ===== Event Delegation for Add to Cart =====
document.addEventListener("click", function (e) {
  if (!e.target.classList.contains("add-to-cart")) return;

  const id = parseInt(e.target.dataset.id);
  const allProducts = [...products, ...bestSellers];
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  addToCart(product);

  e.target.textContent = "Added ✓";
  e.target.style.background = "var(--green-mid)";

  setTimeout(() => {
    e.target.textContent = "Add to Cart";
    e.target.style.background = "";
  }, 1500);
});

// ===== Init =====
updateCartCount();
renderProducts();
renderBestSellers();
