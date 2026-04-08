-- Allow endorsers to update skill status to verified
-- This is needed when an endorsement is completed

-- Drop existing update policy
drop policy if exists "skills_update" on public.skills;

-- Recreate update policy to allow:
-- 1. Owners to update their own skills
-- 2. Endorsers to update skill status (only) if they have a completed endorsement for that skill
create policy "skills_update" on public.skills
  for update using (
    -- Owner can update their own skill
    auth.uid() = user_id
    OR
    -- Endorser can update if they have a completed endorsement for this skill
    exists (
      select 1 from public.endorsements e
      where e.skill_id = skills.id
      and e.endorser_id = auth.uid()
    )
  );
