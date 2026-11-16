create extension if not exists pgcrypto;
create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(),
 name text not null unique,
 slug text not null unique
);
create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(),
 project_code text unique not null,
 title text not null,
 description text,
 category_id uuid references public.categories(id),
 image_path text not null,
 original_filename text,
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.inquiries (
 id uuid primary key default gen_random_uuid(),
 customer_name text not null,
 phone text not null,
 service text,
 location text,
 details text,
 created_at timestamptz not null default now()
);
alter table public.projects enable row level security;
alter table public.categories enable row level security;
alter table public.inquiries enable row level security;
create policy "Public can view published projects" on public.projects for select using (published = true);
create policy "Public can view categories" on public.categories for select using (true);
-- Do not enable public insert/update/delete policies for admin data.
-- Add authenticated admin policies only after configuring Supabase Auth and admin roles.
