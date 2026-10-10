-- Inquiries table: stores contact form submissions and recruiter messages
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default 'New Portfolio Inquiry',
  inquiry_type text not null default 'General Inquiry',
  budget text,
  message text not null,
  timestamp timestamptz not null default now(),
  read boolean not null default false,
  status text not null default 'delivered' check (status in ('delivered', 'read', 'pending'))
);

-- Index for faster owner inbox queries
create index if not exists idx_inquiries_timestamp on public.inquiries (timestamp desc);
create index if not exists idx_inquiries_unread on public.inquiries (read, timestamp desc);

-- Enable Row Level Security
alter table public.inquiries enable row level security;

-- Policies: only the service_role (server-side) can insert/select/update,
-- public/anon users cannot access the table directly
create policy "Service role can select all inquiries"
  on public.inquiries for select
  to service_role
  using (true);

create policy "Service role can insert inquiries"
  on public.inquiries for insert
  to service_role
  with check (true);

create policy "Service role can update inquiries"
  on public.inquiries for update
  to service_role
  using (true);

create policy "Service role can delete inquiries"
  on public.inquiries for delete
  to service_role
  using (true);
