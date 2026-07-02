# 🚀 Quick Start Guide - Admin Panel

## ⚡ Get Started in 3 Steps

### Step 1: Create Your Admin Account
Open in browser: `admin/setup.html`

1. Enter your email
2. Create a password (min 8 characters)
3. Check your email and verify

### Step 2: Login
Open in browser: `admin/login.html`

- Use email + password, OR
- Click "Send Magic Link" for passwordless login

### Step 3: Upload Images
1. Click "Add Product"
2. Fill in details
3. Click "Choose File" and select image
4. Click "Upload Image"
5. Click "Save Product"

---

## 📸 Image Upload Features

✅ Upload directly from your computer  
✅ Automatic cloud storage (Supabase)  
✅ Public URLs generated automatically  
✅ Max 5MB per image  
✅ Supports JPG, PNG, GIF, WebP

---

## 🔐 Your Admin Access

**Setup URL:** `file:///c:/Users/IAN/Documents/shoe-store/admin/setup.html`  
**Login URL:** `file:///c:/Users/IAN/Documents/shoe-store/admin/login.html`  
**Dashboard:** `file:///c:/Users/IAN/Documents/shoe-store/admin/admin.html`

**Supabase Dashboard:** https://bgmutbfurqlgyszbkyxs.supabase.co

---

## 💡 How It Works

### Image Upload Flow
```
1. Select image → 2. Click Upload → 3. File goes to Supabase Storage 
→ 4. Get public URL → 5. Save to database
```

### Where Images Are Stored
- **Cloud:** Supabase Storage (`product-images` bucket)
- **Database:** Public URLs saved in `products` table
- **Local:** Legacy `images/` folder (kept for backward compatibility)

---

## 🛠️ What You Can Do

✓ Add new products  
✓ Edit existing products  
✓ Delete products  
✓ Upload product images  
✓ Manage categories  
✓ Set prices  
✓ View all products in a table  

---

## 🔒 Security

- Only YOU can access the admin panel (requires login)
- Images are public (anyone can view product photos)
- Database has Row Level Security enabled
- Sessions are secure with automatic token refresh

---

## 📞 Need Help?

See full documentation: `ADMIN_SETUP.md`

**Common Issues:**
- Can't login? Check if you verified your email
- Image won't upload? Check file size (max 5MB)
- Page not loading? Try a modern browser (Chrome/Edge/Firefox)

---

## 🎯 Your Next Steps

1. [ ] Open `admin/setup.html` in your browser
2. [ ] Create your admin account
3. [ ] Verify your email (check spam folder)
4. [ ] Login via `admin/login.html`
5. [ ] Upload your first product image!

**That's it!** You're ready to manage your shoe store. 🎉
