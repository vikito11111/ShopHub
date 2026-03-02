# ShopHub — Copilot Agent Instructions

## Project Overview
ShopHub is a multi-page product listings marketplace built with vanilla JavaScript, HTML, CSS, Bootstrap, and Supabase as the backend. Users can browse products, list items for sale, upload photos, and admins can manage the platform.

## Tech Stack
- **Frontend**: HTML5, CSS3, vanilla JavaScript (ES6+), Bootstrap 5
- **Backend**: Supabase (Database, Auth, Storage)
- **Build Tool**: Vite
- **Deployment**: Netlify
- **No**: TypeScript, React, Vue, or any JS framework

## Project Structure
```
shophub/
├── .github/
│   └── copilot-instructions.md
├── public/
│   └── favicon.ico
├── src/
│   ├── pages/
│   │   ├── index.html          # Home page
│   │   ├── browse.html         # Browse / search products
│   │   ├── product.html        # Single product detail
│   │   ├── sell.html           # Add / edit listing
│   │   ├── profile.html        # User profile & their listings
│   │   ├── login.html          # Login page
│   │   ├── register.html       # Register page
│   │   └── admin.html          # Admin panel
│   ├── js/
│   │   ├── supabase.js         # Supabase client init (singleton)
│   │   ├── auth.js             # Auth helpers (login, register, logout, getUser)
│   │   ├── products.js         # Product CRUD operations
│   │   ├── storage.js          # File upload/download helpers
│   │   ├── admin.js            # Admin-only operations
│   │   └── utils.js            # Shared utilities (formatPrice, truncate, etc.)
│   ├── css/
│   │   └── main.css            # Global custom styles
│   └── assets/
│       └── logo.png
├── supabase/
│   └── migrations/             # All DB migration SQL files
├── index.html                  # Entry point (redirects or is home)
├── vite.config.js
└── package.json
```

## Architecture Rules
- **Always** keep each page in its own HTML file under `src/pages/`
- **Always** keep business logic in dedicated JS service files (never inline in HTML)
- **Never** write all logic in one big file — keep it modular
- Import Supabase client only from `src/js/supabase.js` — never re-initialize it elsewhere
- Use `async/await` for all Supabase calls, always wrap in try/catch
- All pages must include the shared navbar and footer via JS injection or repeated HTML

## Database Schema

### Table: profiles
Extends Supabase auth.users. Created automatically on user registration via trigger.
```sql
id          uuid references auth.users primary key
username    text unique not null
avatar_url  text
role        text default 'user'  -- 'user' or 'admin'
created_at  timestamptz default now()
```

### Table: categories
```sql
id    serial primary key
name  text unique not null
```

### Table: products
```sql
id           uuid default gen_random_uuid() primary key
seller_id    uuid references profiles(id) on delete cascade
category_id  int references categories(id)
title        text not null
description  text
price        numeric(10,2) not null
image_url    text
status       text default 'active'  -- 'active', 'sold', 'deleted'
created_at   timestamptz default now()
```

### Table: orders
```sql
id          uuid default gen_random_uuid() primary key
buyer_id    uuid references profiles(id)
product_id  uuid references products(id)
created_at  timestamptz default now()
```

## Supabase Setup
- **Auth**: Email/password. On sign-up, a trigger creates a row in `profiles`.
- **RLS (Row Level Security)**: Must be enabled on all tables.
  - `profiles`: users can read all, update only their own
  - `products`: anyone can read active, only seller can insert/update/delete their own
  - `orders`: buyer can insert, buyer and seller can read their own
  - `admin` role bypasses RLS using `user_roles` check or service role
- **Storage bucket**: `product-images` — public read, authenticated write
- **Migrations**: Every schema change must be saved as a `.sql` file in `supabase/migrations/`

## Page-by-Page Behavior

### Home (index.html)
- Show featured/latest products in a Bootstrap card grid
- Search bar that redirects to browse.html?search=...
- Navbar with login/register or logout depending on auth state

### Browse (browse.html)
- Display all active products in a responsive card grid
- Filter by category (dropdown)
- Search by title (query param from home or typed)
- Each card links to product.html?id=...

### Product Detail (product.html)
- Read `id` from URL params
- Show full product info: image, title, description, price, seller username
- "Buy Now" button (inserts into orders table) — only for logged-in non-sellers
- If current user is the seller: show Edit / Delete buttons

### Sell / Add / Edit (sell.html)
- Protected: redirect to login if not authenticated
- Form: title, description, price, category, image upload
- On edit mode (URL param `?id=...`): pre-fill form with existing data
- Image upload goes to Supabase Storage `product-images` bucket
- On submit: insert or update the `products` table

### Profile (profile.html)
- Show user's avatar, username
- Avatar upload (Supabase Storage)
- List user's own product listings with edit/delete options

### Login (login.html) & Register (register.html)
- Standard Supabase Auth email/password
- On success: redirect to home
- Show validation errors inline

### Admin Panel (admin.html)
- Protected: redirect to home if role !== 'admin'
- Table of all users (username, email, role) with ability to change role
- Table of all products with ability to delete any listing
- Simple stats: total users, total products, total orders

## Coding Conventions
- Use `const` and `let`, never `var`
- Use template literals for HTML generation
- Format prices with `Intl.NumberFormat` or a `formatPrice()` util
- Show loading spinners (Bootstrap `spinner-border`) during async operations
- Show Bootstrap alerts for success/error messages — auto-dismiss after 3s
- Mobile-first responsive design using Bootstrap grid (`col-12 col-md-6 col-lg-4`)
- Use Bootstrap Icons (`bi` classes) for all icons

## Supabase Client (supabase.js)
```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

## Environment Variables (.env)
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
Never commit `.env` to GitHub. Add it to `.gitignore`.

## Key Workflows for Copilot

### Auth state check (use on every protected page)
```javascript
import { supabase } from './supabase.js'
const { data: { user } } = await supabase.auth.getUser()
if (!user) window.location.href = '/src/pages/login.html'
```

### Image upload pattern
```javascript
const file = document.getElementById('image-input').files[0]
const fileName = `${Date.now()}-${file.name}`
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(fileName, file)
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(fileName)
```

### Admin role check
```javascript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()
if (profile.role !== 'admin') window.location.href = '/src/pages/index.html'
```

## Deployment (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Netlify dashboard
- Add `_redirects` file in `public/` with: `/* /index.html 200` for SPA routing if needed

## Git Commit Strategy
Make frequent, meaningful commits. Suggested commit messages:
- `init: project setup with Vite and Supabase`
- `feat: add Supabase auth (login, register, logout)`
- `feat: home page with product grid`
- `feat: browse page with category filter and search`
- `feat: product detail page`
- `feat: sell page with image upload`
- `feat: profile page with avatar upload`
- `feat: admin panel - user and product management`
- `db: add RLS policies for products and orders`
- `fix: redirect unauthenticated users from protected pages`
- `style: responsive layout and Bootstrap improvements`
- `deploy: Netlify config and environment setup`
- `docs: add README and project documentation`

Aim for at least 15 commits across 3+ different days.
