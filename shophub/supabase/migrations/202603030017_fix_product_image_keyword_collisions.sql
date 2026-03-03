update public.products
set image_url = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80'
where seller_id is null
  and lower(title) like '%raised cedar garden bed%';

update public.products
set image_url = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
where seller_id is null
  and lower(title) like '%platform bed frame%';
