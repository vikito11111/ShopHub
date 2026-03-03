update public.products
set image_url = case
  when lower(title) like '%macbook%' or lower(title) like '%laptop%' then 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%headphone%' then 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%monitor%' then 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%charg%' then 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%jeans%' or lower(title) like '%denim%' then 'https://images.unsplash.com/photo-1604176424472-9d2f58f0f46d?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%sneaker%' or lower(title) like '%air force%' or lower(title) like '%shoe%' then 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%tote bag%' or lower(title) like '%handbag%' or lower(title) like '%bag%' then 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%jacket%' then 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%vacuum%' then 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%dresser%' then 'https://images.unsplash.com/photo-1595514535415-dae198f1f6df?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%coffee machine%' or lower(title) like '%nespresso%' then 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%smart led%' or lower(title) like '%hue%' or lower(title) like '%lamp%' then 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%bike%' or lower(title) like '%bicycle%' then 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%boot%' or lower(title) like '%football%' or lower(title) like '%soccer%' then 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%dumbbell%' then 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%racket%' or lower(title) like '%tennis%' then 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%yoga mat%' then 'https://images.unsplash.com/photo-1571019613914-85f342c55f41?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%book%' or lower(title) like '%paperback%' or lower(title) like '%hardcover%' then 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%desk%' then 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%accent chair%' or lower(title) like '%chair%' then 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%bed frame%' or lower(title) like '%bed%' then 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%bookshelf%' then 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%lego%' then 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%hot wheels%' or lower(title) like '%car pack%' then 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%playset%' then 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%nerf%' or lower(title) like '%blaster%' then 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%garden bed%' or lower(title) like '%raised%' then 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%hedge trimmer%' or lower(title) like '%trimmer%' then 'https://images.unsplash.com/photo-1599685315640-9ceab2f5f45a?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%bistro set%' or lower(title) like '%patio%' then 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%plant pot%' or lower(title) like '%ceramic pot%' then 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%tire%' then 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%jump starter%' then 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%dash cam%' then 'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%cargo bag%' then 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%toothbrush%' then 'https://images.unsplash.com/photo-1559591935-c6c4df7f6612?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%skincare%' then 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%hair dryer%' or lower(title) like '%styler%' then 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%fitbit%' or lower(title) like '%tracker%' then 'https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%piano%' then 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%guitar%' then 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%microphone%' then 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%turntable%' or lower(title) like '%vinyl%' then 'https://images.unsplash.com/photo-1461784180009-21121b2f2044?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%playstation%' or lower(title) like '%ps5%' then 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%nintendo switch%' then 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%keyboard%' then 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%mouse%' then 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80'

  when lower(title) like '%blender%' then 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%kettle%' then 'https://images.unsplash.com/photo-1622480916113-b2c08f16fc4d?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%espresso beans%' or lower(title) like '%coffee beans%' then 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
  when lower(title) like '%meal prep%' or lower(title) like '%container%' then 'https://images.unsplash.com/photo-1584269600519-112d071b4a4d?auto=format&fit=crop&w=800&q=80'

  else image_url
end
where seller_id is null;
