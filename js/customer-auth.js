// Customer Authentication Logic
import { supabase } from './supabase-client.js';

// Show/hide messages
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
  }
}

function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => successDiv.style.display = 'none', 5000);
  }
}

// Check if already logged in
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // User is logged in, redirect to shop
    window.location.href = 'shop.html';
  }
}

// Sign Up
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const fullName = document.getElementById('signup-name').value;
    const signupBtn = document.getElementById('signup-btn');
    
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) throw error;
      
      showSuccess('Account created! Please check your email to verify.');
      
      // Clear form
      signupForm.reset();
      
    } catch (error) {
      console.error('Signup error:', error);
      showError(error.message || 'Signup failed. Please try again.');
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
    }
  });
}

// Sign In
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
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
      
      showSuccess('Login successful! Redirecting...');
      setTimeout(() => window.location.href = 'shop.html', 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      showError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  });
}

// Initialize
checkAuth();
