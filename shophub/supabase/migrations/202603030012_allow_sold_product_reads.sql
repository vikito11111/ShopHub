drop policy if exists "products_read_active" on public.products;

create policy "products_read_active_or_sold"
  on public.products
  for select
  to authenticated, anon
  using (status in ('active', 'sold'));
