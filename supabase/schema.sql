-- =========================================
-- AURELIA FASHION E-COMMERCE — SCHEMA + RLS + SEED
-- Paste this entire file into: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT).
-- =========================================

create extension if not exists "pgcrypto";

-- ========== TABLES ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text, phone text,
  line1 text, line2 text,
  city text, state text, pincode text,
  country text default 'India',
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references public.categories(id) on delete set null,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  discount_price numeric(10,2),
  sku text unique,
  images jsonb not null default '[]'::jsonb,
  category_id uuid references public.categories(id) on delete set null,
  stock int not null default 0,
  status text not null default 'published' check (status in ('draft','published','archived')),
  is_featured boolean default false,
  is_new boolean default false,
  is_trending boolean default false,
  brand text,
  tags text[] default '{}',
  sizes text[] default '{}',
  colors text[] default '{}',
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create extension if not exists pg_trgm;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  color text,
  stock int not null default 0,
  price_delta numeric(10,2) default 0,
  sku text
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  max_discount numeric(10,2),
  usage_limit int,
  usage_count int default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  phone text,
  status text not null default 'pending' check (status in ('pending','processing','shipped','out_for_delivery','delivered','cancelled','refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded','cod_pending')),
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  shipping_address jsonb,
  items jsonb not null default '[]'::jsonb,
  razorpay_order_id text,
  razorpay_payment_id text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text, body text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  admin_email text,
  action text not null,
  entity text,
  entity_id text,
  changes jsonb,
  created_at timestamptz default now()
);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  section_type text not null,
  title text,
  data jsonb not null default '{}'::jsonb,
  is_active boolean default true,
  sort_order int default 0,
  updated_at timestamptz default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- ========== HELPER FUNCTION: is_admin() ==========
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- ========== TRIGGER: create profile on signup ==========
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ========== RLS ==========
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.wishlists enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.settings enable row level security;

-- profiles
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = 'customer');

-- addresses
drop policy if exists "addr_owner_all" on public.addresses;
create policy "addr_owner_all" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- categories: public read, admin write
drop policy if exists "cat_public_read" on public.categories;
create policy "cat_public_read" on public.categories for select using (true);
drop policy if exists "cat_admin_write" on public.categories;
create policy "cat_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- products: public read published, admin all
drop policy if exists "prod_public_read" on public.products;
create policy "prod_public_read" on public.products for select using (status = 'published' or public.is_admin());
drop policy if exists "prod_admin_write" on public.products;
create policy "prod_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "pv_public_read" on public.product_variants;
create policy "pv_public_read" on public.product_variants for select using (true);
drop policy if exists "pv_admin_write" on public.product_variants;
create policy "pv_admin_write" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

-- wishlists
drop policy if exists "wl_owner_all" on public.wishlists;
create policy "wl_owner_all" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- coupons: public read active, admin write
drop policy if exists "coupon_read_active" on public.coupons;
create policy "coupon_read_active" on public.coupons for select using (is_active or public.is_admin());
drop policy if exists "coupon_admin_write" on public.coupons;
create policy "coupon_admin_write" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- orders: user sees own, admin all
drop policy if exists "orders_owner_read" on public.orders;
create policy "orders_owner_read" on public.orders for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "orders_admin_write" on public.orders;
create policy "orders_admin_write" on public.orders for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "osh_owner_read" on public.order_status_history;
create policy "osh_owner_read" on public.order_status_history for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "osh_admin_write" on public.order_status_history;
create policy "osh_admin_write" on public.order_status_history for all using (public.is_admin()) with check (public.is_admin());

-- reviews
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);
drop policy if exists "reviews_owner_write" on public.reviews;
create policy "reviews_owner_write" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "reviews_owner_delete" on public.reviews;
create policy "reviews_owner_delete" on public.reviews for delete using (auth.uid() = user_id or public.is_admin());

-- audit log
drop policy if exists "audit_admin_read" on public.admin_audit_log;
create policy "audit_admin_read" on public.admin_audit_log for select using (public.is_admin());

-- homepage_sections: public read active, admin write
drop policy if exists "hp_public_read" on public.homepage_sections;
create policy "hp_public_read" on public.homepage_sections for select using (is_active or public.is_admin());
drop policy if exists "hp_admin_write" on public.homepage_sections;
create policy "hp_admin_write" on public.homepage_sections for all using (public.is_admin()) with check (public.is_admin());

-- settings: admin only
drop policy if exists "settings_admin_all" on public.settings;
create policy "settings_admin_all" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- ========== STORAGE BUCKET (public) ==========
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ========== SEED DATA ==========
insert into public.categories (name, slug, sort_order) values
  ('Men', 'men', 1),
  ('Women', 'women', 2),
  ('Accessories', 'accessories', 3),
  ('Footwear', 'footwear', 4)
on conflict (slug) do nothing;

