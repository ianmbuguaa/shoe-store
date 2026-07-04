// Supabase Configuration
const SUPABASE_URL = 'https://bgmutbfurqlgyszbkyxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXV0YmZ1cnFsZ3lzemJreXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ2NzksImV4cCI6MjA5NzcwMDY3OX0.iBkb1zSMcsfBrT0lqr53uDcjBSJX3yO87wSgPmb9ArE';

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById("cart-count").textContent = total;
}

// Show/hide messages
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 5000);
}

function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.style.display = 'block';
}

// Tab switching
document.getElementById('login-tab').addEventListener('click', function() {
  document.getElementById('login-form-container').style.display = 'block';
  document.getElementById('signup-form-container').style.display = 'none';
  this.style.borderBottomColor = 'var(--sage)';
  this.style.color = 'var(--text-dark)';
  document.getElementById('signup-tab').style.borderBottomColor = 'transparent';
  document.getElementById('signup-tab').style.color = 'var(--text-light)';
});

document.getElementById('signup-tab').addEventListener('click', function() {
  document.getElementById('login-form-container').style.display = 'none';
  document.getElementById('signup-form-container').style.display = 'block';
  this.style.borderBottomColor = 'var(--sage)';
  this.style.color = 'var(--text-dark)';
  document.getElementById('login-tab').style.borderBottomColor = 'transparent';
  document.getElementById('login-tab').style.color = 'var(--text-light)';
});

// Check if already logged in
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Already logged in, redirect to checkout
    const returnTo = new URLSearchParams(window.location.search).get('returnTo');
    window.location.href = returnTo || 'checkout.html';
  }
}

// Sign Up Form
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;
  const signupBtn = document.getElementById('signup-btn');
  
  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating account...';
  
  try {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
    
    if (error) throw error;
    
    // Create customer record
    const { error: customerError } = await supabase
      .from('customers')
      .insert([{
        id: data.user.id,
        email,
        full_name: name,
        phone: phone || null
      }]);
    
    if (customerError) {
      console.warn('Customer record creation warning:', customerError);
    }
    
    showSuccess('signup-success', 'Account created successfully! Please check your email to verify your account, then sign in.');
    
    // Clear form
    document.getElementById('signup-form').reset();
    
    // Switch to login tab after 2 seconds
    setTimeout(() => {
      document.getElementById('login-tab').click();
    }, 2000);
    
  } catch (error) {
    console.error('Signup error:', error);
    showError('signup-error', error.message || 'Signup failed. Please try again.');
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = 'Create Account';
  }
});

// Login Form
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const loginBtn = document.getElementById('login-btn');
  
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    showSuccess('login-success', 'Login successful! Redirecting...');
    
    // Redirect to checkout or home
    setTimeout(() => {
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      window.location.href = returnTo || 'checkout.html';
    }, 1000);
    
  } catch (error) {
    console.error('Login error:', error);
    showError('login-error', error.message || 'Login failed. Please check your credentials.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});

// Magic Link Login
document.getElementById('magic-link-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  
  if (!email) {
    showError('login-error', 'Please enter your email address first.');
    return;
  }
  
  const magicBtn = document.getElementById('magic-link-btn');
  magicBtn.disabled = true;
  magicBtn.textContent = 'Sending...';
  
  try {
    const returnTo = new URLSearchParams(window.location.search).get('returnTo');
    const redirectUrl = `${window.location.origin}/${returnTo || 'checkout.html'}`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) throw error;
    
    showSuccess('login-success', 'Magic link sent! Check your email and click the link to sign in.');
    
  } catch (error) {
    showError('login-error', error.message || 'Failed to send magic link.');
  } finally {
    magicBtn.disabled = false;
    magicBtn.textContent = 'Send Magic Link Instead';
  }
});

// Initialize
updateCartCount();
checkAuth();
