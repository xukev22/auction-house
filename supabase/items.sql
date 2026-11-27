-- The catalog table: only what's for sale. Bids, winners and which lot is up live in their own tables.
-- Already run once (SQL Editor). The lots themselves are in lots.sql.

create table public.items (
  id bigint generated always as identity primary key,
  lot_number int not null unique,
  title text not null,
  -- Optional free text, e.g. 'M', 'XL', 'One size', '10.5'.
  size text,
  description text,
  -- Paths inside the "lots" storage bucket, cover photo first.
  image_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Anyone can browse the catalog. Only you (from the dashboard) can add or change lots.
alter table public.items enable row level security;
create policy "Anyone can view lots" on public.items for select to anon, authenticated using (true);
grant select on public.items to anon, authenticated;
