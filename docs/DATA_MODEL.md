# DATA_MODEL.md

## 1. 方針

MVPではSupabaseにGameState全体を保存します。

Supabase未設定時だけlocalStorage fallbackで動かします。画面から直接localStorageやSupabaseを触らず、必ず repository 層を経由します。

## 2. GameState

```ts
type GameState = {
  members: Member[];
  teams: Team[];
  missions: Mission[];
  items: Item[];
  auctionItems: AuctionItem[];
  treasures: Treasure[];
  moraleReports: MoraleReport[];
  eventLogs: EventLog[];
  notifications: AppNotification[];
  gameStatus: GameStatus;
  updatedAt: string;
};
```

## 2.1 Supabase Table

```sql
game_states (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null
)
```

MVPでは `id = 'main'` の1行だけを使います。

## 3. Member

```ts
type Member = {
  id: string;
  name: string;
  coin: number;
  totalEarnedCoin: number;
  totalSpentCoin: number;
  currentTeamId?: string;
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
};
```

沖コインは個人に保存します。

## 4. Team

```ts
type Team = {
  id: string;
  name: string;
  color: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
};
```

チームの合計沖コインは保存せず、所属メンバーのcoin合計から計算します。

## 5. Mission

```ts
type MissionStatus = "draft" | "active" | "completed" | "closed";
type MissionDifficulty = "easy" | "normal" | "hard" | "legend";
type MissionTargetType = "team" | "individual";

type Mission = {
  id: string;
  title: string;
  description: string;
  rewardCoin: number;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  targetType: MissionTargetType;
  rewardItemIds: string[];
  completedByTeamIds: string[];
  completedTeamRecords?: {
    teamId: string;
    completedAt: string;
  }[];
  completedByMemberIds: string[];
  createdAt: string;
  updatedAt: string;
};
```

`rewardItem` には秘匿カード用に `isSecret` と `publicName` を持てます。秘匿カードは報酬作成時の本名を保存しつつ、未所持者には `publicName` だけを表示します。

## 6. Item

```ts
type ItemType =
  | "food"
  | "bbq"
  | "drink"
  | "privilege"
  | "hint"
  | "defense"
  | "civilization"
  | "sabotage"
  | "other";

type ItemStatus = "available" | "owned" | "used";
type OwnerType = "member" | "team" | "none";

type Item = {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  value: number;
  isSecret?: boolean;
  publicName?: string;
  ownerType: OwnerType;
  ownerMemberId?: string;
  ownerTeamId?: string;
  acquiredTeamId?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
};
```

`isSecret` が true のアイテムは、所有者本人以外には `publicName` だけを表示し、説明文も伏せます。ミッション報酬でチーム全員へ配布する場合も、データ上は各メンバーに1枚ずつ個人所有カードを作成します。

`acquiredTeamId` は、その物資やカードを獲得・購入した時点の所属チームを表します。

チームタブでは `acquiredTeamId` が現在のチームIDと一致し、かつアイテム更新日時が現在のチーム作成日時以降のものだけを表示します。

ミッション達成は `completedTeamRecords` に時刻付きで保存します。チームタブでは、現在のチーム作成日時以降に達成されたミッションだけを表示します。

MVPでは、ミッション全体の `status` は `active` または `closed` を主に使います。チームが達成してもミッション全体は `completed` にせず、達成チームだけを `completedTeamRecords` に追加します。

## 7. AuctionItem

```ts
type AuctionStatus = "open" | "closed";

type AuctionItem = {
  id: string;
  name: string;
  description: string;
  currentPrice: number;
  winnerTeamId?: string;
  winnerMemberId?: string;
  status: AuctionStatus;
  createdAt: string;
  updatedAt: string;
};
```

落札時の支払いは `winnerTeamId` のメンバーで人数割りにし、落札品の受け取り先は `winnerMemberId` の個人に紐づけます。

## 7.1 端末プレイヤー選択

ログイン機能はMVPでは実装しません。

各端末では `selectedMemberId` をlocalStorageに保存し、宝箱取得、写真投稿、物資使用、オークション入札の初期選択に使います。沖コインや所持物資などの本体データはSupabase上のGameStateに保存します。

## 8. Treasure

```ts
type TreasureStatus = "hidden" | "claimed";
type TreasureRewardType = "coin" | "item";

type Treasure = {
  id: string;
  code: string;
  title: string;
  description: string;
  rewardType: TreasureRewardType;
  rewardCoin?: number;
  rewardItemId?: string;
  claimedByMemberId?: string;
  claimedByTeamId?: string;
  claimedAt?: string;
  status: TreasureStatus;
  createdAt: string;
  updatedAt: string;
};
```

MVPではQR読み取りではなく、宝箱コード入力で実装してよいです。

## 9. EventLog

```ts
type EventLogType =
  | "team"
  | "mission"
  | "item"
  | "auction"
  | "coin"
  | "treasure"
  | "system"
  | "notification";

type EventLog = {
  id: string;
  message: string;
  type: EventLogType;
  createdAt: string;
};
```

重要操作はすべてEventLogに残します。

## 10. AppNotification

```ts
type NotificationType =
  | "mission"
  | "item"
  | "auction"
  | "treasure"
  | "system";

type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  readByMemberIds: string[];
  createdAt: string;
};
```

MVPではアプリ内通知としてGameStateに保存します。Supabase設定済みなら全端末に同期されます。

## 10.1 MoraleReport

```ts
type MoraleVerdict = "pending" | "guilty" | "not_guilty";

type MoraleReport = {
  id: string;
  accusedMemberId: string;
  accuserMemberId?: string;
  content: string;
  verdict: MoraleVerdict;
  verdictReason?: string;
  judgedAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

士気掲示板の告発を表します。判決が `guilty` または `not_guilty` になった時、全端末で判決エフェクトを表示します。

## 11. GameStatus

```ts
type GameStatus = "setup" | "playing" | "auction" | "finished";
```

トップ画面に現在の状態として表示します。
