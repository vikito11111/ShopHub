alter table public.products
  add column if not exists quantity int not null default 1 check (quantity >= 0);

update public.products
set quantity = 0,
    status = 'sold'
where status = 'sold' and quantity > 0;

update public.products
set quantity = 1
where status = 'active' and quantity = 0;

drop trigger if exists trg_mark_product_sold_on_order on public.orders;
drop function if exists public.mark_product_sold_on_order();

create or replace function public.validate_product_stock_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  product_status text;
  product_quantity int;
begin
  select status, quantity
  into product_status, product_quantity
  from public.products
  where id = new.product_id
  for update;

  if product_status is null then
    raise exception 'Product not found';
  end if;

  if product_status = 'sold' or product_quantity <= 0 then
    raise exception 'Product is sold out';
  end if;

  return new;
end;
$$;

create or replace function public.decrement_product_quantity_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set quantity = greatest(quantity - 1, 0),
      status = case when quantity - 1 <= 0 then 'sold' else status end
  where id = new.product_id;

  return new;
end;
$$;

drop trigger if exists trg_validate_product_stock_on_order on public.orders;
create trigger trg_validate_product_stock_on_order
before insert on public.orders
for each row
execute function public.validate_product_stock_on_order();

drop trigger if exists trg_decrement_product_quantity_on_order on public.orders;
create trigger trg_decrement_product_quantity_on_order
after insert on public.orders
for each row
execute function public.decrement_product_quantity_on_order();
