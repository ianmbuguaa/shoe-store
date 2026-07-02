// ===== About Page – cart count sync =====
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = total;
}

updateCartCount();
