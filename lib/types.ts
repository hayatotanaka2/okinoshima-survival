export type GameStatus = "setup" | "playing" | "auction" | "finished";

export type Member = {
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

export type Team = {
  id: string;
  name: string;
  color: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type MissionStatus = "draft" | "active" | "completed" | "closed";
export type MissionDifficulty = "easy" | "normal" | "hard" | "legend";
export type MissionTargetType = "team" | "individual";

export type Mission = {
  id: string;
  title: string;
  description: string;
  rewardCoin: number;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  targetType: MissionTargetType;
  rewardItemIds: string[];
  completedByTeamIds: string[];
  completedByMemberIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ItemType =
  | "food"
  | "bbq"
  | "drink"
  | "privilege"
  | "hint"
  | "defense"
  | "civilization"
  | "sabotage"
  | "other";

export type ItemStatus = "available" | "owned" | "used";
export type OwnerType = "member" | "team" | "none";

export type Item = {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  value: number;
  ownerType: OwnerType;
  ownerMemberId?: string;
  ownerTeamId?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type AuctionStatus = "open" | "closed";

export type AuctionItem = {
  id: string;
  name: string;
  description: string;
  currentPrice: number;
  winnerTeamId?: string;
  status: AuctionStatus;
  createdAt: string;
  updatedAt: string;
};

export type TreasureStatus = "hidden" | "claimed";
export type TreasureRewardType = "coin" | "item";

export type Treasure = {
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

export type EventLogType =
  | "team"
  | "mission"
  | "item"
  | "auction"
  | "coin"
  | "treasure"
  | "system"
  | "notification";

export type MissionSubmissionStatus = "pending" | "approved" | "rejected";

export type MissionSubmission = {
  id: string;
  missionId: string;
  teamId: string;
  submittedByMemberId: string;
  imageUrl: string;
  comment: string;
  status: MissionSubmissionStatus;
  createdAt: string;
  updatedAt: string;
};

export type EventLog = {
  id: string;
  message: string;
  type: EventLogType;
  createdAt: string;
};

export type NotificationType =
  | "mission"
  | "item"
  | "auction"
  | "treasure"
  | "system";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  readByMemberIds: string[];
  createdAt: string;
};

export type GameState = {
  members: Member[];
  teams: Team[];
  missions: Mission[];
  items: Item[];
  auctionItems: AuctionItem[];
  treasures: Treasure[];
  submissions: MissionSubmission[];
  eventLogs: EventLog[];
  notifications: AppNotification[];
  gameStatus: GameStatus;
  updatedAt: string;
};
