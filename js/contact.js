// ===== Contact Page Logic =====

// --- Cart count sync ---
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = total;
}

updateCartCount();

// --- Form validation & submission ---
const form = document.getElementById("contact-form");
const successMsg = document.getElementById("form-success");

const fields = [
  { id: "name",    errorId: "name-error",    label: "Full name"      },
  { id: "email",   errorId: "email-error",   label: "Email address"  },
  { id: "subject", errorId: "subject-error", label: "Subject"        },
  { id: "message", errorId: "message-error", label: "Message"        },
];

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showError(errorId, message) {
  const el = document.getElementById(errorId);
  if (el) el.textContent = message;
}

function clearErrors() {
  fields.forEach(f => showError(f.errorId, ""));
  successMsg.textContent = "";
}

function validateForm() {
  let valid = true;

  fields.forEach(({ id, errorId, label }) => {
    const el = document.getElementById(id);
    const value = el ? el.value.trim() : "";

    if (!value) {
      showError(errorId, `${label} is required.`);
      valid = false;
    } else if (id === "email" && !validateEmail(value)) {
      showError(errorId, "Please enter a valid email address.");
      valid = false;
    }
  });

  return valid;
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();

  if (!validateForm()) return;

  // Simulate sending — replace with a real API call if needed
  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  setTimeout(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
    successMsg.textContent = "✅ Message sent! We'll get back to you within 24 hours.";
  }, 1000);
});
