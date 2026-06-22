// ===== Product Data =====
const products = [
  {
    id: 1,
    name: "Akala 1",
    price: 129.99,
    image: "images/shoe1.jpg",
    category: "Running"
  },
  {
    id: 2,
    name: "Urban Stride",
    price: 89.99,
    image: "images/shoe2.jpg",
    category: "Casual"
  },
  {
    id: 3,
    name: "Classic Court",
    price: 74.99,
    image: "images/shoe3.jpg",
    category: "Sneakers"
  },
  {
    id: 4,
    name: "Trail Blazer X",
    price: 149.99,
    image: "images/shoe4.jpg",
    category: "Outdoor"
  }
];

// ===== Cart =====
let cartCount = 0;

function updateCartCount() {
  document.getElementById("cart-count").textContent = cartCount;
}

// ===== Render Products =====
function renderProducts() {
  const grid = document.getElementById("product-grid");

  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x200?text=Shoe'" />
      <div class="card-body">
        <h3>${product.name}</h3>
        <span class="price">$${product.price.toFixed(2)}</span>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ===== Event Delegation for Add to Cart =====
document.getElementById("product-grid").addEventListener("click", function (e) {
  if (e.target.classList.contains("add-to-cart")) {
    const id = e.target.dataset.id;
    const product = products.find(p => p.id === parseInt(id));

    cartCount++;
    updateCartCount();

    e.target.textContent = "Added ✓";
    e.target.style.background = "#28a745";

    setTimeout(() => {
      e.target.textContent = "Add to Cart";
      e.target.style.background = "";
    }, 1500);

    console.log(`Added to cart: ${product.name}`);
  }
});

// ===== Init =====
renderProducts();
