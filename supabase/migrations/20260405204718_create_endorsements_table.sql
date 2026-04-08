-- Endorsements table
create table public.endorsements (
  id              uuid primary key default gen_random_uuid(),
  request_id      uuid not null references public.endorsement_requests(id) on delete cascade,
  skill_id        uuid not null references public.skills(id) on delete cascade,
  endorser_id     uuid not null references public.users(id) on delete cascade,
  developer_id    uuid not null references public.users(id) on delete cascade,
  rating          integer not null check (rating between 1 and 5),
  comments        text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Enable RLS
alter table public.endorsements enable row level security;

-- RLS Policies
create policy "endorsements_select" on public.endorsements
  for select using (
    auth.uid() = endorser_id or 
    auth.uid() = developer_id
  );

create policy "endorsements_insert" on public.endorsements
  for insert with check (auth.uid() = endorser_id);

-- Trigger
create trigger endorsements_updated_at
  before update on public.endorsements
  for each row execute function update_updated_at();

-- Index for faster queries
create index endorsements_skill_id_idx on public.endorsements(skill_id);
create index endorsements_endorser_id_idx on public.endorsements(endorser_id);
create index endorsements_developer_id_idx on public.endorsements(developer_id);