insert into public.homepage_sections (section_key, section_type, title, data, is_active, sort_order) values
  ('announcement_bar','announcement','Announcement Bar',
    '{"text":"Free Shipping on orders above ₹999 • Easy 15-day returns • Now shipping across India"}'::jsonb, true, 0),
  ('hero','hero','Hero Banner',
    '{"slides":[{"image":"https://images.unsplash.com/photo-1596993100471-c3905dafa78e?q=85&w=2000","heading":"The Summer Edit","subheading":"Refined essentials in linen, silk & cotton","cta_label":"Shop New Arrivals","cta_link":"/products?filter=new"},{"image":"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=85&w=2000","heading":"Timeless. Effortless.","subheading":"Discover the Aurelia SS25 collection","cta_label":"Explore Women","cta_link":"/products?category=women"}]}'::jsonb,
    true, 1),
  ('category_grid','categories','Shop by Category',
    '{"items":[{"title":"Women","image":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=85&w=1200","link":"/products?category=women"},{"title":"Men","image":"https://images.unsplash.com/photo-1603189343302-e603f7add05a?q=85&w=1200","link":"/products?category=men"},{"title":"Accessories","image":"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=85&w=1200","link":"/products?category=accessories"},{"title":"Footwear","image":"https://images.unsplash.com/photo-1678266622859-ea0555a32952?q=85&w=1200","link":"/products?category=footwear"}]}'::jsonb,
    true, 2),
  ('featured','products','Featured Picks', '{"filter":"is_featured","limit":8}'::jsonb, true, 3),
  ('new_arrivals','products','New Arrivals', '{"filter":"is_new","limit":8}'::jsonb, true, 4),
  ('trending','products','Trending Now', '{"filter":"is_trending","limit":8}'::jsonb, true, 5),
  ('editorial','editorial','Editorial',
    '{"image":"https://images.unsplash.com/photo-1562151270-c7d22ceb586a?q=85&w=2000","heading":"Crafted for the modern wardrobe","subheading":"Every piece designed in India, made to last","cta_label":"Our Story","cta_link":"/products"}'::jsonb,
    true, 6)
on conflict (section_key) do nothing;

-- Seed products (12 items with real images)
do $$
declare
  cat_men uuid;
  cat_women uuid;
  cat_acc uuid;
  cat_foot uuid;
