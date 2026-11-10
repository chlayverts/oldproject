-- Run this in the Supabase SQL Editor before enabling hosted accounts.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can read their own enrollments" on public.enrollments;
drop policy if exists "Users can create their own enrollments" on public.enrollments;
drop policy if exists "Users can delete their own enrollments" on public.enrollments;
drop policy if exists "Users can read their own lesson progress" on public.lesson_progress;
drop policy if exists "Users can create their own lesson progress" on public.lesson_progress;
drop policy if exists "Users can update their own lesson progress" on public.lesson_progress;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read their own enrollments"
  on public.enrollments for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own enrollments"
  on public.enrollments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own enrollments"
  on public.enrollments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read their own lesson progress"
  on public.lesson_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own lesson progress"
  on public.lesson_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own lesson progress"
  on public.lesson_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists enrollments_user_id_idx
  on public.enrollments (user_id);

create index if not exists lesson_progress_user_id_idx
  on public.lesson_progress (user_id);

