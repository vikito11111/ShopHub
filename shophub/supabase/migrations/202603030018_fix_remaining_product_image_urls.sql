with fixed_images as (
  select *
  from (
    values
      ('Classic Denim Jacket', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'),
      ('IKEA MALM 6-Drawer Dresser', 'https://images.unsplash.com/photo-1616594039964-3d1e5ddaf0d8?auto=format&fit=crop&w=800&q=80'),
      ('Glass Meal Prep Container Set (10)', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'),
      ('Audio-Technica AT-LP60X Turntable', 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=800&q=80'),
      ('Breville Smart Kettle Luxe', 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80'),
      ('Bosch Electric Hedge Trimmer', 'https://images.unsplash.com/photo-1526397751294-331021109fbd?auto=format&fit=crop&w=800&q=80'),
      ('Levi''s 501 Original Fit Jeans', 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80'),
      ('Oral-B iO Series Electric Toothbrush', 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80'),
      ('"New Balance M1000" running shoes', 'https://mobtytxgfphnuycaxwic.supabase.co/storage/v1/object/public/product-images/1772451414576-newbalance.jpg'),
      ('Blue Jeans', 'https://mobtytxgfphnuycaxwic.supabase.co/storage/v1/object/public/product-images/1772551077906-istockphoto-1132154377-612x612.jpg')
  ) as v(title, image_url)
)
update public.products p
set image_url = fi.image_url
from fixed_images fi
where p.title = fi.title;
