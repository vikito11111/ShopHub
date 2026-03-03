insert into public.categories (name)
values
  ('Furniture'),
  ('Toys'),
  ('Garden'),
  ('Automotive'),
  ('Health & Beauty'),
  ('Music'),
  ('Gaming'),
  ('Food & Drinks')
on conflict (name) do nothing;

with product_seed as (
  select *
  from (
    values
      ('Electronics', 'Apple MacBook Air M2 13-inch', 'Lightweight 13-inch laptop with M2 chip, 8GB RAM, and 256GB SSD. Excellent condition with original charger and box.', 899.00, 'https://source.unsplash.com/1600x900/?macbook,laptop'),
      ('Electronics', 'Sony WH-1000XM5 Noise Cancelling Headphones', 'Premium wireless over-ear headphones with active noise cancellation, 30-hour battery life, and carrying case included.', 269.99, 'https://source.unsplash.com/1600x900/?headphones,audio'),
      ('Electronics', 'Samsung 27-inch 4K UHD Monitor', 'Crisp 4K IPS display with HDR support and slim bezels. Great for productivity and creative work.', 239.50, 'https://source.unsplash.com/1600x900/?computer,monitor'),
      ('Electronics', 'Anker 3-in-1 Wireless Charging Station', 'Fast wireless charging stand for phone, earbuds, and smartwatch with compact foldable design for travel.', 49.95, 'https://source.unsplash.com/1600x900/?wireless,charger'),

      ('Fashion', 'Levi''s 501 Original Fit Jeans', 'Classic straight-leg denim in dark wash, lightly worn, no stains or tears. True to size and comfortable fit.', 38.00, 'https://source.unsplash.com/1600x900/?jeans,denim'),
      ('Fashion', 'Nike Air Force 1 White Sneakers', 'Iconic low-top sneakers in clean white leather. Minimal wear, fresh insoles, and great everyday style.', 72.00, 'https://source.unsplash.com/1600x900/?sneakers,shoes'),
      ('Fashion', 'Michael Kors Jet Set Tote Bag', 'Spacious tote bag with zip closure, interior organizer pockets, and durable coated canvas finish.', 125.00, 'https://source.unsplash.com/1600x900/?handbag,fashion'),
      ('Fashion', 'Patagonia Lightweight Puffer Jacket', 'Warm and packable puffer jacket ideal for travel and winter layering. Excellent insulation and condition.', 89.99, 'https://source.unsplash.com/1600x900/?winter,jacket'),

      ('Home', 'Dyson V10 Cordless Vacuum Cleaner', 'Powerful cordless vacuum with multiple cleaning heads and wall mount dock. Battery still holds strong charge.', 259.00, 'https://source.unsplash.com/1600x900/?vacuum,cleaning'),
      ('Home', 'IKEA MALM 6-Drawer Dresser', 'Modern dresser with smooth-glide drawers and clean white finish. Perfect for bedroom storage.', 140.00, 'https://source.unsplash.com/1600x900/?dresser,furniture'),
      ('Home', 'Nespresso Vertuo Coffee Machine', 'Single-serve coffee machine with quick heat-up and rich crema. Includes starter pod variety pack.', 115.75, 'https://source.unsplash.com/1600x900/?coffee,machine'),
      ('Home', 'Philips Hue Smart LED Starter Kit', 'Smart lighting starter kit with bridge and color bulbs, compatible with Alexa and Google Assistant.', 99.90, 'https://source.unsplash.com/1600x900/?smart,light'),

      ('Sports', 'Trek Domane AL 2 Road Bike', 'Comfort-focused aluminum road bike with Shimano drivetrain and smooth handling, recently serviced.', 649.00, 'https://source.unsplash.com/1600x900/?road,bicycle'),
      ('Sports', 'Adidas Predator League Football Boots', 'Firm-ground soccer cleats with textured upper for control. Great traction and minimal signs of use.', 68.50, 'https://source.unsplash.com/1600x900/?soccer,boots'),
      ('Sports', 'Bowflex Adjustable Dumbbells Pair', 'Space-saving dumbbell pair with adjustable weight range, ideal for home strength workouts.', 219.99, 'https://source.unsplash.com/1600x900/?dumbbells,fitness'),
      ('Sports', 'Wilson Pro Staff Tennis Racket', 'Balanced performance racket with good control and spin. Fresh grip tape installed.', 84.00, 'https://source.unsplash.com/1600x900/?tennis,racket'),

      ('Books', 'The Psychology of Money by Morgan Housel', 'Popular personal finance title with clear real-world insights. Paperback in near-new condition.', 11.99, 'https://source.unsplash.com/1600x900/?book,finance'),
      ('Books', 'Dune by Frank Herbert (Hardcover)', 'Sci-fi classic hardcover edition with dust jacket. Clean pages, no markings, excellent shelf condition.', 18.50, 'https://source.unsplash.com/1600x900/?hardcover,novel'),
      ('Books', 'A Brief History of Time by Stephen Hawking', 'Accessible exploration of cosmology and black holes. Paperback with lightly used cover.', 9.75, 'https://source.unsplash.com/1600x900/?science,book'),
      ('Books', 'Deep Work by Cal Newport', 'Productivity and focus guide for knowledge workers. Crisp pages and sturdy binding.', 13.40, 'https://source.unsplash.com/1600x900/?reading,desk'),

      ('Furniture', 'West Elm Mid-Century Writing Desk', 'Solid wood writing desk with two drawers and cable management cutout. Great for home office setups.', 285.00, 'https://source.unsplash.com/1600x900/?wooden,desk'),
      ('Furniture', 'Article Fabric Accent Chair', 'Comfortable modern accent chair in neutral gray fabric with sturdy oak legs and supportive back.', 210.00, 'https://source.unsplash.com/1600x900/?accent,chair'),
      ('Furniture', 'Queen Upholstered Platform Bed Frame', 'Elegant tufted headboard and solid slat support. No box spring needed, minimal assembly required.', 320.00, 'https://source.unsplash.com/1600x900/?bedroom,bed'),
      ('Furniture', 'Industrial 5-Tier Bookshelf', 'Steel frame and wood shelves with high load capacity. Ideal for books, plants, and decor.', 98.99, 'https://source.unsplash.com/1600x900/?bookshelf,interior'),

      ('Toys', 'LEGO Creator 3-in-1 Pirate Ship Set', 'Complete LEGO set with instruction booklets and sorted pieces. Great creative build for ages 9+.', 64.99, 'https://source.unsplash.com/1600x900/?lego,toy'),
      ('Toys', 'Hot Wheels 50-Car Pack', 'Mixed collection of die-cast cars with varied designs and colors. Perfect for gifting or collecting.', 46.00, 'https://source.unsplash.com/1600x900/?toy,cars'),
      ('Toys', 'Melissa & Doug Wooden Kitchen Playset', 'Durable wooden pretend-play kitchen with stove, sink, and storage. Encourages imaginative play.', 129.50, 'https://source.unsplash.com/1600x900/?kids,toys'),
      ('Toys', 'Nerf Elite Disruptor Blaster Bundle', 'Foam dart blaster with extra darts and targets included. Fully functional and clean.', 24.95, 'https://source.unsplash.com/1600x900/?nerf,blaster'),

      ('Garden', 'Raised Cedar Garden Bed Kit', 'Natural cedar raised bed for vegetables and herbs, easy assembly with rust-resistant hardware.', 89.00, 'https://source.unsplash.com/1600x900/?raised,garden'),
      ('Garden', 'Bosch Electric Hedge Trimmer', 'Lightweight hedge trimmer with precision blades for clean cuts and comfortable handling.', 79.99, 'https://source.unsplash.com/1600x900/?hedge,trimmer'),
      ('Garden', 'Outdoor Patio Bistro Set (3-Piece)', 'Compact metal table and two chairs with weather-resistant coating, perfect for small balconies.', 145.00, 'https://source.unsplash.com/1600x900/?patio,furniture'),
      ('Garden', 'Ceramic Plant Pot Set with Drainage', 'Set of four modern ceramic pots in varied sizes, each with drainage holes and trays.', 39.50, 'https://source.unsplash.com/1600x900/?plant,pots'),

      ('Automotive', 'Michelin All-Season Tire Set (4)', 'Reliable all-season tires with balanced tread wear and strong wet-road performance.', 420.00, 'https://source.unsplash.com/1600x900/?car,tires'),
      ('Automotive', 'NOCO Boost Plus Jump Starter', 'Portable lithium jump starter for dead batteries with USB charging and LED flashlight.', 94.99, 'https://source.unsplash.com/1600x900/?jump,starter'),
      ('Automotive', 'Dash Cam 1440p with Night Vision', 'Front-facing dash camera with loop recording, parking mode, and wide-angle coverage.', 79.00, 'https://source.unsplash.com/1600x900/?dashcam,car'),
      ('Automotive', 'Weatherproof Car Roof Cargo Bag', 'Large roof cargo bag with waterproof zippers and anti-slip mat for road trips.', 58.75, 'https://source.unsplash.com/1600x900/?car,roof,bag'),

      ('Health & Beauty', 'Oral-B iO Series Electric Toothbrush', 'Advanced electric toothbrush with smart pressure sensor, multiple cleaning modes, and charging dock.', 118.00, 'https://source.unsplash.com/1600x900/?toothbrush,bathroom'),
      ('Health & Beauty', 'La Roche-Posay Skincare Bundle', 'Dermatologist-recommended cleanser, moisturizer, and SPF set for sensitive skin.', 52.99, 'https://source.unsplash.com/1600x900/?skincare,beauty'),
      ('Health & Beauty', 'Remington Hair Dryer & Styler Kit', 'Hair dryer with ionic technology plus diffuser and concentrator attachments for daily styling.', 44.50, 'https://source.unsplash.com/1600x900/?hair,dryer'),
      ('Health & Beauty', 'Fitbit Charge 6 Fitness Tracker', 'Fitness tracker with heart-rate monitoring, sleep insights, and built-in GPS support.', 132.00, 'https://source.unsplash.com/1600x900/?fitness,tracker'),

      ('Music', 'Yamaha P-45 Digital Piano', '88-key weighted digital piano with realistic touch response and compact home-friendly design.', 465.00, 'https://source.unsplash.com/1600x900/?digital,piano'),
      ('Music', 'Fender Player Stratocaster Guitar', 'Versatile electric guitar with bright tone and smooth neck, recently restrung and set up.', 559.99, 'https://source.unsplash.com/1600x900/?electric,guitar'),
      ('Music', 'Shure SM58 Vocal Microphone', 'Industry-standard dynamic vocal mic with durable metal body and excellent feedback rejection.', 89.00, 'https://source.unsplash.com/1600x900/?microphone,studio'),
      ('Music', 'Audio-Technica AT-LP60X Turntable', 'Fully automatic belt-drive turntable with built-in preamp for easy setup with speakers.', 129.00, 'https://source.unsplash.com/1600x900/?turntable,vinyl'),

      ('Gaming', 'PlayStation 5 Slim Console', 'PS5 Slim with one DualSense controller and HDMI cable. Tested and reset, ready for setup.', 469.00, 'https://source.unsplash.com/1600x900/?playstation,console'),
      ('Gaming', 'Nintendo Switch OLED Bundle', 'Switch OLED model with dock, Joy-Con pair, charger, and carrying case included.', 289.00, 'https://source.unsplash.com/1600x900/?nintendo,switch'),
      ('Gaming', 'Razer Huntsman V2 Mechanical Keyboard', 'Fast optical switches, RGB lighting, and plush wrist rest. Excellent for gaming and work.', 119.99, 'https://source.unsplash.com/1600x900/?gaming,keyboard'),
      ('Gaming', 'Logitech G Pro X Superlight Mouse', 'Ultra-light wireless gaming mouse with high-precision sensor and long battery life.', 94.50, 'https://source.unsplash.com/1600x900/?gaming,mouse'),

      ('Food & Drinks', 'Ninja Professional Blender 1000W', 'High-power countertop blender for smoothies, soups, and frozen drinks with large pitcher.', 74.99, 'https://source.unsplash.com/1600x900/?blender,kitchen'),
      ('Food & Drinks', 'Breville Smart Kettle Luxe', 'Fast-boil electric kettle with precise temperature presets for tea and coffee brewing.', 109.00, 'https://source.unsplash.com/1600x900/?electric,kettle'),
      ('Food & Drinks', 'Gourmet Espresso Beans 1kg', 'Freshly roasted whole-bean espresso blend with chocolate and caramel flavor notes.', 28.50, 'https://source.unsplash.com/1600x900/?coffee,beans'),
      ('Food & Drinks', 'Glass Meal Prep Container Set (10)', 'BPA-free glass containers with airtight lids, microwave and dishwasher safe.', 32.99, 'https://source.unsplash.com/1600x900/?meal,prep,containers')
  ) as v(category_name, title, description, price, image_url)
)
insert into public.products (
  seller_id,
  category_id,
  title,
  description,
  price,
  quantity,
  image_url,
  status
)
select
  null,
  c.id,
  ps.title,
  ps.description,
  ps.price::numeric(10,2),
  floor(random() * 20 + 1)::int,
  ps.image_url,
  'active'
from product_seed ps
join public.categories c
  on c.name = ps.category_name
where not exists (
  select 1
  from public.products p
  where p.title = ps.title
);
