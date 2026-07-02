// Supabase Configuration
const SUPABASE_URL = 'https://bgmutbfurqlgyszbkyxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXV0YmZ1cnFsZ3lzemJreXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ2NzksImV4cCI6MjA5NzcwMDY3OX0.iBkb1zSMcsfBrT0lqr53uDcjBSJX3yO87wSgPmb9ArE';

// Initialize Supabase client (using CDN)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Show/hide messages
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => errorDiv.style.display = 'none', 5000);
}

function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  setTimeout(() => successDiv.style.display = 'none', 5000);
}

// Check if already logged in
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = 'admin.html';
  }
}

// Email/Password Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
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
    setTimeout(() => window.location.href = 'admin.html', 1000);
    
  } catch (error) {
    showError(error.message || 'Login failed. Please check your credentials.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});

// Magic Link Login
document.getElementById('magic-link-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  
  if (!email) {
    showError('Please enter your email address first.');
    return;
  }
  
  const magicBtn = document.getElementById('magic-link-btn');
  magicBtn.disabled = true;
  magicBtn.textContent = 'Sending...';
  
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/admin.html`
      }
    });
    
    if (error) throw error;
    
    showSuccess('Magic link sent! Check your email.');
    
  } catch (error) {
    showError(error.message || 'Failed to send magic link.');
  } finally {
    magicBtn.disabled = false;
    magicBtn.textContent = 'Send Magic Link';
  }
});

// Initialize
checkAuth();
