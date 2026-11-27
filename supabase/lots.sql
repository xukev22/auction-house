-- Every lot in the catalog. Edit this file, then run it in the SQL Editor: it replaces all the lots.
-- Lot numbers follow the order of the lines below. Copies of the same thing share a photo.
-- Safe to rerun until a game uses these lots. After that the database refuses (bids and sales
-- point at these rows), so delete any test games first (Table Editor -> games).
--
-- Order: hats and tops take turns, copies are spread across the night, and the
-- hoodies and jersey are saved for the middle and the end.
-- Sizes are guesses ('One size' for hats, 'L' for tops). Fix them here.

begin;

-- Columns added after items.sql was first run.
alter table public.items add column if not exists type text;

delete from public.items;

insert into public.items (lot_number, title, type, size, description, image_paths)
select row_number() over (), title, type, size, description, image_paths
from (values
  ('Hackathon shirt', 'T-shirt', 'L', 'White tee with a small patch on the front and a big hackathon badge on the back.', array['2026/hackathon/hackathon_front.jpg', '2026/hackathon/hackathon_back.jpg']),
  ('Beanie (1 of 4)', 'Hat', 'One size', 'Black knit beanie with Klaviyo embroidered on the cuff.', array['2026/beanies.jpg']),
  ('Orange T-shirt', 'T-shirt', 'L', 'Orange tee with a small Klaviyo logo on the chest.', array['2026/orange_tshirt.jpg']),
  ('Red BOS cap', 'Hat', 'One size', 'Red cap with BOS embroidered on the front.', array['2026/bos_hats.jpg']),
  ('Grey hoodie', 'Hoodie', 'L', 'Charcoal pullover hoodie with a small patch on the chest and a front pocket.', array['2026/grey_hoodie.jpg']),
  ('White cap (1 of 2)', 'Hat', 'One size', 'White Klaviyo trucker cap with a mesh back. Stickers still on.', array['2026/white_hats.jpg']),
  ('Orange long sleeve', 'Long sleeve', 'L', 'Orange long sleeve with Klaviyo across the chest.', array['2026/orange_tshirt3.jpg']),
  ('Beanie (2 of 4)', 'Hat', 'One size', 'Black knit beanie with Klaviyo embroidered on the cuff.', array['2026/beanies.jpg']),
  ('White T-shirt', 'T-shirt', 'L', 'White tee with a red Klaviyo logo across the chest.', array['2026/white_tshirt.jpg']),
  ('Black cap (1 of 2)', 'Hat', 'One size', 'Black cap with a small white patch on the front. Stickers still on.', array['2026/hats2.jpg']),
  ('Orange T-shirt', 'T-shirt', 'L', 'Orange tee with Klaviyo printed in the middle of the chest.', array['2026/orange_tshirt2.jpg']),
  ('Beanie with pom pom', 'Hat', 'One size', 'Black Klaviyo beanie with a pom pom on top.', array['2026/beanies.jpg']),
  ('Orange hoodie', 'Hoodie', 'L', 'Orange pullover hoodie with a small patch on the chest.', array['2026/orange_hoodie.jpg']),
  ('Black BOS cap', 'Hat', 'One size', 'Dark cap with BOS embroidered on the front.', array['2026/bos_hats.jpg']),
  ('Klaviyo BFCM', 'T-shirt', 'L', 'White Black Friday Cyber Monday tee with a small patch on the front and a big Klaviyo crest on the back.', array['2026/klaviyo_bfcm/bfcm_front.jpg', '2026/klaviyo_bfcm/bfcm_back.jpg']),
  ('Beanie (3 of 4)', 'Hat', 'One size', 'Black knit beanie with Klaviyo embroidered on the cuff.', array['2026/beanies.jpg']),
  ('Orange pocket tee', 'T-shirt', 'L', 'Orange tee with Klaviyo printed on the chest pocket.', array['2026/orange_tshirt5.jpg']),
  ('White cap (2 of 2)', 'Hat', 'One size', 'White Klaviyo trucker cap with a mesh back. Stickers still on.', array['2026/white_hats.jpg']),
  ('Black long sleeve', 'Long sleeve', 'L', 'Black long sleeve with a big white Klaviyo logo across the chest.', array['2026/black_tshirt.jpg']),
  ('Grey cap', 'Hat', 'One size', 'Grey cap, brand new with the tag still on.', array['2026/bos_hats.jpg']),
  ('Orange T-shirt', 'T-shirt', 'L', 'Orange tee with a small Klaviyo logo on the chest.', array['2026/orange_tshirt4.jpg']),
  ('Black cap (2 of 2)', 'Hat', 'One size', 'Black cap with a small white patch on the front. Stickers still on.', array['2026/hats2.jpg']),
  ('Orange T-shirt', 'T-shirt', 'L', 'Orange tee with a small Klaviyo logo on the chest.', array['2026/orange_tshirt6.jpg']),
  ('Beanie (4 of 4)', 'Hat', 'One size', 'Black knit beanie with Klaviyo embroidered on the cuff.', array['2026/beanies.jpg']),
  ('Black hoodie', 'Hoodie', 'L', 'Black pullover hoodie with a small patch on the chest.', array['2026/black_hoodie.jpg']),
  ('Jersey', 'Jersey', 'L', 'White mesh jersey with a small red patch on the chest.', array['2026/jersey.jpg'])
) as lots(title, type, size, description, image_paths);

commit;
