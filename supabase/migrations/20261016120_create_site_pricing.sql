-- Resume-unlock discount persistence.
-- The Express API (server.ts) reads/writes this single-row table through the
-- service-role key so the admin discount survives serverless cold starts,
-- where the filesystem is read-only.
create table if not exists public.site_pricing (
  id text primary key default 'resume-unlock',
  discount_percent integer not null default 0,
  discount_active boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Seed the single row the API always selects/upserts.
insert into public.site_pricing (id)
values ('resume-unlock')
on conflict (id) do nothing;

-- The API uses the service-role key (bypasses RLS), but lock the table down
-- for anon/authenticated roles anyway since no client ever reads it directly.
alter table public.site_pricing enable row level security;
