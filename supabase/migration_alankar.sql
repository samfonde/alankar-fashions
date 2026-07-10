-- =========================================
-- ALANKAR FASHIONS — REBRAND MIGRATION
-- Safe to re-run. Adds columns for SEO/inventory + reseeds categories/products.
-- Paste into: Supabase Dashboard > SQL Editor > New query > Run
-- =========================================

-- Add new columns (idempotent)
alter table public.products add column if not exists meta_title text;
alter table public.products add column if not exists meta_description text;
alter table public.products add column if not exists low_stock_threshold int default 5;
alter table public.products add column if not exists faqs jsonb default '[]'::jsonb;
alter table public.products add column if not exists material text;

-- Clean out old demo data
delete from public.products where sku like 'AUR-%';
delete from public.homepage_sections;
delete from public.categories;

-- Reseed categories with parent-child nesting
do $$
declare
  pearls uuid; trad uuid; neck uuid; bang uuid; ear uuid;
begin
  insert into public.categories (name, slug, sort_order) values ('Pearls','pearls',1) returning id into pearls;
  insert into public.categories (name, slug, sort_order) values ('Traditionals','traditionals',2) returning id into trad;
  insert into public.categories (name, slug, sort_order) values ('Necklace','necklace',3) returning id into neck;
  insert into public.categories (name, slug, sort_order) values ('Bangles','bangles',4) returning id into bang;
  insert into public.categories (name, slug, sort_order) values ('Earrings','earrings',5) returning id into ear;

  insert into public.categories (name, slug, parent_id, sort_order) values
    ('Chinchpeti','chinchpeti', pearls, 1),
    ('Tanmani','tanmani', pearls, 2),
    ('Nakelace','nakelace', pearls, 3),
    ('Kolhapuri Saj','kolhapuri-saj', trad, 1),
    ('Thushi','thushi', trad, 2),
    ('Jondhale Pot','jondhale-pot', trad, 3),
    ('Vjratik','vjratik', trad, 4),
    ('Short','short', neck, 1),
    ('Long','long', neck, 2),
    ('Kundan','kundan', neck, 3),
    ('Short AD Necklace','short-ad-necklace', neck, 4),
    ('Golden','golden', bang, 1),
    ('Silver','silver', bang, 2);
end $$;

-- Seed premium homepage sections for Alankar
insert into public.homepage_sections (section_key, section_type, title, data, is_active, sort_order) values
  ('announcement_bar','announcement','Announcement Bar',
    '{"text":"✨ Free shipping across India on orders above ₹999 • COD available • 15-day easy returns"}'::jsonb, true, 0),
  ('hero','hero','Hero Banner',
    '{"slides":[{"image":"https://images.unsplash.com/photo-1601821765780-754fa98637c1?q=85&w=2000","heading":"Adorn Your Grace","subheading":"Handcrafted Kolhapuri jewellery from Alankar Fashions","cta_label":"Shop Traditionals","cta_link":"/products?category=traditionals"},{"image":"https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=85&w=2000","heading":"The Kundan Edit","subheading":"Timeless silhouettes for every occasion","cta_label":"Explore Kundan","cta_link":"/products?category=kundan"},{"image":"https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=85&w=2000","heading":"स्त्रीचे सौंदर्य खुलवणारे","subheading":"Antique gold pearl sets, from our Kolhapur atelier","cta_label":"Shop Pearls","cta_link":"/products?category=pearls"}]}'::jsonb, true, 1),
  ('category_grid','categories','Shop by Category',
    '{"items":[{"title":"Traditionals","image":"https://images.unsplash.com/photo-1602752275197-9d1f6f5c9dbb?q=85&w=1200","link":"/products?category=traditionals"},{"title":"Pearls","image":"https://images.unsplash.com/photo-1618436917352-cd3d11ea94bc?q=85&w=1200","link":"/products?category=pearls"},{"title":"Necklace","image":"https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=85&w=1200","link":"/products?category=necklace"},{"title":"Bangles","image":"https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=85&w=1200","link":"/products?category=bangles"},{"title":"Earrings","image":"https://images.unsplash.com/photo-1535632066274-3ca419434a2b?q=85&w=1200","link":"/products?category=earrings"}]}'::jsonb, true, 2),
  ('featured','products','Featured Picks', '{"filter":"is_featured","limit":8}'::jsonb, true, 3),
  ('new_arrivals','products','New Arrivals', '{"filter":"is_new","limit":8}'::jsonb, true, 4),
  ('trending','products','Trending Now', '{"filter":"is_trending","limit":8}'::jsonb, true, 5),
  ('editorial','editorial','Editorial',
    '{"image":"https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=85&w=2000","heading":"Crafted in Kolhapur","subheading":"Every piece is finished by hand at our Mangalwar Peth workshop — with the same care since 1998.","cta_label":"Our Story","cta_link":"/products"}'::jsonb, true, 6);

