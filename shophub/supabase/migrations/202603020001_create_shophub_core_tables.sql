create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  username text unique not null,
  avatar_url text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id serial primary key,
  name text unique not null
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id) on delete cascade,
  category_id int references public.categories(id),
  title text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id),
  product_id uuid references public.products(id),
  created_at timestamptz default now()
);
