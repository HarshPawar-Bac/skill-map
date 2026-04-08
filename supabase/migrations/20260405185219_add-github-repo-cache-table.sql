create table public.github_repo_cache (
  id          uuid primary key default gen_random_uuid(),
  repo_url    text unique not null,
  summary     jsonb not null,
  fetched_at  timestamptz default now(),
  expires_at  timestamptz default (now() + interval '24 hours')
);

-- Enable RLS
alter table public.evidence enable row level security;
alter table public.github_repo_cache enable row level security;

-- Evidence RLS Policies
create policy "evidence_select" on public.evidence
  for select using (auth.uid() = user_id);

create policy "evidence_insert" on public.evidence
  for insert with check (auth.uid() = user_id);

create policy "evidence_update" on public.evidence
  for update using (auth.uid() = user_id);

create policy "evidence_delete" on public.evidence
  for delete using (auth.uid() = user_id);

-- GitHub cache RLS (read-only for authenticated users)
create policy "github_cache_select" on public.github_repo_cache
  for select using (auth.uid() is not null);

-- Triggers
create trigger evidence_updated_at
  before update on public.evidence
  for each row execute function update_updated_at();
