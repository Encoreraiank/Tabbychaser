-- ==========================================
-- TABBY CHASER DATABASE SCHEMA SETUP (v3.0)
-- Run these commands in your Supabase SQL Editor
-- ==========================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text,
  address text,
  city text,
  state text,
  pin text,
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow users to insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2. ORDERS TABLE
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_reference text not null unique,
  user_id uuid references auth.users on delete set null,
  email text not null,
  name text not null,
  phone text,
  address text not null,
  instagram text,
  notes text,
  items jsonb not null,
  subtotal numeric not null,
  discount numeric default 0,
  shipping numeric not null,
  total numeric not null,
  payment_method text not null,
  status text default 'pending',
  tracking_id text,
  courier_name text,
  created_at timestamp with time zone default now()
);

alter table public.orders enable row level security;
create policy "Allow users to view their own orders" on public.orders for select using (auth.uid() = user_id or auth.role() = 'service_role');
create policy "Allow anonymous and authenticated orders insertion" on public.orders for insert with check (true);
create policy "Allow admin select access to all orders" on public.orders for select using (true);
create policy "Allow admin update access to all orders" on public.orders for update using (true);

-- 3. CUSTOM ORDERS TABLE
create table if not exists public.custom_orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  email text not null,
  pet_name text not null,
  pet_type text not null,
  special_notes text,
  subtotal numeric not null,
  shipping numeric not null,
  total numeric not null,
  status text default 'pending',
  tracking_id text,
  courier_name text,
  created_at timestamp with time zone default now()
);

alter table public.custom_orders enable row level security;
create policy "Allow users to view their own custom orders" on public.custom_orders for select using (auth.uid() = user_id or auth.role() = 'service_role');
create policy "Allow anonymous and authenticated custom orders insertion" on public.custom_orders for insert with check (true);
create policy "Allow admin select access to all custom orders" on public.custom_orders for select using (true);
create policy "Allow admin update access to all custom orders" on public.custom_orders for update using (true);

-- 4. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  image text,
  sort_order integer default 0,
  visible boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.categories enable row level security;
create policy "Allow public read categories" on public.categories for select using (true);
create policy "Allow admin write categories" on public.categories for all using (true);

-- 5. PRODUCTS TABLE (Comprehensive)
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text,
  description text,
  short_description text,
  price numeric not null,
  compare_price numeric,
  cost_price numeric,
  category text,
  tags text[],
  stock integer default 0,
  sku text,
  status text default 'published', -- published, draft, archived
  badge text, -- Bestseller, Featured, Popular, Only X Left, Limited Edition, New Arrival
  handmade_duration text default '4-5 weeks',
  weight text,
  materials text,
  care_instructions text,
  dimensions text,
  seo_title text,
  seo_description text,
  images text[],
  featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.products enable row level security;
create policy "Allow public read access to products" on public.products for select using (true);
create policy "Allow admin full products access" on public.products for all using (true);

-- 6. COUPONS TABLE
create table if not exists public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  type text not null check (type in ('percent', 'flat', 'free_shipping')),
  value numeric default 0,
  min_order_value numeric default 0,
  usage_limit integer default 0,
  used_count integer default 0,
  expiry date,
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.coupons enable row level security;
create policy "Allow public read of active coupons" on public.coupons for select using (active = true);
create policy "Allow admin full access to coupons" on public.coupons for all using (true);

-- 7. REVIEWS TABLE
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products on delete cascade,
  customer_name text not null,
  email text,
  rating integer check (rating >= 1 and rating <= 5),
  title text,
  body text not null,
  status text default 'pending', -- pending, approved, hidden
  featured boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;
create policy "Allow public read approved reviews" on public.reviews for select using (status = 'approved');
create policy "Allow public write review" on public.reviews for insert with check (true);
create policy "Allow admin full reviews access" on public.reviews for all using (true);

-- 8. SITE SETTINGS TABLE (Homepage manager, Announcement, Meta Pixel, Store Settings)
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamp with time zone default now()
);

alter table public.site_settings enable row level security;
create policy "Allow public read of site settings" on public.site_settings for select using (true);
create policy "Allow admin write to site settings" on public.site_settings for all using (true);

-- Default categories insertion
insert into public.categories (name, slug, description, sort_order) values
  ('Charms', 'charms', 'Handmade clay charms for bags, phones, and accessories', 1),
  ('Keychains', 'keychains', 'Cute polymer clay keychains', 2),
  ('Desk Pals', 'desk-pals', 'Little ceramic & clay desk companions', 3),
  ('Sticker Sheets', 'stickers', 'Adorable vinyl and paper stickers', 4),
  ('Worry Stones', 'worry-stones', 'Smooth clay worry stones for stress relief', 5),
  ('Figurines', 'figurines', 'Custom clay mini figures', 6),
  ('Custom Orders', 'custom-orders', 'Personalized pet figurines and charms', 7)
on conflict (name) do nothing;
