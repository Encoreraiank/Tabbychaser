-- ==========================================
-- TABBY CHASER DATABASE SCHEMA SETUP
-- Run these commands in your Supabase SQL Editor
-- ==========================================

-- 1. PROFILES TABLE (Linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text,
  address text,
  city text,
  state text,
  pin text,
  updated_at timestamp with time zone default now()
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow users to insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);


-- 2. ORDERS TABLE (Stores customer checkouts)
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  order_reference text not null unique,
  user_id uuid references auth.users on delete set null,
  email text not null,
  name text not null,
  phone text not null,
  address text not null,
  items jsonb not null,
  subtotal numeric not null,
  discount numeric default 0,
  shipping numeric not null,
  total numeric not null,
  payment_method text not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- Enable RLS for orders
alter table public.orders enable row level security;

create policy "Allow users to view their own orders" on public.orders
  for select using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "Allow anonymous and authenticated orders insertion" on public.orders
  for insert with check (true);


-- 3. CUSTOM ORDERS TABLE (Stores custom clay pet request submissions)
create table public.custom_orders (
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
  created_at timestamp with time zone default now()
);

-- Enable RLS for custom orders
alter table public.custom_orders enable row level security;

create policy "Allow users to view their own custom orders" on public.custom_orders
  for select using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "Allow anonymous and authenticated custom orders insertion" on public.custom_orders
  for insert with check (true);

-- 3b. ADMIN DASHBOARD PERMISSIONS (Allow select & update for managing dashboard records)
create policy "Allow admin select access to all orders" on public.orders
  for select using (true);

create policy "Allow admin update access to all orders" on public.orders
  for update using (true);

create policy "Allow admin select access to all custom orders" on public.custom_orders
  for select using (true);

create policy "Allow admin update access to all custom orders" on public.custom_orders
  for update using (true);


-- 4. PROFILE TRIGGER ON SIGNUP
-- Automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition (uncomment after adding raw email column if needed, or stick to simple insert from app.js)
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
