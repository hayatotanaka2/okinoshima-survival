# DEPLOYMENT_CHECKLIST.md

## 目的

沖ノ島サバイバルをVercel本番URLで公開し、Supabaseで全員が同じゲーム状態を共有できるようにするための作業チェックリストです。

## 0. 現在の状態

コード側は以下に対応済みです。

- Supabase `game_states` への共有保存
- Supabase Realtime購読
- Supabase Storage `mission-photos` への写真アップロード
- localStorage fallback
- Vercel向けNext.js build

未完了なのは、SupabaseとVercelの外部サービス設定です。

## 1. Supabaseアカウント作成/ログイン

1. Supabaseを開く。
2. GitHubまたはメールでログインする。
3. Organizationを作成する。既にある場合はそれを使う。

## 2. Supabase新規プロジェクト作成

1. New projectを押す。
2. Project nameを入力する。例: `douki-okinoshima-survival`
3. Database Passwordを作成し、控える。
4. Regionは日本に近いものを選ぶ。例: Northeast Asia系。
5. Create new projectを押す。
6. 作成完了まで待つ。

## 3. SQL EditorでテーブルとStorage設定を作成

1. Supabase Dashboardで対象プロジェクトを開く。
2. SQL Editorを開く。
3. `docs/supabase-mvp.sql` の中身を貼り付ける。
4. Runを押す。
5. エラーが出ないことを確認する。

## 4. Realtime有効化

1. Databaseを開く。
2. ReplicationまたはRealtimeの設定画面を開く。
3. `game_states` テーブルをRealtime対象に追加する。
4. `public.game_states` が有効になっていることを確認する。

## 5. Supabase URLとanon key取得

1. Project Settingsを開く。
2. APIを開く。
3. Project URLをコピーする。
4. anon public keyをコピーする。

取得する値:

```txt
NEXT_PUBLIC_SUPABASE_URL=Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon public key
```

## 6. ローカル `.env.local` 作成

このリポジトリ直下に `.env.local` を作成します。

`.env.local.example` をコピーして、値をSupabaseのものに置き換えます。

```sh
cp .env.local.example .env.local
```

`.env.local` の中身:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

`.env.local` は秘密情報を含むためGitHubにpushしません。

## 7. ローカル同期確認

```sh
npm run dev
```

確認手順:

1. `http://localhost:3000` を開く。
2. `/admin` に `admin123` で入る。
3. 「本番同期ステータス」がSupabase設定済みになることを確認する。
4. チーム編成や通知作成を行う。
5. 別ブラウザ、またはシークレットウィンドウで `http://localhost:3000` を開く。
6. 変更が反映されることを確認する。

## 8. GitHubにpush

まだGit管理していない場合:

```sh
git init
git add .
git commit -m "Build okinoshima survival MVP"
```

GitHubで新規リポジトリを作成し、表示された手順に沿ってpushします。

注意:

- `node_modules/` はpushしません。
- `.next/` はpushしません。
- `.env.local` はpushしません。
- `.gitignore` により除外されます。

## 9. Vercelプロジェクト作成

1. Vercelにログインする。
2. Add New Projectを押す。
3. GitHubリポジトリを選ぶ。
4. Framework PresetがNext.jsになっていることを確認する。
5. Build Commandは `npm run build`。
6. Output Directoryは空欄。

## 10. Vercel環境変数設定

VercelのProject Settings > Environment Variablesで以下を追加します。

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Environmentは Production / Preview / Development すべてに入れてよいです。

設定後、Redeployします。

## 11. Vercelデプロイ確認

1. Vercelの発行URLを開く。
2. `/admin` に入る。
3. 「本番同期ステータス」がSupabase設定済みになることを確認する。
4. チーム編成、通知作成、写真投稿を試す。

## 12. iPhone/複数端末同期確認

1. MacのブラウザでVercel URLを開く。
2. iPhone Safariで同じVercel URLを開く。
3. Mac側で管理者操作を行う。
4. iPhone側に反映されることを確認する。
5. iPhone側で宝箱コード入力や写真投稿を行う。
6. Mac側に反映されることを確認する。

## 13. 本番前チェック

- 管理者パスコードを本番用に変更した。
- Supabase Realtimeが効いている。
- `mission-photos` bucketがPublicになっている。
- Vercel環境変数がProductionに入っている。
- iPhoneでホーム画面追加できる。
- 写真投稿ができる。
- 宝箱コードが一度しか使えない。
- オークション入札が同期される。
- 管理者画面のログが残る。

