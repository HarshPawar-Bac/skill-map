-- Drop existing policies
drop policy if exists "er_select" on public.endorsement_requests;
drop policy if exists "er_update" on public.endorsement_requests;

-- Recreate policies without auth.users subquery
create policy "er_select" on public.endorsement_requests
  for select using (
    auth.uid() = requester_id or 
    auth.uid() = endorser_id
  );

create policy "er_update" on public.endorsement_requests
  for update using (
    auth.uid() = requester_id or 
    auth.uid() = endorser_id
  );
