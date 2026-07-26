-- Run this in Supabase SQL Editor once.
-- Anonymous insert is allowed for early ANS research validation.
-- No user login required.

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  locale text not null,
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
