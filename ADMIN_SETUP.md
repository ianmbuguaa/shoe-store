# Admin Panel Setup Guide

## 🚀 Getting Started

Your StepUp shoe store now has a secure admin panel with authentication and image upload capabilities powered by Supabase.

### 1. Create Your Admin Account

1. Open your browser and navigate to: `admin/setup.html`
2. Enter your email address
3. Create a strong password (minimum 8 characters)
4. Click "Create Admin Account"
5. **Important:** Check your email and verify your account by clicking the confirmation link

### 2. Login to Admin Panel

1. Navigate to: `admin/login.html`
2. Enter your email and password
3. Click "Sign In"

**Alternative:** Use the "Send Magic Link" button for passwordless login via email.

### 3. Access Admin Features

Once logged in, you can:
- ✅ Add, edit, and delete products
- ✅ Upload product images to cloud storage
- ✅ Manage categories and pricing
- ✅ View all products in a table

---

## 📸 Image Upload System

### How It Works

1. **Click "Add Product"** in the admin panel
2. Fill in product details (name, category, price)
3. **Click "Choose File"** to select an image from your computer
4. **Click "Upload Image"** to upload to Supabase Storage
5. Wait for confirmation (✓ Image uploaded successfully!)
6. Click "Save Product"

### Storage Details

- **Bucket:** `product-images`
- **Location:** Supabase Cloud Storage
- **Max Size:** 5MB per image
- **Formats:** JPG, PNG, GIF, WebP
- **Public Access:** Yes (images are publicly viewable)

### Image URLs

Uploaded images are automatically assigned a public URL like:
```
https://bgmutbfurqlgyszbkyxs.supabase.co/storage/v1/object/public/product-images/products/1234567890_abc123.jpg
```

---

## 🔐 Security Features

### Authentication
- Email/password authentication via Supabase Auth
- Magic link (passwordless) login option
- Session management with automatic token refresh
- Secure logout

### Authorization
- Only authenticated admins can:
  - Upload images
  - Create/edit/delete products
  - Access admin panel
- Public users can only view products

### Database Security (Row Level Security)
- Products: Public read, admin-only write
- Images: Public read, admin-only upload/delete

---

## 📁 File Structure

```
admin/
├── login.html          → Admin login page
├── setup.html          → One-time admin account creation
└── admin.html          → Main admin dashboard

js/
├── admin-auth.js       → Login/authentication logic
└── admin.js            → Admin panel logic + image upload

images/                 → (Legacy local folder, kept for backward compatibility)
```

---

## 🛠️ Database Schema

### Tables

**products**
- `id` (serial) - Auto-incrementing product ID
- `name` (text) - Product name
- `category` (text) - Product category
- `price` (decimal) - Product price
- `image_url` (text) - Public URL to product image
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Storage Buckets**
- `product-images` - Public bucket for product photos

---

## 🔄 Syncing with Supabase

### Automatic Sync
- Products are stored in Supabase database
- Images are stored in Supabase Storage
- localStorage is kept for backward compatibility

### Manual Database Operations

You can also manage products directly through Supabase:
1. Go to: https://bgmutbfurqlgyszbkyxs.supabase.co
2. Navigate to Table Editor → products
3. Add/edit products manually if needed

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors (F12)
2. Verify your email is confirmed
3. Check Supabase project status
4. Ensure you're using a modern browser (Chrome, Firefox, Edge)

---

## 🎯 Next Steps

- [ ] Create your admin account via `admin/setup.html`
- [ ] Verify your email
- [ ] Login via `admin/login.html`
- [ ] Upload your first product image
- [ ] Add products to your store

**Your admin URL:** `file:///c:/Users/IAN/Documents/shoe-store/admin/login.html`

---

## 🔑 Quick Reference

| Action | URL |
|--------|-----|
| Create Account | `admin/setup.html` |
| Login | `admin/login.html` |
| Admin Dashboard | `admin/admin.html` |
| Supabase Dashboard | https://bgmutbfurqlgyszbkyxs.supabase.co |

---

**🎉 You're all set!** Your admin panel is now secure and ready to use.
