# Voxnote

Voxnote は、Discord のボイスチャンネルで行われる会議や雑談を自動で文字起こしし、議事録として保存するための Bot です。

## 主な機能

- 指定した Discord ボイスチャンネルを監視
- ボイスチャンネルへの参加・退出を自動検知
- 音声を文字起こししてテキスト化
- 文字起こし結果を `.txt` ファイルとして保存
- Docker とローカル開発の両方で起動可能

## 技術スタック

- Node.js / TypeScript
- Discord.js
- Hugging Face Transformers
- Whisper (ONNX)
- Docker / Docker Compose

## 必要環境

- Node.js 20 以上
- npm
- Discord Bot の API トークン
- 対象の Discord ボイスチャンネル ID
- Docker / Docker Compose（コンテナ利用時）

## 環境変数設定

開発環境では `services/bot/.env` を作成して、次の値を設定してください。

```env
API_KEY=<YOUR_DISCORD_BOT_TOKEN>
VOICE_CHANNEL_ID=<YOUR_VOICE_CHANNEL_ID>
```

- `API_KEY`: Discord Bot のトークン
- `VOICE_CHANNEL_ID`: 監視対象のボイスチャンネル ID

## ローカル開発での起動

```bash
cd services/bot
npm install
npm run dev
```

Bot を起動した後、指定したボイスチャンネルにユーザーが参加すると自動的に接続し、会話を文字起こしします。

## Docker での起動

Docker で起動する前に、`services/bot/.env` に必要な環境変数を設定してください。

```env
API_KEY=<YOUR_DISCORD_BOT_TOKEN>
VOICE_CHANNEL_ID=<YOUR_VOICE_CHANNEL_ID>
```

```bash
docker compose build
docker compose up -d
```

停止時は以下を実行してください。

```bash
docker compose down
```

## 保存先

文字起こし結果は次の形式で保存されます。

```text
services/bot/data/transcription_YYYY-MM-DD_HH-MM-SS.txt
```

また、コンテナ実行時は `DATA_DIR=/data` の設定により `/data` 配下に保存されます。

## 基本的な使い方

1. Discord Bot を作成し、対象サーバーに招待する
2. 対象のボイスチャンネル ID を `VOICE_CHANNEL_ID` に設定する
3. アプリを起動する
4. 会話中のチャンネルにユーザーが参加すると文字起こしが開始される
5. 会話終了時にテキストログがファイルに保存される

## 注意事項

- 音声品質やノイズによって文字起こし精度が変わる場合があります
- Whisper の初期化には時間がかかることがあります
- CPU / メモリ使用量は文字起こし処理の負荷に応じて増加します
