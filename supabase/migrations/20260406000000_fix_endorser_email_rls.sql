-- Fix RLS policy to allow endorsers to see requests by email
-- This is needed because endorser_id is NULL when request is created

-- Drop existing select policy
drop policy if exists "er_select" on public.endorsement_requests;

-- Recreate select policy to check endorser_email against auth.email()
create policy "er_select" on public.endorsement_requests
  for select using (
    auth.uid() = requester_id or 
    auth.uid() = endorser_id or
    auth.email() = endorser_email
  );
