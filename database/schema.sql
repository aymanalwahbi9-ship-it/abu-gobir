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

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(), name text not null, phone text not null,
  service text, location text, details text, created_at timestamptz not null default now()
);

insert into public.categories(name,slug) values
 ('الأرضيات والبلاط','floors-tiles'),('الأرضيات والرخام','floors-marble'),
 ('الحمامات والجدران','bathrooms-walls'),('السلالم والدرج','stairs'),
 ('الزخارف والفواصل','details-separators'),('التشطيبات والمداخل','finishes-entrances'),
 ('أعمال متنوعة','misc') on conflict (slug) do nothing;

alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.admin_users enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Public can view published projects" on public.projects;
create policy "Public can view published projects" on public.projects for select to anon,authenticated using (published = true);
create policy "Admins can view all projects" on public.projects for select to authenticated using (exists(select 1 from public.admin_users where user_id=auth.uid()));
create policy "Admins can insert projects" on public.projects for insert to authenticated with check (exists(select 1 from public.admin_users where user_id=auth.uid()));
create policy "Admins can update projects" on public.projects for update to authenticated using (exists(select 1 from public.admin_users where user_id=auth.uid())) with check (exists(select 1 from public.admin_users where user_id=auth.uid()));
create policy "Admins can delete projects" on public.projects for delete to authenticated using (exists(select 1 from public.admin_users where user_id=auth.uid()));
create policy "Public can view categories" on public.categories for select to anon,authenticated using (true);
create policy "Admins can view own admin row" on public.admin_users for select to authenticated using (user_id=auth.uid());

insert into storage.buckets(id,name,public) values ('project-images','project-images',true) on conflict (id) do nothing;
drop policy if exists "Public can view project images" on storage.objects;
create policy "Public can view project images" on storage.objects for select using (bucket_id='project-images');
drop policy if exists "Admins can upload project images" on storage.objects;
create policy "Admins can upload project images" on storage.objects for insert to authenticated with check (bucket_id='project-images' and exists(select 1 from public.admin_users where user_id=auth.uid()));
drop policy if exists "Admins can update project images" on storage.objects;
create policy "Admins can update project images" on storage.objects for update to authenticated using (bucket_id='project-images' and exists(select 1 from public.admin_users where user_id=auth.uid()));
drop policy if exists "Admins can delete project images" on storage.objects;
create policy "Admins can delete project images" on storage.objects for delete to authenticated using (bucket_id='project-images' and exists(select 1 from public.admin_users where user_id=auth.uid()));

-- بعد إنشاء حساب أبو جبير في Auth، أضف UUID الحساب إلى admin_users:
-- insert into public.admin_users(user_id) values ('UUID_OF_ABU_JUBAIR_ACCOUNT');
