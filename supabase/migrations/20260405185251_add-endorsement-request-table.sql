create table public.endorsement_requests (
  id              uuid primary key default gen_random_uuid(),
  skill_id        uuid not null references public.skills(id) on delete cascade,
  requester_id    uuid not null references public.users(id) on delete cascade,
  endorser_email  text not null,
  endorser_id     uuid references public.users(id),
  token           text unique not null,
  status          text not null default 'pending'
                    check (status in ('pending','accepted','declined','expired','cancelled','completed')),
  decline_reason  text,
  expires_at      timestamptz not null default (now() + interval '7 days'),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Enable RLS
alter table public.endorsement_requests enable row level security;

-- RLS Policies - Simplified to avoid auth.users access
create policy "er_select" on public.endorsement_requests
  for select using (
    auth.uid() = requester_id or 
    auth.uid() = endorser_id
  );

create policy "er_insert" on public.endorsement_requests
  for insert with check (auth.uid() = requester_id);

create policy "er_update" on public.endorsement_requests
  for update using (
    auth.uid() = requester_id or 
    auth.uid() = endorser_id
  );

-- Trigger
create trigger endorsement_requests_updated_at
  before update on public.endorsement_requests
  for each row execute function update_updated_at();
