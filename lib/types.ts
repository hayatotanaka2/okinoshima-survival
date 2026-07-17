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
export type MissionCategory =
  | "permanent-1"
  | "permanent-2"
  | "emergency-treasure"
  | "emergency-battle"
  | "single";
export type MissionRequirement = "required" | "optional";
export type MissionRewardKind = "coin" | "item";
export type MissionRewardMode = "same" | "ranking";

export type MissionItemReward = {
  name: string;
  description: string;
  type: ItemType;
  value: number;
  isSecret?: boolean;
  publicName?: string;
};

export type MissionRankingReward = {
  rank: number;
  rewardKind: MissionRewardKind;
  rewardCoin: number;
  rewardItem?: MissionItemReward;
};

export type MissionTeamCompletion = {
  teamId: string;
  completedAt: string;
  rank?: number;
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  rewardCoin: number;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  targetType: MissionTargetType;
  category?: MissionCategory;
  requirement?: MissionRequirement;
  requiresPhoto?: boolean;
  requiresCode?: boolean;
  treasureCode?: string;
  rewardKind?: MissionRewardKind;
  rewardMode?: MissionRewardMode;
  isEmergency?: boolean;
  rewardItem?: MissionItemReward;
  rankingRewards?: MissionRankingReward[];
  rewardItemIds: string[];
  completedByTeamIds: string[];
  completedTeamRecords?: MissionTeamCompletion[];
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

export type AuctionStatus = "open" | "closed";

export type AuctionItem = {
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
  | "morale"
  | "system"
  | "notification";

export type MissionSubmissionStatus = "pending" | "approved" | "rejected";

export type MissionSubmission = {
  id: string;
  missionId: string;
  teamId: string;
  submittedByMemberId: string;
  imageUrl: string;
  imageUrls?: string[];
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
  | "morale"
  | "system";

export type MoraleVerdict = "pending" | "guilty" | "not_guilty";

export type MoraleReport = {
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
  moraleReports: MoraleReport[];
  eventLogs: EventLog[];
  notifications: AppNotification[];
  gameStatus: GameStatus;
  updatedAt: string;
};
