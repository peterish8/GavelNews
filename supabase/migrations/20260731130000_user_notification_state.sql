-- One row per learner. New stories are derived from published_stories, so
-- editorial publishing never needs a second notification write.
create table if not exists public.user_notification_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default 'epoch'::timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_notification_state enable row level security;

create policy "users read their own notification state"
  on public.user_notification_state for select to authenticated
  using (auth.uid() = user_id);

create policy "users create their own notification state"
  on public.user_notification_state for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users update their own notification state"
  on public.user_notification_state for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
