-- Every lot in the catalog. Edit this file, then run it in the SQL Editor: it replaces all the lots.
-- Lot numbers follow the order of the lines below. Copies of the same thing share a photo.
-- Safe to rerun until bidding starts (after that, bids point at these rows).

begin;

delete from public.items;

insert into public.items (lot_number, title, size, description, image_paths)
select row_number() over (), title, size, description, image_paths
from (values
  ('Beanie (1 of 4)', null, null, array['2026/beanies.jpg']),
  ('Beanie (2 of 4)', null, null, array['2026/beanies.jpg']),
  ('Beanie (3 of 4)', null, null, array['2026/beanies.jpg']),
  ('Beanie (4 of 4)', null, null, array['2026/beanies.jpg']),
  ('Beanie with pom pom', null, null, array['2026/beanies.jpg']),
  ('Black hoodie', null, null, array['2026/black_hoodie.jpg']),
  ('Black T-shirt', null, null, array['2026/black_tshirt.jpg']),
  ('Red BOS cap', null, null, array['2026/bos_hats.jpg']),
  ('Black BOS cap', null, null, array['2026/bos_hats.jpg']),
  ('Grey cap', null, null, array['2026/bos_hats.jpg']),
  ('Grey hoodie', null, null, array['2026/grey_hoodie.jpg']),
  ('Hackathon shirt', null, null, array['2026/hackathon/hackathon_front.jpg', '2026/hackathon/hackathon_back.jpg']),
  ('Black cap (1 of 2)', null, null, array['2026/hats2.jpg']),
  ('Black cap (2 of 2)', null, null, array['2026/hats2.jpg']),
  ('Jersey', null, null, array['2026/jersey.jpg']),
  ('Klaviyo BFCM', null, null, array['2026/klaviyo_bfcm/bfcm_front.jpg', '2026/klaviyo_bfcm/bfcm_back.jpg']),
  ('Orange hoodie', null, null, array['2026/orange_hoodie.jpg']),
  ('Orange T-shirt', null, null, array['2026/orange_tshirt.jpg']),
  ('Orange T-shirt', null, null, array['2026/orange_tshirt2.jpg']),
  ('Orange T-shirt', null, null, array['2026/orange_tshirt3.jpg']),
  ('Orange T-shirt', null, null, array['2026/orange_tshirt4.jpg']),
  ('Orange T-shirt', null, null, array['2026/orange_tshirt5.jpg']),
  ('Orange T-shirt', null, null, array['2026/orange_tshirt6.jpg']),
  ('White cap (1 of 2)', null, null, array['2026/white_hats.jpg']),
  ('White cap (2 of 2)', null, null, array['2026/white_hats.jpg']),
  ('White T-shirt', null, null, array['2026/white_tshirt.jpg'])
) as lots(title, size, description, image_paths);

commit;