-- Seed jewellery products
do $$
declare
  chinchpeti_c uuid; tanmani_c uuid; kolhapuri_c uuid; thushi_c uuid; jondhale_c uuid; vjratik_c uuid;
  short_c uuid; long_c uuid; kundan_c uuid; short_ad_c uuid;
  golden_c uuid; silver_c uuid; ear_c uuid;
begin
  select id into chinchpeti_c from public.categories where slug='chinchpeti';
  select id into tanmani_c from public.categories where slug='tanmani';
  select id into kolhapuri_c from public.categories where slug='kolhapuri-saj';
  select id into thushi_c from public.categories where slug='thushi';
  select id into jondhale_c from public.categories where slug='jondhale-pot';
  select id into vjratik_c from public.categories where slug='vjratik';
  select id into short_c from public.categories where slug='short';
  select id into long_c from public.categories where slug='long';
  select id into kundan_c from public.categories where slug='kundan';
  select id into short_ad_c from public.categories where slug='short-ad-necklace';
  select id into golden_c from public.categories where slug='golden';
  select id into silver_c from public.categories where slug='silver';
  select id into ear_c from public.categories where slug='earrings';

  insert into public.products (name, slug, description, price, discount_price, sku, images, category_id, stock, is_featured, is_new, is_trending, brand, sizes, colors, tags, material, rating_avg, rating_count, meta_title, meta_description, faqs) values
  ('Kolhapuri Saj Traditional Necklace','kolhapuri-saj-traditional-necklace','A signature Kolhapuri Saj in antique-gold finish. Hand-strung motifs in the traditional Maharashtrian style. Perfect for weddings, festive wear and cultural occasions.',3999,2999,'ALK-TR-001','["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=85&w=1200","https://images.unsplash.com/photo-1601821765780-754fa98637c1?q=85&w=1200"]'::jsonb, kolhapuri_c, 30, true, true, true, 'Alankar Fashions', ARRAY['One Size'], ARRAY['Antique Gold'], ARRAY['kolhapuri-saj','traditional','maharashtrian','wedding'], 'Brass base with antique gold plating', 4.8, 142, 'Kolhapuri Saj Traditional Necklace — Alankar Fashions Kolhapur', 'Authentic Kolhapuri Saj in antique gold finish. Hand-strung traditional Maharashtrian necklace from Alankar Fashions, Kolhapur. Free shipping across India.', '[{"q":"What is the material?","a":"Brass base with antique gold plating. Nickel-free and safe for daily wear."},{"q":"How to care for it?","a":"Store in a dry box, avoid contact with water, perfume and sweat. Clean gently with a soft cotton cloth."},{"q":"Is this real gold?","a":"No — this is artificial jewellery with antique gold plating, designed to look like traditional Kolhapuri gold jewellery at an accessible price."}]'::jsonb),

  ('Thushi Handcrafted Choker','thushi-handcrafted-choker','A classic Thushi choker made from tightly woven antique-gold beads. Snug fit at the neck; a Maharashtrian bridal staple.',5499,4299,'ALK-TR-002','["https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=85&w=1200"]'::jsonb, thushi_c, 25, true, true, false, 'Alankar Fashions', ARRAY['Adjustable'], ARRAY['Antique Gold'], ARRAY['thushi','choker','traditional','bridal'], 'Brass with antique gold finish', 4.9, 98, 'Thushi Handcrafted Choker Necklace', 'Traditional Maharashtrian Thushi choker in antique gold finish, from Alankar Fashions Kolhapur.', '[]'::jsonb),

  ('Chinchpeti Pearl Choker','chinchpeti-pearl-choker','Delicate freshwater-style pearls set in an antique-gold Chinchpeti — the classic Marathi pearl choker.',2799,2199,'ALK-PL-001','["https://images.unsplash.com/photo-1618436917352-cd3d11ea94bc?q=85&w=1200"]'::jsonb, chinchpeti_c, 40, true, false, true, 'Alankar Fashions', ARRAY['Adjustable'], ARRAY['Ivory Pearl','Gold'], ARRAY['chinchpeti','pearl','choker'], 'Faux pearls with gold-plated brass', 4.7, 76, 'Chinchpeti Pearl Choker — Alankar Fashions', 'Classic Maharashtrian Chinchpeti pearl choker. Handcrafted in Kolhapur by Alankar Fashions.', '[]'::jsonb),

  ('Tanmani Pearl Pendant Set','tanmani-pearl-pendant','Signature Tanmani pearl pendant with matching earrings — the traditional Marathi pearl set.',3299,2599,'ALK-PL-002','["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=85&w=1200"]'::jsonb, tanmani_c, 30, true, true, false, 'Alankar Fashions', ARRAY['One Size'], ARRAY['White Pearl','Gold'], ARRAY['tanmani','pearl','pendant','set'], 'Faux pearls with gold-plated brass', 4.6, 54, 'Tanmani Pearl Pendant Set', 'Tanmani pearl set with matching earrings, hand-finished in Kolhapur.', '[]'::jsonb),

  ('Kundan Bridal Necklace Set','kundan-bridal-necklace-set','Regal Kundan necklace set with meenakari work and pearl drops. Includes matching earrings.',7999,5999,'ALK-NK-001','["https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=85&w=1200"]'::jsonb, kundan_c, 15, true, true, true, 'Alankar Fashions', ARRAY['One Size'], ARRAY['Multicolor Kundan'], ARRAY['kundan','bridal','set'], 'Kundan stones with meenakari brass base', 4.9, 87, 'Kundan Bridal Necklace Set', 'Regal Kundan bridal necklace set with matching earrings from Alankar Fashions Kolhapur.', '[]'::jsonb),

  ('Jondhale Pot Necklace','jondhale-pot-necklace','Jondhale Pot design in antique gold — a distinctly Maharashtrian statement piece.',4499,3499,'ALK-TR-003','["https://images.unsplash.com/photo-1601821765780-754fa98637c1?q=85&w=1200"]'::jsonb, jondhale_c, 20, false, true, true, 'Alankar Fashions', ARRAY['One Size'], ARRAY['Antique Gold'], ARRAY['jondhale-pot','traditional'], 'Antique gold-plated brass', 4.5, 42, 'Jondhale Pot Traditional Necklace', 'Handcrafted Jondhale Pot in antique gold finish from Alankar Fashions.', '[]'::jsonb),

  ('Vjratik Traditional Pendant','vjratik-traditional-pendant','Vjratik pendant crafted in antique gold with intricate Maharashtrian motifs.',2999,2399,'ALK-TR-004','["https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=85&w=1200"]'::jsonb, vjratik_c, 25, false, true, false, 'Alankar Fashions', ARRAY['One Size'], ARRAY['Antique Gold'], ARRAY['vjratik','pendant','traditional'], 'Antique gold-plated brass', 4.6, 34, 'Vjratik Traditional Pendant', 'Vjratik pendant with intricate Maharashtrian motifs, Alankar Fashions Kolhapur.', '[]'::jsonb),

  ('Short AD Diamond Necklace','short-ad-diamond-necklace','Short American-Diamond necklace with rhodium finish. Perfect party wear.',3499,2799,'ALK-NK-002','["https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=85&w=1200"]'::jsonb, short_ad_c, 35, true, false, true, 'Alankar Fashions', ARRAY['Adjustable'], ARRAY['Silver','Rose Gold'], ARRAY['ad','american-diamond','short','necklace'], 'Rhodium-plated brass with AD stones', 4.7, 61, 'Short AD Diamond Necklace', 'Short American Diamond necklace with rhodium finish, Alankar Fashions.', '[]'::jsonb),

  ('Long Rani Haar','long-rani-haar','A regal Rani Haar in antique gold with pearl and stone accents.',5999,4499,'ALK-NK-003','["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=85&w=1200"]'::jsonb, long_c, 18, true, false, true, 'Alankar Fashions', ARRAY['One Size'], ARRAY['Antique Gold','Pearl'], ARRAY['rani-haar','long','bridal'], 'Antique gold-plated brass with pearls', 4.8, 55, 'Long Rani Haar Bridal Necklace', 'Regal Rani Haar in antique gold with pearl accents, Alankar Fashions Kolhapur.', '[]'::jsonb),

  ('Golden Kada Bangles — Pair','golden-kada-bangles','Golden Kada pair in antique-gold finish with detailed engraving. Comfortable hollow design.',2499,1899,'ALK-BG-001','["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=85&w=1200"]'::jsonb, golden_c, 50, true, true, false, 'Alankar Fashions', ARRAY['2.4','2.6','2.8'], ARRAY['Antique Gold'], ARRAY['kada','bangles','golden'], 'Antique gold-plated brass', 4.6, 118, 'Golden Kada Bangles Pair', 'Golden Kada bangles pair from Alankar Fashions Kolhapur.', '[]'::jsonb),

  ('Silver Oxidised Bangles','silver-oxidised-bangles','Set of 4 oxidised silver bangles with tribal motifs.',1799,1299,'ALK-BG-002','["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=85&w=1200"]'::jsonb, silver_c, 60, false, true, true, 'Alankar Fashions', ARRAY['2.4','2.6','2.8'], ARRAY['Oxidised Silver'], ARRAY['silver','oxidised','bangles'], 'Oxidised silver-plated brass', 4.5, 89, 'Silver Oxidised Bangles Set', 'Set of 4 oxidised silver bangles with tribal motifs.', '[]'::jsonb),

  ('Jhumka Antique Earrings','jhumka-antique-earrings','Classic antique-gold Jhumkas with pearl drops. Lightweight and comfortable.',999,749,'ALK-ER-001','["https://images.unsplash.com/photo-1535632066274-3ca419434a2b?q=85&w=1200"]'::jsonb, ear_c, 80, true, true, true, 'Alankar Fashions', ARRAY['One Size'], ARRAY['Antique Gold','Pearl'], ARRAY['jhumka','earrings','traditional'], 'Antique gold-plated brass', 4.7, 234, 'Jhumka Antique Earrings', 'Classic antique-gold Jhumka earrings with pearl drops from Alankar Fashions.', '[]'::jsonb),

  ('Kundan Chandbali Earrings','kundan-chandbali-earrings','Statement Kundan Chandbali earrings with pearl drops. Regal moon-shaped design.',1799,1399,'ALK-ER-002','["https://images.unsplash.com/photo-1535632066274-3ca419434a2b?q=85&w=1200"]'::jsonb, ear_c, 40, true, false, true, 'Alankar Fashions', ARRAY['One Size'], ARRAY['Multicolor Kundan'], ARRAY['chandbali','kundan','earrings','bridal'], 'Kundan stones with brass base', 4.8, 76, 'Kundan Chandbali Earrings', 'Statement Kundan Chandbali earrings with pearl drops.', '[]'::jsonb);
