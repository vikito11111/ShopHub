with sample_products as (
  select *
  from (
    values
      ('Electronics', 'Wireless Bluetooth Headphones', 'Noise-isolating over-ear headphones with 20-hour battery life.', 79.99::numeric, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80', 'active'),
      ('Fashion', 'Classic Denim Jacket', 'Unisex medium-wash denim jacket in excellent condition.', 45.00::numeric, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80', 'active'),
      ('Home', 'Modern Table Lamp', 'Minimalist bedside table lamp with warm white LED bulb included.', 29.50::numeric, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80', 'active'),
      ('Sports', 'Yoga Mat Pro 6mm', 'Non-slip yoga mat with carrying strap, lightly used.', 25.00::numeric, 'https://images.unsplash.com/photo-1571019613914-85f342c55f41?w=1200&q=80', 'active'),
      ('Books', 'Atomic Habits (Paperback)', 'Best-selling self-improvement book in great condition.', 12.99::numeric, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80', 'active')
  ) as v(category_name, title, description, price, image_url, status)
)
insert into public.products (category_id, title, description, price, image_url, status)
select c.id, sp.title, sp.description, sp.price, sp.image_url, sp.status
from sample_products sp
join public.categories c
  on c.name = sp.category_name
where not exists (
  select 1
  from public.products p
  where p.category_id = c.id
    and p.title = sp.title
);
