# 沖ノ島サバイバル

同期旅行で使う、スマホ向けPWAのサバイバルゲーム管理アプリです。

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- localStorage fallback
- PWA

## セットアップ

```sh
npm install
npm run dev
```

## 起動

```sh
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 管理者

管理者画面は `/admin` です。

MVPの仮パスコード:

```txt
admin123
```

## ゲームの流れ

1. 管理者画面でメンバーを確認・追加する。
2. チーム編成画面または管理者画面でランダム編成する。
3. 管理者がミッションを発動する。
4. チームが達成したら管理者が達成承認する。
5. 報酬沖コインがメンバーへ均等配分される。
6. 宝箱コード、物資、オークションで沖コインを使って盛り上げる。

## PWAとして使う

iPhoneではSafariでURLを開き、共有ボタンから「ホーム画面に追加」を押します。追加後はホーム画面のアイコンから起動します。

## iPhone確認

Macで以下を実行します。

```sh
npm run dev -- --host 0.0.0.0
ipconfig getifaddr en0
```

iPhoneを同じWi-Fiに接続し、Safariで `http://192.168.x.x:3000` を開きます。

## 全員同期

Vercel本番で全員が同じゲーム状態を見るにはSupabase設定が必須です。

詳しい手順は [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) を見てください。
実作業のチェックリストは [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) です。

必要なVercel環境変数:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Supabase未設定の場合はlocalStorage fallbackで動きますが、その場合は端末ごとに別データになります。

## 通知

MVPではアプリ内通知をGameStateに保存して表示します。Supabase設定済みなら全員に同期されます。Web Push通知は将来拡張用の雛形のみ用意しています。

## Vercelデプロイ

このアプリはVercelで動かす前提のNext.jsアプリです。

1. GitHubにこのフォルダの内容をpushする。
2. VercelでNew Projectを選ぶ。
3. GitHub repositoryを選択する。
4. Framework PresetはNext.jsを選ぶ。
5. Build Commandは通常どおり `npm run build`。
6. Output Directoryは空欄のままでよい。
7. Deployする。

Vercel側では `package.json` を見て依存関係をインストールし、Next.jsとしてビルドします。Mac側に入る `node_modules` はVercelにはアップロードしません。

### デプロイ前チェック

ローカルでNode.js/npmが使える場合は、push前に以下を実行してください。

```sh
npm install
npm run build
```

ローカルにNode.js/npmを入れずに進める場合でも、GitHubへpushすればVercel側でインストールとビルドが走ります。ただし、エラーが出た場合はVercelのBuild Logsを見て修正します。

### 注意

MVPの本番データ保存はSupabaseです。Supabase環境変数がない場合だけlocalStorage fallbackで動きます。

## 今後のデータ設計方針

現在は旅行直近のMVPとして、Supabaseの `game_states` テーブルにGameState全体をJSONBで保存します。

今後より堅くする場合は、`members`, `teams`, `missions`, `items`, `event_logs` を個別テーブルに分け、管理者操作はVercel API Route経由でサーバー側検証します。
