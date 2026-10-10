-- Work gallery projects table: stores project metadata (title, caption, created timestamp)
create table if not exists public.work_gallery_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);

-- Work gallery images table: stores individual images belonging to a project
create table if not exists public.work_gallery_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.work_gallery_projects (id) on delete cascade not null,
  image_url text not null,
  storage_path text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

-- Index for faster gallery queries ordered by project creation
create index if not exists idx_work_gallery_projects_created on public.work_gallery_projects (created_at desc);
create index if not exists idx_work_gallery_images_project on public.work_gallery_images (project_id);

-- Enable Row Level Security
alter table public.work_gallery_projects enable row level security;
alter table public.work_gallery_images enable row level security;

-- Policies: anon (public) can read gallery, service_role can full access
create policy "Public can read work gallery projects"
  on public.work_gallery_projects for select
  to anon
  using (true);

create policy "Public can read work gallery images"
  on public.work_gallery_images for select
  to anon
  using (true);

create policy "Service role can manage work gallery projects"
  on public.work_gallery_projects for all
  to service_role
  using (true)
  with check (true);

create policy "Service role can manage work gallery images"
  on public.work_gallery_images for all
  to service_role
  using (true)
  with check (true);
