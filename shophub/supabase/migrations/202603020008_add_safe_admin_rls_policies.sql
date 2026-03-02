create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

drop policy if exists "profiles_admin_select_all" on public.profiles;
drop policy if exists "profiles_admin_update_all" on public.profiles;
drop policy if exists "products_admin_select_all" on public.products;
drop policy if exists "products_admin_update_all" on public.products;
drop policy if exists "orders_admin_select_all" on public.orders;

create policy "profiles_admin_select_all"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "profiles_admin_update_all"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "products_admin_select_all"
  on public.products
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "products_admin_update_all"
  on public.products
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "orders_admin_select_all"
  on public.orders
  for select
  to authenticated
  using (public.is_admin(auth.uid()));