begin
  select id into cat_men from public.categories where slug='men';
  select id into cat_women from public.categories where slug='women';
  select id into cat_acc from public.categories where slug='accessories';
  select id into cat_foot from public.categories where slug='footwear';

  insert into public.products (name, slug, description, price, discount_price, sku, images, category_id, stock, is_featured, is_new, is_trending, brand, sizes, colors, tags, rating_avg, rating_count) values
  ('Ivory Linen Shirt','ivory-linen-shirt','A breathable pure-linen shirt cut for effortless summer style. Mother-of-pearl buttons, relaxed fit.',2499,1899,'AUR-M-001','["https://images.unsplash.com/photo-1603189343302-e603f7add05a?q=85&w=1200","https://images.unsplash.com/photo-1596993100471-c3905dafa78e?q=85&w=1200"]'::jsonb, cat_men, 45, true, true, false, 'Aurelia', ARRAY['S','M','L','XL'], ARRAY['Ivory','Sand','Sage'], ARRAY['linen','shirt','summer'], 4.6, 128),
  ('Slim Fit Formal Trouser','slim-fit-formal-trouser','Tailored slim-fit trouser in premium wool-blend. Perfect for the boardroom.',3299,2499,'AUR-M-002','["https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?q=85&w=1200"]'::jsonb, cat_men, 30, true, false, true, 'Aurelia', ARRAY['30','32','34','36','38'], ARRAY['Charcoal','Navy','Black'], ARRAY['formal','trouser'], 4.5, 89),
  ('Overshirt in Camel Wool','overshirt-camel-wool','A modern layering piece. Structured camel wool overshirt with horn buttons.',5999,4999,'AUR-M-003','["https://images.unsplash.com/photo-1549439602-43ebca2327af?q=85&w=1200"]'::jsonb, cat_men, 20, true, true, true, 'Aurelia', ARRAY['S','M','L','XL'], ARRAY['Camel','Charcoal'], ARRAY['jacket','overshirt','wool'], 4.8, 56),
  ('Silk Slip Dress','silk-slip-dress','Bias-cut mulberry silk slip dress. A modern classic, dresses up or down.',6499,5499,'AUR-W-001','["https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=85&w=1200","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=85&w=1200"]'::jsonb, cat_women, 25, true, true, true, 'Aurelia', ARRAY['XS','S','M','L'], ARRAY['Champagne','Rose','Onyx'], ARRAY['dress','silk','evening'], 4.9, 210),
  ('The Everyday Cotton Tee','everyday-cotton-tee','Weightless supima cotton tee. Cut in Portugal, made to last.',1299,999,'AUR-W-002','["https://images.unsplash.com/photo-1604506847073-4a8e18e07d92?q=85&w=1200"]'::jsonb, cat_women, 80, false, true, false, 'Aurelia', ARRAY['XS','S','M','L','XL'], ARRAY['White','Black','Sage','Blush'], ARRAY['basics','tee','cotton'], 4.4, 340),
  ('High-Rise Wide Leg Jeans','wide-leg-jeans','Rigid selvedge denim in a flattering high-rise, wide-leg silhouette.',3999,3299,'AUR-W-003','["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=85&w=1200"]'::jsonb, cat_women, 40, true, false, true, 'Aurelia', ARRAY['24','26','28','30','32'], ARRAY['Indigo','Ecru'], ARRAY['denim','jeans'], 4.7, 175),
  ('Cashmere Crewneck Sweater','cashmere-sweater','Grade-A Mongolian cashmere. Soft, warm, timeless.',7499,5999,'AUR-W-004','["https://images.unsplash.com/photo-1574015974293-817f0ebebb74?q=85&w=1200"]'::jsonb, cat_women, 18, true, true, false, 'Aurelia', ARRAY['XS','S','M','L'], ARRAY['Cream','Camel','Charcoal'], ARRAY['knitwear','cashmere'], 4.9, 92),
  ('Structured Leather Tote','structured-leather-tote','Handcrafted full-grain leather tote. Fits a 13" laptop.',8999,7499,'AUR-A-001','["https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=85&w=1200","https://images.unsplash.com/photo-1589363358751-ab05797e5629?q=85&w=1200"]'::jsonb, cat_acc, 15, true, true, true, 'Aurelia', ARRAY['One Size'], ARRAY['Cognac','Black','Bone'], ARRAY['bag','leather','tote'], 4.8, 63),
  ('Minimalist Watch — Ivory','minimalist-watch-ivory','Swiss-quartz movement, sapphire crystal, italian leather strap.',9999,8499,'AUR-A-002','["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=85&w=1200"]'::jsonb, cat_acc, 22, false, true, true, 'Aurelia', ARRAY['One Size'], ARRAY['Ivory','Black'], ARRAY['watch','accessories'], 4.7, 41),
  ('Aviator Sunglasses','aviator-sunglasses','Titanium frame aviators with polarized lenses.',3499,2799,'AUR-A-003','["https://images.unsplash.com/photo-1508296695146-257a814070b4?q=85&w=1200"]'::jsonb, cat_acc, 50, true, false, false, 'Aurelia', ARRAY['One Size'], ARRAY['Gold','Silver','Black'], ARRAY['sunglasses','eyewear'], 4.5, 138),
  ('Suede Chelsea Boot','suede-chelsea-boot','Italian suede Chelsea boot on a leather sole.',7999,6499,'AUR-F-001','["https://images.unsplash.com/photo-1678266622859-ea0555a32952?q=85&w=1200"]'::jsonb, cat_foot, 24, true, true, true, 'Aurelia', ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'], ARRAY['Camel','Brown','Black'], ARRAY['boot','suede'], 4.8, 74),
  ('Leather Loafer','leather-loafer','Hand-stitched full-grain leather penny loafer.',6499,5299,'AUR-F-002','["https://images.unsplash.com/photo-1630386474440-8f2e6d752a98?q=85&w=1200"]'::jsonb, cat_foot, 30, false, true, false, 'Aurelia', ARRAY['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'], ARRAY['Cognac','Black'], ARRAY['loafer','shoes'], 4.6, 58)
  on conflict (slug) do nothing;
end $$;

insert into public.coupons (code, discount_type, discount_value, min_order_value, is_active, valid_until) values
  ('WELCOME10','percent',10,1000,true, now() + interval '365 days'),
  ('FLAT500','fixed',500,2999,true, now() + interval '365 days')
on conflict (code) do nothing;

insert into public.settings (key, value) values
  ('payment_razorpay', '{"key_id":"","webhook_secret":"","live_mode":false}'::jsonb),
  ('brand', '{"name":"Aurelia","tagline":"Considered fashion. Crafted in India.","support_email":"hello@aurelia.example","support_phone":"+91 90000 00000"}'::jsonb)
on conflict (key) do nothing;

-- ========== AUTO-PROMOTE DEFAULT ADMIN ==========
-- Promotes admin@aurelia.local (pre-created auth user) to admin role.
insert into public.profiles (id, email, full_name, role)
select id, email, 'Aurelia Admin', 'admin' from auth.users where email = 'admin@aurelia.local'
on conflict (id) do update set role = 'admin', full_name = coalesce(public.profiles.full_name, excluded.full_name);

-- ========== DONE ==========
select 'Aurelia schema installed successfully' as status;
