-- Fix evidence RLS to allow endorsers to view evidence for skills they're reviewing

-- Drop existing select policy
drop policy if exists "evidence_select" on public.evidence;

-- Recreate select policy to allow:
-- 1. Owners to see their own evidence
-- 2. Endorsers to see evidence for skills they're reviewing
create policy "evidence_select" on public.evidence
  for select using (
    -- Owner can see their own evidence
    auth.uid() = user_id
    OR
    -- Endorser can see evidence if they have a pending/completed request for this skill
    exists (
      select 1 from public.endorsement_requests er
      where er.skill_id = evidence.skill_id
      and (
        er.endorser_email = auth.email()
        or er.endorser_id = auth.uid()
      )
    )
  );
