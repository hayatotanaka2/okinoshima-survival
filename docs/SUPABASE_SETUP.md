# SUPABASE_SETUP.md

## 1. 方針

全員で同じゲーム状態を同期するため、Vercel本番ではSupabaseをメイン保存先にします。

MVPでは `game_states` テーブルにGameState全体をJSONBで1行保存します。

```txt
game_states
  id = main
  state = GameState JSON
  updated_at
```

この方式は実装が速く、旅行直近のMVPに向いています。将来的には `members`, `teams`, `missions` などを個別テーブルに正規化します。

## 2. Supabaseで実行するSQL

Supabase DashboardのSQL Editorで以下を実行します。

同じ内容を `docs/supabase-mvp.sql` にも置いてあります。実作業では、そのファイルを丸ごとコピーするのが楽です。

```sql
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
```

## 3. Realtime設定

Supabase Dashboardで以下を設定します。

1. Database
2. Replication
3. `game_states` をRealtime対象に追加

これで誰かがゲーム状態を更新すると、他の端末にも反映されます。

## 4. Vercel環境変数

Vercel Project SettingsのEnvironment Variablesに以下を追加します。

```txt
NEXT_PUBLIC_SUPABASE_URL=Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabase anon public key
```

追加後、Vercelで再デプロイしてください。

## 5. 写真投稿用Storage

ミッション写真投稿を使うため、Supabase Storageに以下のbucketを作成します。

```txt
mission-photos
```

旅行MVPでは、bucketをPublicにしてください。Private運用は後でAPI Route化するときに対応します。

Dashboardでの手順:

1. Storage
2. New bucket
3. Name: `mission-photos`
4. Public bucketをオン
5. Create bucket

SQLで作る場合の例:

```sql
insert into storage.buckets (id, name, public)
values ('mission-photos', 'mission-photos', true)
on conflict (id) do update set public = true;

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
```

## 6. 注意

このMVP方式では、anon keyを持つ全員が `main` のゲーム状態を更新できます。

旅行直近の運用では、URLを知っている参加者だけが使う前提なら成立します。ただし、より安全にするなら次の段階で以下を実装します。

- 管理者操作をVercel API Route経由にする
- Supabase service role keyはサーバー側だけで使う
- 参加者はread-only
- 管理者パスコードをサーバー側で検証する

## 7. ローカル確認

`.env.local` を作成し、以下を入れます。

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

その後:

```sh
npm install
npm run dev
```
