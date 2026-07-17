# DEVELOPMENT_PLAN.md

## 開発方針

一気に全部作るのではなく、型定義、Supabase同期、ゲームロジック、画面、管理者機能、PWA、通知、QR宝箱の順に進めます。

各Phase完了後に `npm run build` を実行し、TypeScriptエラーを潰します。

## Phase 1: ドキュメント整備

作成するファイル:

- AGENTS.md
- docs/REQUIREMENTS.md
- docs/GAME_DESIGN.md
- docs/DATA_MODEL.md
- docs/UI_SPEC.md
- docs/PWA_AND_NOTIFICATION.md
- docs/SUPABASE_SETUP.md
- docs/DEVELOPMENT_PLAN.md

## Phase 2: Next.jsプロジェクト作成

Next.js App Router、TypeScript、Tailwind CSSでプロジェクトを作成します。

推奨設定:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src directory: No
- App Router: Yes
- import alias: Yes

## Phase 3: 型定義と初期データ

作成するファイル:

- lib/types.ts
- lib/seed.ts

実装する型:

- GameState
- Member
- Team
- Mission
- Item
- AuctionItem
- Treasure
- EventLog
- AppNotification

初期データ:

- 仮メンバー21人
- 初期ミッション
- 初期アイテム
- 初期オークション景品
- 初期宝箱コード

## Phase 4: Supabase同期とlocalStorage fallback

作成するファイル:

- lib/storage.ts
- lib/supabaseClient.ts
- lib/repository.ts

実装する関数:

- loadGameState()
- saveGameState()
- resetGameState()
- initializeGameState()
- loadSharedGameState()
- saveSharedGameState()
- subscribeSharedGameState()

画面から直接localStorageやSupabaseを触らないようにします。

## Phase 5: ゲームロジック

作成するファイル:

- lib/gameLogic.ts
- lib/teamLogic.ts
- lib/coinLogic.ts
- lib/missionLogic.ts
- lib/itemLogic.ts
- lib/auctionLogic.ts
- lib/notificationLogic.ts
- lib/treasureLogic.ts

実装する主な関数:

- randomizeTeams()
- calculateTeamCoin()
- distributeRewardToTeam()
- addCoinToMember()
- subtractCoinFromMember()
- completeMissionForTeam()
- assignItemToMember()
- assignItemToTeam()
- settleAuctionItem()
- claimTreasureByCode()
- createEventLog()
- createNotification()

## Phase 6: 基本画面

作成する画面:

- /
- /members
- /teams
- /teams/compose
- /missions
- /items
- /auction
- /qr
- /submissions
- /admin

作成する主なコンポーネント:

- Header
- BottomNav
- TeamCard
- MemberCard
- MissionCard
- ItemCard
- AuctionCard
- EventLogList
- NotificationList
- AdminSection

## Phase 7: 管理者画面

管理者画面に以下を実装します。

- パスコード認証
- メンバー追加
- メンバー削除
- メンバーのコイン加算・減算
- チームランダム再編成
- ミッション発動
- ミッション達成承認
- アイテム付与
- オークション落札処理
- 宝箱コード作成
- 通知作成
- イベントログ確認
- ゲームリセット

## Phase 8: PWA対応

作成・設定するもの:

- public/manifest.json
- public/sw.js
- public/clock.jpeg
- app/layout.tsx のmetadata
- ホーム画面追加案内UI

## Phase 9: 通知

MVP:

- アプリ内通知
- 通知履歴
- 管理者から通知作成
- トップ画面への最新通知表示

将来拡張用:

- Push通知対応可否チェック
- 通知権限リクエスト
- service worker登録
- iPhoneの注意点表示

## Phase 10: QR宝箱

MVPでは宝箱コード入力で実装します。

機能:

- 管理者が宝箱コードを作成
- 参加者がコード入力
- 使用済み判定
- コインまたはアイテム付与
- イベントログ作成
- アプリ内通知作成

## Phase 11: README整備

README.mdに以下を書く。

- アプリ概要
- 技術スタック
- セットアップ
- 起動方法
- 主要画面
- 管理者パスコード
- ゲームの流れ
- チーム再編成の考え方
- 沖コインの考え方
- PWAとしてホーム画面に追加する方法
- iPhone通知の注意点
- MacBook AirとiPhoneでの確認方法
- Vercelデプロイ手順
- Supabase化する場合の移行方針

## Codexに最初に投げる文

```txt
AGENTS.md と docs/ 配下の仕様書を読んでください。
このプロジェクトに、Next.js App Router、TypeScript、Tailwind CSSでスマホ向けPWA「僕らのサマーウォーズ ver-B」のMVPを実装してください。

まずは Phase 2 から Phase 5 まで、プロジェクト作成、型定義、初期データ、Supabase同期、localStorage fallback、ゲームロジックを実装してください。
画面は最低限でよいので、実装後に npm run build を実行し、TypeScriptエラーを修正してください。
```
