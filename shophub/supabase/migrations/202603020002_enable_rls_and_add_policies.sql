alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

create policy "profiles_read_all"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_admin_all"
  on public.profiles
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "categories_read_all"
  on public.categories
  for select
  to authenticated, anon
  using (true);

create policy "categories_admin_all"
  on public.categories
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "products_read_active"
  on public.products
  for select
  to authenticated, anon
  using (status = 'active');

create policy "products_insert_own"
  on public.products
  for insert
  to authenticated
  with check (auth.uid() = seller_id);

create policy "products_update_own"
  on public.products
  for update
  to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "products_delete_own"
  on public.products
  for delete
  to authenticated
  using (auth.uid() = seller_id);

create policy "products_admin_all"
  on public.products
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "orders_insert_buyer"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = buyer_id);

create policy "orders_read_buyer_or_seller"
  on public.orders
  for select
  to authenticated
  using (
    auth.uid() = buyer_id
    or exists (
      select 1
      from public.products p
      where p.id = orders.product_id
        and p.seller_id = auth.uid()
    )
  );

create policy "orders_admin_all"
  on public.orders
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
