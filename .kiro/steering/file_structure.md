# StepUp Shoe Store – Project Structure & Conventions

## File Structure

```
shoe-store/
│── index.html          (Customer homepage)
│── shop.html           (Products page)
│── cart.html           (Cart page)
│── about.html          (About Us page)
│── contact.html        (Contact page)
│── admin/
│     ├── login.html    (Admin login page with Supabase auth)
│     ├── setup.html    (One-time admin account creation)
│     └── admin.html    (Admin dashboard with image upload)
│── css/
│     ├── styles.css    (Global styles, shared across all customer pages)
│     └── admin.css     (Admin-only styles)
│── js/
│     ├── script.js     (Homepage logic)
│     ├── shop.js       (Shop page logic – filtering, cart add)
│     ├── cart.js       (Cart page logic – quantities, totals)
│     ├── about.js      (About page logic – cart count sync)
│     ├── contact.js    (Contact page logic – form validation & submission)
│     ├── admin-auth.js (Admin authentication logic)
│     └── admin.js      (Admin dashboard logic – product CRUD + image upload)
│── images/             (Legacy local folder for product images)
│── ADMIN_SETUP.md      (Admin setup guide and documentation)
```

## Conventions

- Each HTML page links its own dedicated JS file (e.g. `shop.html` → `js/shop.js`).
- All customer pages share `css/styles.css`. The admin page additionally loads `css/admin.css`.
- Admin pages use `../` relative paths to reach `css/` and `js/` since they live inside the `admin/` subfolder.
- Cart state is persisted in `localStorage` under the key `"cart"`.
- **Product data is stored in Supabase** (`products` table). Admin changes sync to database and localStorage.
- **Product images are stored in Supabase Storage** (`product-images` bucket). Legacy local `images/` folder maintained for backward compatibility.
- **Admin authentication** uses Supabase Auth (email/password + magic link).
- Placeholder images fall back to `https://placehold.co/400x200?text=Shoe` via `onerror` on `<img>` tags.
- Nav links must always point to real files (`index.html`, `shop.html`, `cart.html`), not `#`.
- The active nav link gets the class `active`.
- Color palette: Sage green `#4a7c59`, white `#ffffff`, text dark `#1a1a1a`.
