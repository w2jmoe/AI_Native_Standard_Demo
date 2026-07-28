-- ANS Early Experiment: Founder / Hiring Manager feedback.
-- Run once in Supabase SQL Editor.
-- Anonymous insert only — no login required.

create table if not exists public.experiment_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  locale text,
  source text,
  -- Q1: compared with resumes/interviews, additional hiring signals?
  -- yes_significantly | yes_somewhat | not_really | no
  hiring_signal_value text not null,
  -- Q2: roles of interest (multi-select), stored as JSON text array
  -- e.g. ["ai_engineer","product_manager"]
  roles jsonb not null default '[]'::jsonb
);

alter table public.experiment_feedback enable row level security;

create policy "Allow anonymous insert experiment_feedback"
  on public.experiment_feedback
  for insert
  to anon
  with check (true);

-- Optional later: authenticated research dashboard reads
-- create policy "Allow authenticated read experiment_feedback"
--   on public.experiment_feedback
--   for select
--   to authenticated
--   using (true);
