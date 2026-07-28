-- Run this in Supabase SQL Editor once.
-- ANS Demo 2.0 assessments schema.
-- Anonymous insert is allowed for early research validation.
-- No user login required.

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  locale text not null,
  display_name text,
  source text,
  task_id text,
  task_category text,
  profile_url text,
  score integer not null,
  profile text not null,
  problem_framing_score integer not null,
  ai_collaboration_score integer not null,
  judgment_score integer not null,
  execution_score integer not null,
  iteration_score integer not null,
  problem_answer text not null,
  collaboration_answer text not null,
  solution_answer text not null,
  judgment_answer text not null,
  iteration_answer text not null
);

-- Safe additive migration for databases created before display_name existed.
alter table public.assessments
  add column if not exists display_name text;

-- Lightweight Early Experiment channel tag from URL ?source=
alter table public.assessments
  add column if not exists source text;

-- Work Simulation task tags for multi-task research (nullable for legacy rows).
alter table public.assessments
  add column if not exists task_id text;

alter table public.assessments
  add column if not exists task_category text;

-- Persisted Candidate Profile Link for B2B share validation (nullable for legacy rows).
alter table public.assessments
  add column if not exists profile_url text;

alter table public.assessments enable row level security;

-- Allow anonymous inserts from the Next.js API (using anon key).
create policy "Allow anonymous insert assessments"
  on public.assessments
  for insert
  to anon
  with check (true);

-- Optional: allow authenticated reads later for research dashboard.
-- create policy "Allow authenticated read assessments"
--   on public.assessments
--   for select
--   to authenticated
--   using (true);

-- Public share links: /profile/{id} loads via server API (anon key).
-- Token = assessments.id (uuid). No login; security via unlisted UUID.
drop policy if exists "Allow anonymous select assessments for share" on public.assessments;
create policy "Allow anonymous select assessments for share"
  on public.assessments
  for select
  to anon
  using (true);
