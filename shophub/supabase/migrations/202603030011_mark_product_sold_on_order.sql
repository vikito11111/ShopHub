create or replace function public.mark_product_sold_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set status = 'sold'
  where id = new.product_id
    and status = 'active';

  return new;
end;
$$;

drop trigger if exists trg_mark_product_sold_on_order on public.orders;

create trigger trg_mark_product_sold_on_order
after insert on public.orders
for each row
execute function public.mark_product_sold_on_order();
