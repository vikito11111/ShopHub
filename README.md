# ShopHub 🛍️

A fully functional multi-page marketplace web application built with vanilla JavaScript, Bootstrap 5, and Supabase.

## Project Description

ShopHub is a community-driven marketplace where users can buy and sell pre-loved products. Sellers can list items with photos, set prices and quantities, and manage their listings. Buyers can browse, search, filter, wishlist, and purchase products. Admins can manage users and listings through a dedicated admin panel.

### Who can do what:
- **Guest users** — browse products, search, filter, view product details
- **Registered users** — buy products, sell products, manage listings, write reviews, wishlist items, view purchase/sales history
- **Admin users** — manage all users and listings, view platform statistics, change user roles

---

## Live Project URL

> _Add your Netlify URL here_

## Sample Credentials

| Role | Email | Password |
|------|-------|----------|
| Regular user | demoshophub@gmail.com | demo123456 |
| Admin user | _Add admin email_ | _Add admin password_ |

---

## Architecture

### Frontend
- **HTML5** — one file per page, located in `src/pages/`
- **CSS3 + Bootstrap 5** — responsive design, mobile-first
- **Vanilla JavaScript (ES6+)** — modular service files in `src/js/`
- **Bootstrap Icons** — icon library throughout the UI

### Backend
- **Supabase** — Database, Authentication, and Storage
- **Supabase Auth** — email/password authentication with JWT tokens
- **Supabase Storage** — product images and user avatars in `product-images` bucket
- **Supabase RLS** — Row Level Security policies on all tables

### Build Tools
- **Vite** — multi-page app bundler and dev server
- **Node.js + npm** — package management

### Client-Server Communication
The frontend communicates with Supabase exclusively through the **Supabase REST API** via the `@supabase/supabase-js` SDK.

---

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | Extends Supabase auth.users with username, avatar, and role |
| `categories` | Product categories (Electronics, Fashion, Home, etc.) |
| `products` | Product listings with title, price, quantity, image, status |
| `orders` | Purchase records linking buyers to products |
| `reviews` | Product reviews with star ratings and comments |
| `wishlists` | Saved products per user |

### Relationships

```
auth.users
    └── profiles (1:1)
            └── products (1:many) — seller
            └── orders (1:many) — buyer
            └── reviews (1:many) — reviewer
            └── wishlists (1:many)

categories
    └── products (1:many)

products
    └── orders (1:many)
    └── reviews (1:many)
    └── wishlists (1:many)
```

---

## Key Folders & Files

```
shophub/
├── .github/
│   └── copilot-instructions.md   # AI agent instructions
├── src/
│   ├── pages/                    # One HTML file per page
│   │   ├── index.html            # Home page
│   │   ├── browse.html           # Browse & search products
│   │   ├── product.html          # Product detail page
│   │   ├── sell.html             # Create / edit listing
│   │   ├── profile.html          # User profile & history
│   │   ├── seller.html           # Public seller profile
│   │   ├── login.html            # Login page
│   │   ├── register.html         # Register page
│   │   └── admin.html            # Admin panel
│   ├── js/                       # Business logic (service layer)
│   │   ├── supabase.js           # Supabase client singleton
│   │   ├── auth.js               # Auth helpers
│   │   ├── products.js           # Product CRUD
│   │   ├── storage.js            # File upload/download
│   │   ├── wishlist.js           # Wishlist service
│   │   ├── navbar.js             # Shared navbar component
│   │   ├── footer.js             # Shared footer component
│   │   └── utils.js              # Shared utilities
│   └── css/
│       └── main.css              # Global custom styles
├── supabase/
│   └── migrations/               # All DB migration SQL files
├── .env                          # Environment variables (not committed)
├── vite.config.js                # Vite multi-page config
└── package.json
```

---

## App Screens

| Page | Path | Description |
|------|------|-------------|
| Home | `/src/pages/index.html` | Hero section, latest products grid, search |
| Browse | `/src/pages/browse.html` | All products, category filter, sort, pagination |
| Product Detail | `/src/pages/product.html?id=...` | Full product info, buy, reviews, related products |
| Sell | `/src/pages/sell.html` | Create/edit product listing with image upload |
| Profile | `/src/pages/profile.html` | Avatar, listings, sales & purchase history, wishlist |
| Seller Profile | `/src/pages/seller.html?id=...` | Public profile with seller's active listings |
| Login | `/src/pages/login.html` | Email/password login |
| Register | `/src/pages/register.html` | New account registration |
| Admin Panel | `/src/pages/admin.html` | User management, listing management, stats |

---

## Features

- 🔐 **Authentication** — Register, login, logout with Supabase Auth
- 👤 **User roles** — Regular users and admin users with different permissions
- 🛡️ **Row Level Security** — All tables protected with RLS policies
- 📦 **Product listings** — Create, edit, delete with image upload
- 🔍 **Search & filter** — Search by title, filter by category, sort by price/date/rating
- 📄 **Pagination** — 24 products per page on browse
- ⭐ **Reviews** — Star ratings and comments from verified buyers
- 🛒 **Buy Now** — Purchase products with automatic quantity management
- ❤️ **Wishlist** — Save and manage favourite products
- 📊 **Sales & Purchase history** — Full order history on profile page
- 🏷️ **Quantity badges** — "Only X left" and "Sold Out" indicators
- 🆕 **New badges** — Products listed in the last 3 days are highlighted
- 🖼️ **File upload** — Product images and profile avatars via Supabase Storage
- 📱 **Responsive design** — Works on desktop and mobile

---

## Local Development Setup

### Prerequisites
- Node.js 20.19+ or 22.12+
- A Supabase account and project

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/your-username/ShopHub.git
cd ShopHub/shophub
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the `shophub/` directory:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: Supabase Dashboard → Project Settings → API

4. **Run database migrations**

In the Supabase SQL Editor, run all `.sql` files from `supabase/migrations/` in order.

5. **Start the development server**
```bash
npm run dev
```

6. **Open the app**

Navigate to `http://localhost:5173/src/pages/index.html`

---

## Deployment

The app is deployed on **Netlify**.

Build settings:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment variables**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify dashboard
