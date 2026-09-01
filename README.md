# Voxnote

Voxnote は、Discord のボイスチャンネルで行われる会議や雑談を自動で文字起こしし、議事録として保存するための Bot です。

## 主な機能

- 指定した Discord ボイスチャンネルを監視
- ボイスチャンネルへの参加・退出を自動検知
- 音声を文字起こししてテキスト化
- 文字起こし結果を `.txt` ファイルとして保存
- 議事録内容を Webhook で外部サービスに通知
- Docker とローカル開発の両方で起動可能

## 技術スタック

- Node.js / TypeScript
- Discord.js
- Hugging Face Transformers
- Whisper (ONNX)
- Ollama（ローカル LLM 実行）
- Docker / Docker Compose

## 必要環境

- Node.js 20 以上
- npm
- Python 3.9 以上（Controller 用）
- Discord Bot の API トークン
- 対象の Discord ボイスチャンネル ID
- Webhook URL（議事録送信先）
- Ollama（ローカル開発時の LLM 実行用、例: `gemma2:2b`）
- Docker / Docker Compose（コンテナ利用時）

## 環境変数設定

### Bot の環境変数

開発環境では `services/bot/.env` を作成して、次の値を設定してください。

```env
API_KEY=<YOUR_DISCORD_BOT_TOKEN>
VOICE_CHANNEL_ID=<YOUR_VOICE_CHANNEL_ID>
```

- `API_KEY`: Discord Bot のトークン
- `VOICE_CHANNEL_ID`: 監視対象のボイスチャンネル ID

### Controller の環境変数

開発環境では `services/controller/.env` を作成して、次の値を設定してください。

```env
WEBHOOK_URL=<YOUR_WEBHOOK_URL>
```

- `WEBHOOK_URL`: 議事録を送信する Webhook の URL（例：Slack, Discord, カスタムサーバー）

### ローカル LLM（Ollama）の環境変数

ローカル開発時は Ollama を使って生成系の処理を実行する場合があります。まず、Ollama のサーバーを起動してからモデルを pull して利用します。

ターミナル 1 でサーバーを起動:

```bash
ollama serve
```

別ターミナル 2 でモデルを pull して確認:

```bash
ollama pull gemma2:2b
ollama list
ollama run gemma2:2b
```

この例では `gemma2:2b` を使用し、ローカル環境で会話確認や生成処理の動作確認を行えます。`ollama serve` はバックグラウンドでローカル API を提供するため、モデルの実行前に別ターミナルで起動しておくのが基本です。

## ローカル開発での起動

### 1. Bot の起動

```bash
cd services/bot
npm install
npm run dev
```

### 2. Controller の起動

Bot の起動後、別のターミナルで Controller を起動します。

```bash
cd services/controller
python3 -m venv venv
source venv/bin/activate  # Windows では: venv\Scripts\activate
pip install -r requirements.txt
python3 main.py
```

Bot を起動した後、指定したボイスチャンネルにユーザーが参加すると自動的に接続し、会話を文字起こしします。Controller が起動中であれば、文字起こし結果は自動的に Webhook 経由で送信されます。

## Docker での起動

Docker で起動する前に、環境変数をそれぞれ設定してください。

`/.env`:

```env
API_KEY=<YOUR_DISCORD_BOT_TOKEN>
VOICE_CHANNEL_ID=<YOUR_VOICE_CHANNEL_ID>
WEBHOOK_URL=<YOUR_WEBHOOK_URL>
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
3. Webhook URL を用意する（Slack, Discord, または独自サーバー）
4. Bot と Controller をそれぞれ起動する
5. 会話中のチャンネルにユーザーが参加すると文字起こしが開始される
6. 会話終了時にテキストログがファイルに保存される
7. Controller が自動的に文字起こし結果を Webhook 経由で送信する

## 注意事項

- 音声品質やノイズによって文字起こし精度が変わる場合があります
- Whisper の初期化には時間がかかることがあります
- CPU / メモリ使用量は文字起こし処理の負荷に応じて増加します
