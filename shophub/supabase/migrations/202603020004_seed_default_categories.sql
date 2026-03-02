insert into public.categories (name)
values
  ('Electronics'),
  ('Fashion'),
  ('Home'),
  ('Sports'),
  ('Books')
on conflict (name) do nothing;
