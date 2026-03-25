create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            text not null default 'developer'
                    check (role in ('developer', 'endorser', 'employer', 'admin')),
  username        text unique,
  headline        text,
  bio             text,
  avatar_url      text,
  location        text,
  website_url     text,
  github_connected    boolean default false,
  github_username     text,
  github_token        text,  -- store encrypted via pgcrypto (challenge 3)
  availability        text default 'not_looking'
                        check (availability in ('open', 'employed', 'not_looking')),
  open_to_remote      boolean default false,
  onboarding_complete boolean default false,
  status          text default 'active'
                    check (status in ('active', 'deactivated')),
  deactivated_at  timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.users enable row level security;

create policy "users_select" on public.users
  for select using (status = 'active' or auth.uid() = id);

create policy "users_insert" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update" on public.users
  for update using (auth.uid() = id);