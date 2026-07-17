# PWA_AND_NOTIFICATION.md

## 1. PWA方針

このアプリはネイティブアプリではなくPWAとして作成します。

参加者はURLをSafariまたはChromeで開き、必要に応じてホーム画面に追加して使います。

## 2. PWA要件

- public/manifest.json を作成する。
- name は「僕らのサマーウォーズ ver-B」。
- short_name は「ver-B」。
- display は standalone。
- theme_color を設定する。
- background_color を設定する。
- ホーム画面アイコンは public/clock.jpeg を参照する。
- service workerを用意する。
- iPhoneのホーム画面に追加できる構成にする。
- 起動時演出は短くし、localStorageで表示頻度を抑える。

## 3. iPhoneでの使い方

1. iPhoneでSafariを開く。
2. アプリのURLを開く。
3. 共有ボタンを押す。
4. 「ホーム画面に追加」を押す。
5. Open as Web App が表示される場合はオンにする。
6. 「追加」を押す。
7. ホーム画面に追加されたアイコンから起動する。

## 4. 通知方針

通知は2段階で考えます。

### MVP: アプリ内通知

MVPではGameStateに通知を保存し、トップ画面などに表示します。Supabase設定済みなら全員に同期されます。

通知例:

- 新ミッションが発動しました。
- 赤チームがミッションを達成しました。
- 青チームが宝箱を発見しました。
- オークションが開始されました。

アプリ内通知は必ずイベントログとセットで作成します。

### 重要通知: Web Push通知

ミッション通知と告発通知はWeb Push通知に対応します。アプリを開いている時も、ホーム画面に追加したPWAを閉じている時も、通知許可済み端末にPush通知を送ります。

ただし、iPhoneでは以下の条件があります。

- iOS 16.4以降であること。
- Safariからホーム画面に追加すること。
- ホーム画面のアイコンから起動すること。
- アプリ内の通知許可ボタンを押すこと。
- iPhoneの通知許可ダイアログで許可すること。

Push通知は次のイベントに限定します。

- ミッション通知
- 告発通知

通常ログやオークションなどは通知が多くなりすぎるため、アプリ内通知とログ表示に留めます。

## 5. VAPIDキー

Web Push通知にはVAPIDキーが必要です。

```sh
npx web-push generate-vapid-keys
```

ローカル `.env.local` とVercel Environment Variablesに以下を設定します。

```txt
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:your-email@example.com
```

## 6. 実装する関数案

```ts
function isPushSupported(): boolean;
function requestNotificationPermission(): Promise<NotificationPermission>;
function registerServiceWorker(): Promise<ServiceWorkerRegistration | null>;
function showLocalNotification(title: string, options?: NotificationOptions): void;
function getPushSubscription(): Promise<PushSubscription | null>;
function subscribeToPushNotifications(publicVapidKey: string): Promise<PushSubscription | null>;
```

## 7. 運用方針

旅行当日にPush通知が不安定だと困るため、重要連絡はLINEなどでも流す想定にします。

ゲーム内の演出、ログ、ミッション発動通知はアプリ内通知で十分です。

## 8. MacBook AirとiPhoneで確認する手順

### 実機確認

Macで開発サーバーを起動します。

```sh
npm run dev -- --host 0.0.0.0
```

MacのローカルIPアドレスを確認します。

```sh
ipconfig getifaddr en0
```

iPhoneを同じWi-Fiに接続し、Safariで以下のように開きます。

```txt
http://192.168.x.x:3000
```

### iPhoneミラーリング

Macの「iPhoneミラーリング」アプリを使うと、Mac上からiPhoneを操作して確認できます。

主な条件:

- macOS Sequoia 15以降
- iOS 18以降
- MacとiPhoneで同じApple Account
- BluetoothとWi-Fiがオン
- iPhoneがロックされ、Macの近くにあること

確認手順:

1. Macで「iPhoneミラーリング」を開く。
2. iPhoneを近くに置き、ロックする。
3. Macから接続する。
4. iPhoneのSafariでローカルURLまたはVercel URLを開く。
5. ホーム画面追加、PWA起動、通知許可UIを確認する。
