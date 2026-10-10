-- Public storage bucket for work gallery images
insert into storage.buckets (id, name, public)
values ('work-gallery', 'work-gallery', true)
on conflict (id) do nothing;

-- Anyone can view gallery images via public URLs (server uploads with service_role)
drop policy if exists "Public read work-gallery" on storage.objects;
create policy "Public read work-gallery"
  on storage.objects for select
  to public
  using (bucket_id = 'work-gallery');

drop policy if exists "Service role manages work-gallery" on storage.objects;
create policy "Service role manages work-gallery"
  on storage.objects for all
  to service_role
  using (bucket_id = 'work-gallery')
  with check (bucket_id = 'work-gallery');

-- Seed demo inquiries so the owner inbox is not empty on first deploy
insert into public.inquiries (name, email, subject, inquiry_type, budget, message, timestamp, read, status)
values
  (
    'Sarah Jenkins',
    'sarah.j@techvision-capital.io',
    'UI/UX & Product Design Collaboration (Aradad Homes & Mobile Web)',
    'UI/UX Design & Full-time Hiring',
    '$85k - $120k / year',
    'Hi Danso, we reviewed your UI/UX design case studies for Aradad Homes and Honeycave Market. We are expanding our digital product division and would love to discuss a UI/UX designer and IT consulting engagement with you.',
    now() - interval '4 hours',
    false,
    'delivered'
  ),
  (
    'Alexander Chen',
    'alex@lumina-labs.com',
    'Tableau Visual Analytics & Database Optimization Project',
    'Technical Advisory',
    '$10,000 - $25,000',
    'Danso, we saw your expertise in Tableau visual analytics, MySQL database management, and network infrastructure. We would love to engage you for building custom analytics dashboards and database audits.',
    now() - interval '22 hours',
    false,
    'delivered'
  );
