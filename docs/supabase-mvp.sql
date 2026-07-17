-- 僕らのサマーウォーズ ver-B MVP Supabase setup
-- Supabase Dashboard > SQL Editor でこのSQLを実行してください。

create table if not exists public.game_states (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.game_states enable row level security;

drop policy if exists "Allow anon read game state" on public.game_states;
drop policy if exists "Allow anon insert game state" on public.game_states;
drop policy if exists "Allow anon update game state" on public.game_states;

create policy "Allow anon read game state"
on public.game_states
for select
to anon
using (id = 'main');

create policy "Allow anon insert game state"
on public.game_states
for insert
to anon
with check (id = 'main');

create policy "Allow anon update game state"
on public.game_states
for update
to anon
using (id = 'main')
with check (id = 'main');

insert into storage.buckets (id, name, public)
values ('mission-photos', 'mission-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Allow anon upload mission photos" on storage.objects;
drop policy if exists "Allow anon read mission photos" on storage.objects;

create policy "Allow anon upload mission photos"
on storage.objects
for insert
to anon
with check (bucket_id = 'mission-photos');

create policy "Allow anon read mission photos"
on storage.objects
for select
to anon
using (bucket_id = 'mission-photos');

