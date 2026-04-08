create table public.evidence (
  id              uuid primary key default gen_random_uuid(),
  skill_id        uuid not null references public.skills(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  live_url        text not null,
  live_url_valid  boolean default false,
  github_repo_url text not null,
  github_summary  jsonb,
  video_s3_key    text not null,
  video_url       text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(skill_id) -- One evidence per skill
);
