create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlists enable row level security;

drop policy if exists "Users can read own wishlist" on public.wishlists;
create policy "Users can read own wishlist"
  on public.wishlists
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add own wishlist" on public.wishlists;
create policy "Users can add own wishlist"
  on public.wishlists
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlist" on public.wishlists;
create policy "Users can delete own wishlist"
  on public.wishlists
  for delete
  using (auth.uid() = user_id);
