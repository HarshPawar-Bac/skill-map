-- Fix RLS policy to allow endorsers to update requests by email
-- This is needed because endorser_id is NULL when request is created

-- Drop existing update policy
drop policy if exists "er_update" on public.endorsement_requests;

-- Recreate update policy to check endorser_email against auth.email()
create policy "er_update" on public.endorsement_requests
  for update using (
    auth.uid() = requester_id or 
    auth.uid() = endorser_id or
    auth.email() = endorser_email
  );
