# Dummy Data Summary - Products Database

## ✅ 20 Products Added Successfully!

Your `products` table has been populated with realistic shoe inventory data, each with **multiple sizes and varying quantities**.

---

## 📊 Product Inventory Overview

| ID | Product Name | Category | Price (KSh) | Available Sizes | Total Stock |
|----|--------------|----------|-------------|-----------------|-------------|
| 1  | Nike Air Zoom Pegasus 40 | Running | 13,499 | 38, 39, 40, 41, 42, 43 | **82** |
| 2  | Adidas Ultraboost 23 | Running | 15,999 | 37, 38, 39, 40, 41, 42, 43 | **101** |
| 3  | Converse Chuck Taylor All Star | Casual | 6,499 | 36, 37, 38, 39, 40, 41, 42 | **122** |
| 4  | Puma Suede Classic | Sneakers | 7,999 | 38, 39, 40, 41, 42, 43 | **88** |
| 5  | New Balance 990v6 | Running | 17,999 | 39, 40, 41, 42, 43, 44 | **81** |
| 6  | Vans Old Skool | Casual | 5,999 | 37, 38, 39, 40, 41, 42, 43 | **128** |
| 7  | Jordan Retro 1 High OG | Sneakers | 18,999 | 40, 41, 42, 43 | **14** ⚠️ Limited! |
| 8  | Timberland 6-Inch Premium | Boots | 16,499 | 39, 40, 41, 42, 43, 44 | **68** |
| 9  | Birkenstock Arizona | Sandals | 8,999 | 36, 37, 38, 39, 40, 41 | **77** |
| 10 | Salomon Speedcross 5 | Outdoor | 14,999 | 39, 40, 41, 42, 43, 44 | **67** |
| 11 | Reebok Classic Leather | Casual | 6,999 | 38, 39, 40, 41, 42, 43 | **98** |
| 12 | Asics Gel-Kayano 30 | Running | 14,499 | 38, 39, 40, 41, 42, 43 | **80** |
| 13 | Dr. Martens 1460 | Boots | 15,999 | 37, 38, 39, 40, 41, 42, 43 | **70** |
| 14 | Crocs Classic Clog | Sandals | 4,999 | 36, 37, 38, 39, 40, 41, 42 | **158** 🔥 Best Stock! |
| 15 | Hoka Clifton 9 | Running | 13,999 | 38, 39, 40, 41, 42, 43 | **88** |
| 16 | Skechers Go Walk Max | Casual | 5,499 | 37, 38, 39, 40, 41, 42, 43 | **140** |
| 17 | Columbia Newton Ridge Plus | Outdoor | 11,999 | 39, 40, 41, 42, 43, 44 | **81** |
| 18 | Merrell Moab 3 | Outdoor | 12,499 | 39, 40, 41, 42, 43, 44 | **71** |
| 19 | Fila Disruptor II | Sneakers | 7,499 | 36, 37, 38, 39, 40, 41, 42 | **108** |
| 20 | Under Armour HOVR Phantom 3 | Running | 12,999 | 38, 39, 40, 41, 42, 43 | **86** |

---

## 📈 Statistics

### By Category
- **Running:** 6 products (Nike, Adidas, New Balance, Asics, Hoka, Under Armour)
- **Casual:** 4 products (Converse, Vans, Reebok, Skechers)
- **Sneakers:** 3 products (Puma, Jordan, Fila)
- **Outdoor:** 3 products (Salomon, Columbia, Merrell)
- **Boots:** 2 products (Timberland, Dr. Martens)
- **Sandals:** 2 products (Birkenstock, Crocs)

### Price Range
- **Budget:** KSh 4,999 - 7,999 (Crocs, Vans, Skechers, Converse, Reebok, Fila, Puma)
- **Mid-Range:** KSh 8,999 - 14,999 (Most running & outdoor shoes)
- **Premium:** KSh 15,999 - 18,999 (New Balance, Jordan, Timberland, Dr. Martens)

### Total Inventory
- **Total Products:** 20
- **Total Stock Units:** 1,778 items
- **Average Stock per Product:** 89 units

---

## 🎯 Size Distribution Examples

### Product #1: Nike Air Zoom Pegasus 40
```json
{
  "38": 8,   ← Small sizes: lower stock
  "39": 15,  
  "40": 22,  ← Medium sizes: highest demand
  "41": 18,
  "42": 12,
  "43": 7    ← Large sizes: lower stock
}
Total: 82 units
```

### Product #7: Jordan Retro 1 High OG (Limited Edition)
```json
{
  "40": 3,   ← Very limited quantities
  "41": 5,   ← Rare/exclusive product
  "42": 4,
  "43": 2
}
Total: 14 units ⚠️ Low stock alert!
```

### Product #14: Crocs Classic Clog (Best Seller)
```json
{
  "36": 20,
  "37": 25,
  "38": 30,  ← Peak sizes heavily stocked
  "39": 28,
  "40": 22,
  "41": 18,
  "42": 15
}
Total: 158 units 🔥 Popular item!
```

---

## 🔍 Detailed Size Breakdown

### Nike Air Zoom Pegasus 40 (ID: 1)
- **Size 38:** 8 units
- **Size 39:** 15 units
- **Size 40:** 22 units ⭐ Most popular
- **Size 41:** 18 units
- **Size 42:** 12 units
- **Size 43:** 7 units

