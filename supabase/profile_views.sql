-- ANS B2B validation: Candidate Profile Link generation + view tracking.
-- Run once in Supabase SQL Editor (safe / additive).
-- No login / dashboard / PII beyond optional User-Agent & Referer.

-- 1) Persist generated public profile URL on each assessment.
alter table public.assessments
  add column if not exists profile_url text;

-- 2) Record each open of /profile/{token} (via GET /api/profile/[token]).
create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id),
  profile_id text,
  created_at timestamptz not null default now(),
  user_agent text,
  referer text
);

create index if not exists profile_views_assessment_id_idx
  on public.profile_views (assessment_id);

create index if not exists profile_views_created_at_idx
  on public.profile_views (created_at desc);

alter table public.profile_views enable row level security;

drop policy if exists "Allow anonymous insert profile_views" on public.profile_views;
create policy "Allow anonymous insert profile_views"
  on public.profile_views
  for insert
  to anon
  with check (true);

-- Optional later: authenticated research reads
-- create policy "Allow authenticated read profile_views"
--   on public.profile_views
--   for select
--   to authenticated
--   using (true);
