-- ==========================================
-- TABBY CHASER DATABASE SCHEMA SETUP
-- Run these commands in your Supabase SQL Editor
-- ==========================================

-- 1. PROFILES TABLE (Linked to auth.users)
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

create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow users to insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);


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
  created_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

create policy "Allow users to view their own orders" on public.orders
  for select using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "Allow anonymous and authenticated orders insertion" on public.orders
  for insert with check (true);

create policy "Allow admin select access to all orders" on public.orders
  for select using (true);

create policy "Allow admin update access to all orders" on public.orders
  for update using (true);


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
  created_at timestamp with time zone default now()
);

alter table public.custom_orders enable row level security;

create policy "Allow users to view their own custom orders" on public.custom_orders
  for select using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "Allow anonymous and authenticated custom orders insertion" on public.custom_orders
  for insert with check (true);

create policy "Allow admin select access to all custom orders" on public.custom_orders
  for select using (true);

create policy "Allow admin update access to all custom orders" on public.custom_orders
  for update using (true);


-- 4. PRODUCTS TABLE
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  original_price numeric,
  category text,
  tags text[],
  stock integer default 0,
  images text[],
  status text default 'active',
  featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.products enable row level security;

create policy "Allow public read access to products" on public.products
  for select using (true);

create policy "Allow admin insert products" on public.products
  for insert with check (true);

create policy "Allow admin update products" on public.products
  for update using (true);

create policy "Allow admin delete products" on public.products
  for delete using (true);


-- 5. COUPONS TABLE
create table if not exists public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  type text not null check (type in ('percent', 'flat')),
  value numeric not null,
  usage_limit integer default 0,
  used_count integer default 0,
  expiry date,
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.coupons enable row level security;

create policy "Allow public read of active coupons" on public.coupons
  for select using (active = true);

create policy "Allow admin full access to coupons" on public.coupons
  for all using (true);


-- 6. SITE SETTINGS TABLE (key-value store for admin-editable settings)
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamp with time zone default now()
);

alter table public.site_settings enable row level security;

create policy "Allow public read of site settings" on public.site_settings
  for select using (true);

create policy "Allow admin write to site settings" on public.site_settings
  for all using (true);

-- Default site settings rows
insert into public.site_settings (key, value) values
  ('announcement_text', '🚚 Free shipping on orders above ₹2,000 | Handmade with love in Bangalore 🐾'),
  ('free_shipping_threshold', '2000'),
  ('standard_shipping_fee', '59'),
  ('instagram_url', 'https://www.instagram.com/tabbychaser'),
  ('store_email', 'tabbychaser2@gmail.com'),
  ('business_name', 'Tabby Chaser'),
  ('business_tagline', 'Just me, some clay and a little paint.')
on conflict (key) do nothing;


-- 7. PROFILE TRIGGER ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;
