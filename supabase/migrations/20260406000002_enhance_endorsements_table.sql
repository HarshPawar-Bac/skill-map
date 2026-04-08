-- Enhance endorsements table with structured rubric and additional features

-- Add new columns for structured rubric
alter table public.endorsements
  add column code_quality_rating integer check (code_quality_rating between 1 and 5),
  add column problem_solving_rating integer check (problem_solving_rating between 1 and 5),
  add column proficiency_depth_rating integer check (proficiency_depth_rating between 1 and 5),
  add column would_recommend boolean default false,
  add column assessment text,
  add column can_edit_until timestamptz default (now() + interval '24 hours');

-- Make rating nullable since we're moving to structured rubric
alter table public.endorsements
  alter column rating drop not null;

-- Add constraint for assessment minimum length (50 characters)
alter table public.endorsements
  add constraint assessment_min_length check (char_length(assessment) >= 50);

-- Add RLS policy for updates (allow endorser to edit within 24-hour window)
create policy "endorsements_update" on public.endorsements
  for update using (
    auth.uid() = endorser_id 
    and now() < can_edit_until
  );
