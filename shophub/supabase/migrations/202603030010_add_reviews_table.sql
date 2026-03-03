create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) > 0 and char_length(comment) <= 2000),
  created_at timestamptz default now(),
  unique (product_id, reviewer_id)
);

alter table public.reviews enable row level security;

create policy "reviews_read_all"
  on public.reviews
  for select
  to authenticated, anon
  using (true);

create policy "reviews_insert_own_if_purchased"
  on public.reviews
  for insert
  to authenticated
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1
      from public.orders o
      where o.buyer_id = auth.uid()
        and o.product_id = reviews.product_id
    )
  );
