create table public.skills (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  category    text not null check (category in ('Frontend','Backend','DevOps','Data','Design','Other')),
  description text not null,
  status      text not null default 'pending_evidence'
                check (status in ('pending_evidence','pending_endorsement','verified')),
  visibility  text not null default 'public'
                check (visibility in ('public','private')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Enable RLS
alter table public.skills enable row level security;

-- RLS Policies
create policy "skills_select" on public.skills
  for select using (visibility = 'public' or auth.uid() = user_id);

create policy "skills_insert" on public.skills
  for insert with check (auth.uid() = user_id);

create policy "skills_update" on public.skills
  for update using (auth.uid() = user_id);

create policy "skills_delete" on public.skills
  for delete using (auth.uid() = user_id);

-- Updated_at trigger
create trigger skills_updated_at
  before update on public.skills
  for each row execute function update_updated_at();