### Adidas Ultraboost 23 (ID: 2)
- **Size 37:** 5 units
- **Size 38:** 10 units
- **Size 39:** 18 units
- **Size 40:** 25 units ⭐ Most popular
- **Size 41:** 20 units
- **Size 42:** 15 units
- **Size 43:** 8 units

### Converse Chuck Taylor All Star (ID: 3)
- **Size 36:** 12 units
- **Size 37:** 18 units
- **Size 38:** 20 units
- **Size 39:** 25 units ⭐ Most popular
- **Size 40:** 22 units
- **Size 41:** 15 units
- **Size 42:** 10 units

### Jordan Retro 1 High OG (ID: 7) - LIMITED EDITION
- **Size 40:** 3 units ⚠️
- **Size 41:** 5 units ⚠️
- **Size 42:** 4 units ⚠️
- **Size 43:** 2 units ⚠️

---

## 🎨 View in Admin Panel

To see this data:
1. Open `admin/login.html`
2. Login with your credentials
3. View the **Products** table

**You'll see:**
```
┌────┬────────────────────────┬──────────┬──────────────┬────────────────────────────────┬─────────────┬─────────┐
│ ID │ Name                   │ Category │ Price        │ Sizes & Quantities             │ Total Stock │ Actions │
├────┼────────────────────────┼──────────┼──────────────┼────────────────────────────────┼─────────────┼─────────┤
│ 1  │ Nike Air Zoom Peg...   │ Running  │ KSh 13,499   │ 38: 8, 39: 15, 40: 22, 41:...  │     82      │ [Edit]  │
│ 2  │ Adidas Ultraboost 23   │ Running  │ KSh 15,999   │ 37: 5, 38: 10, 39: 18, 40:...  │    101      │ [Edit]  │
│ 3  │ Converse Chuck Tay...  │ Casual   │ KSh 6,499    │ 36: 12, 37: 18, 38: 20, 39:... │    122      │ [Edit]  │
└────┴────────────────────────┴──────────┴──────────────┴────────────────────────────────┴─────────────┴─────────┘
```

---

## 💡 Use Cases Demonstrated

### 1. **Standard Stock Distribution**
Products like Nike Pegasus show realistic inventory:
- Small sizes (38): Lower quantities (8)
- Medium sizes (40-41): Highest quantities (22, 18)
- Large sizes (43): Lower quantities (7)

### 2. **Limited Edition / Exclusive**
Jordan Retro 1 shows scarcity:
- Only 4 sizes available
- Very low quantities (2-5 units)
- Total stock: 14 units

### 3. **Best Sellers / High Volume**
Crocs and Vans show popular items:
- Wide size range (7 sizes)
- High quantities per size (15-30 units)
- Total stock: 128-158 units

### 4. **Specialized Footwear**
Outdoor boots (Timberland, Salomon) show:
- Larger size range including 44
- Balanced stock across sizes
- Moderate total inventory

---

## 🧪 Test Scenarios

### Edit a Product
1. Click **Edit** on "Nike Air Zoom Pegasus 40"
2. You'll see all 6 sizes pre-populated
3. Change quantity for size 40 from 22 to 20
4. Save and verify

### Remove a Size
1. Edit "Jordan Retro 1 High OG"
2. Click ✕ next to size 43
3. Size 43 removed from product
4. Total stock recalculated

### Add a Size
1. Edit "Birkenstock Arizona"
2. Click "+ Add Size"
3. Select size 42, quantity 5
4. Now has 7 sizes instead of 6

---

## 📊 SQL Queries to Try

### Find products with specific size
```sql
SELECT name, size_quantities 
FROM products 
WHERE size_quantities ? '42';
```

### Find low stock products
```sql
SELECT 
  name, 
  (SELECT SUM(value::int) FROM jsonb_each_text(size_quantities)) as total
FROM products 
WHERE (SELECT SUM(value::int) FROM jsonb_each_text(size_quantities)) < 30
ORDER BY total ASC;
```

### Get products with size 40 and quantity > 15
```sql
SELECT name, size_quantities->>'40' as size_40_qty
FROM products 
WHERE (size_quantities->>'40')::int > 15;
```

---

## 🎯 Next Steps

Now that you have dummy data:
1. ✅ **Test editing:** Try editing products with multiple sizes
2. ✅ **Test adding:** Add a new product with 5+ sizes
3. ✅ **Test deleting:** Remove a product
4. ✅ **Test validation:** Try adding duplicate sizes (should fail)
5. ✅ **View on shop page:** Check if products display correctly
6. ✅ **Test cart:** Add products to cart (future feature)

---

## 📁 Related Files

- **Admin Panel:** `admin/admin.html`
- **Admin Logic:** `js/admin.js`
- **Database Table:** `products` (Supabase)
- **Feature Guide:** `SIZE_QUANTITIES_GUIDE.md`
- **Quick Demo:** `QUICK_DEMO.md`

---

**🎉 Your database is now populated with 20 realistic products!**

Total inventory value: **KSh 1,778 units** across **20 products** in **6 categories**

---

**Last Updated:** July 3, 2026  
**Status:** ✅ Data Inserted Successfully  
**Total Products:** 20  
**Total Inventory:** 1,778 units
