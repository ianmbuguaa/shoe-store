// ===== Shared Product Data =====
const products = [
  { id: 1, name: "Akala 1",      price: 129.99, image: "images/shoe1.jpg", category: "Running"  },
  { id: 2, name: "Urban Stride", price: 89.99,  image: "images/shoe2.jpg", category: "Casual"   },
  { id: 3, name: "Classic Court",price: 74.99,  image: "images/shoe3.jpg", category: "Sneakers" },
  { id: 4, name: "Trail Blazer X",price: 149.99,image: "images/shoe4.jpg", category: "Outdoor"  }
];

// ===== Cart (localStorage) =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty++;
  } else {
    const product = products.find(p => p.id === id);
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
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
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x200?text=Shoe'" />
      <div class="card-body">
        <span class="category-tag">${product.category}</span>
        <h3>${product.name}</h3>
        <span class="price">$${product.price.toFixed(2)}</span>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
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

// ===== Add to Cart via delegation =====
document.getElementById("product-grid").addEventListener("click", function (e) {
  if (e.target.classList.contains("add-to-cart")) {
    const id = parseInt(e.target.dataset.id);
    addToCart(id);
    e.target.textContent = "Added ✓";
    e.target.style.background = "#28a745";
    setTimeout(() => {
      e.target.textContent = "Add to Cart";
      e.target.style.background = "";
    }, 1500);
  }
});

// ===== Init =====
updateCartCount();
renderProducts(products);
