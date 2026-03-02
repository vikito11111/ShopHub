drop policy if exists "products_admin_all" on public.products;
drop policy if exists "profiles_admin_all" on public.profiles;

alter policy "products_read_active"
  on public.products
  to anon, authenticated
  using (status = 'active');
