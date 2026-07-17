export type AvatarAsset = {
  name: string;
  src: string;
};

const avatarNames = [
  "りゅうせい",
  "YT",
  "ちょる",
  "かのちゃん",
  "けいすけ",
  "こひ",
  "みのり",
  "はるか",
  "しーやん",
  "みゆ",
  "がく",
  "おがた",
  "あゆむ",
  "めい",
  "はやと",
  "まさ",
  "あい",
  "つじけん",
  "こうすけ",
  "まさこ",
  "ぱう",
  "あやなん",
  "みくり",
];

export const avatarAssets: AvatarAsset[] = avatarNames.map((name, index) => ({
  name,
  src: `/avatar/LINE_ALBUM_20260717%20_1_260718_${index + 1}.jpg`,
}));