end $$;

-- Coupons
delete from public.coupons where code in ('WELCOME10','FLAT500');
insert into public.coupons (code, discount_type, discount_value, min_order_value, is_active, valid_until) values
  ('ALANKAR10','percent',10,999,true, now() + interval '365 days'),
  ('FIRSTORDER','fixed',300,1499,true, now() + interval '365 days')
on conflict (code) do nothing;

-- Settings for brand, analytics, SEO, payment, shipping
insert into public.settings (key, value) values
  ('brand', '{"name":"Alankar Fashions","tagline":"स्त्रीचे सौंदर्य खुलवणारे","support_email":"hello@alankarfashions.com","support_phone":"+91 96570 93006","address":"Shop No 1, 1354 B Ward, near Khari Corner, Mangalwar Peth, Kolhapur, Maharashtra 416012","city":"Kolhapur","state":"Maharashtra","pincode":"416012","instagram":"https://www.instagram.com/alankar_fashions_kop/","facebook":"https://www.facebook.com/AlankarFashion/","google_business":"https://share.google/kRzsRLyqmPIpjdMni","whatsapp_message":"Hi Alankar Fashions! I have a question about your jewellery.","logo_url":null,"favicon_url":null,"gstin":""}'::jsonb),
  ('analytics', '{"meta_pixel_id":"","ga4_id":""}'::jsonb),
  ('seo', '{"description":"Alankar Fashions — handcrafted artificial jewellery from Kolhapur. Traditional Kolhapuri Saj, Thushi, Kundan, pearl sets, bangles and earrings.","gsc_verification":""}'::jsonb)
on conflict (key) do update set value = excluded.value;

-- Ensure Razorpay settings placeholder exists
insert into public.settings (key, value) values
  ('payment_razorpay', '{"key_id":"","key_secret":"","webhook_secret":"","live_mode":false}'::jsonb)
on conflict (key) do nothing;

select 'Alankar Fashions migration applied' as status;
