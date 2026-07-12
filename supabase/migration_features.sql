-- =============================================================
-- Alankar Fashions — Feature migration (COD + Product/Category expansion)
-- SAFE / ADDITIVE — never drops or alters existing data.
-- Run this once in Supabase SQL editor.
-- =============================================================

-- Orders: payment_method + cod_fee + notes (nullable, additive)
alter table if exists public.orders add column if not exists payment_method text default 'online';
alter table if exists public.orders add column if not exists cod_fee numeric(12,2);
alter table if exists public.orders add column if not exists notes text;

-- Allow new payment_status value: 'cod_pending' (required for COD orders).
-- Live production has an existing CHECK constraint on orders.payment_status limiting values to
-- ('pending','paid','failed','refunded'). We drop and re-add it with 'cod_pending' included.
-- This is SAFE: no existing rows use 'cod_pending', so the new constraint validates cleanly.
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema='public' and table_name='orders'
      and constraint_type='CHECK' and constraint_name='orders_payment_status_check'
  ) then
    alter table public.orders drop constraint orders_payment_status_check;
  end if;
  alter table public.orders
    add constraint orders_payment_status_check
    check (payment_status in ('pending','paid','failed','refunded','cod_pending'));
end $$;

-- Products: jewellery-specific fields
alter table if exists public.products add column if not exists material text;
alter table if exists public.products add column if not exists weight_grams numeric(10,2);
alter table if exists public.products add column if not exists care_instructions text;
alter table if exists public.products add column if not exists low_stock_threshold integer;
alter table if exists public.products add column if not exists set_group text;
alter table if exists public.products add column if not exists is_bestseller boolean default false;

-- Categories: banner, description, is_featured
alter table if exists public.categories add column if not exists banner_url text;
alter table if exists public.categories add column if not exists description text;
alter table if exists public.categories add column if not exists is_featured boolean default false;
alter table if exists public.categories add column if not exists updated_at timestamptz default now();

-- Settings: seed COD config with sensible defaults (only inserts if row missing)
insert into public.settings (key, value) values
  ('cod', '{"enabled":true,"fee":0,"min_order":0,"max_order":15000}'::jsonb)
on conflict (key) do nothing;

-- Helpful index for admin listings
create index if not exists idx_orders_payment_method on public.orders (payment_method);
create index if not exists idx_products_bestseller on public.products (is_bestseller) where is_bestseller = true;
create index if not exists idx_categories_featured on public.categories (is_featured) where is_featured = true;

select 'Alankar Fashions feature migration applied' as status;
