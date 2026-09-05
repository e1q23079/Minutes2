# Minutes

Minutes は、Discord のボイスチャンネルで行われる会議や雑談を自動で文字起こしし、議事録として保存するための Bot です。

## 主な機能

- 指定した Discord ボイスチャンネルを監視
- ボイスチャンネルへの参加・退出を自動検知
- 録音データを Whisper で日本語に文字起こし
- 文字起こし結果を Ollama の LLM で議事録に要約
- 議事録の作成状況と結果を Webhook で通知
- 処理済みの録音データを自動削除
- Docker とローカル開発の両方で起動可能

## 技術スタック

- Node.js / TypeScript
- Discord.js
- Whisper
- Ollama（ローカル LLM 実行）
- Docker / Docker Compose

## 必要環境

- Node.js 20 以上
- npm
- Python 3.12 以上（Controller 用、Docker 利用時）
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

### ローカル LLM（Ollama）の環境

ローカル開発時は Ollama を使って議事録の要約を生成します。`gemma2:2b` モデルを使用するため、事前に Ollama のサーバーを起動してモデルを pull してください。

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

Controller は `gemma2:2b` に接続して、文字起こし結果から日本語の議事録を生成します。`ollama serve` を起動したまま Controller を実行してください。

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

録音中は、セッションごとに次の形式のフォルダーへ WAV ファイルが保存されます。

```text
services/data/YYYY-MM-DD_HH-MM-SS/rec_YYYY-MM-DD_HH-MM-SS_<USER_ID>.wav
```

録音終了時に同じフォルダーへ `rec_end.dat` が作成されると、Controller が処理を開始します。Controller はフォルダー内の WAV ファイルを文字起こしし、LLM で議事録を生成して Webhook に通知します。

処理が成功した場合、または音声ファイルが空で処理をスキップした場合は、対象フォルダーを削除します。要約の生成に失敗した場合はデータを削除せず、残します。

コンテナ実行時は Bot と Controller がホストの `./services/data` をコンテナ内の `/data` として共有します。

### 要約に失敗した場合のリトライ

要約の生成に失敗した場合、対象の録音フォルダーは削除されずに残ります。対象フォルダーを確認し、`rec_end.dat` を作成すると Controller が再度処理します。

```bash
cd services/data
ls
cd 2026-09-01_00-00-00
touch rec_end.dat
```

`2026-09-01_00-00-00` の部分は、リトライしたい録音フォルダー名に置き換えてください。

### 稼働状況とログの確認

コンテナが起動しているか確認するには、次のコマンドを実行します。

```bash
docker ps
```

一覧に `minutes-bot`、`minutes-controller`、`minutes-llm` が表示されていれば、それぞれのコンテナが起動しています。表示されないコンテナや停止したコンテナの状態を確認する場合は、`docker ps -a` を使用してください。

各サービスのログをリアルタイムで確認するには、サービスごとに次のコマンドを実行します。

```bash
docker logs -f minutes-bot
docker logs -f minutes-controller
docker logs -f minutes-llm
```

`-f` はログを継続的に表示するオプションです。ログの表示を終了するには `Ctrl+C` を押してください。

## 基本的な使い方

1. Discord Bot を作成し、対象サーバーに招待する
2. 対象のボイスチャンネル ID を `VOICE_CHANNEL_ID` に設定する
3. Webhook URL を用意する（Slack, Discord, または独自サーバー）
4. Bot と Controller をそれぞれ起動する
5. 会話中のチャンネルにユーザーが参加すると文字起こしが開始される
6. 会話終了時に録音フォルダーへ終了マーカーが作成される
7. Controller が文字起こしと議事録生成を行い、結果を Webhook 経由で送信する
8. 処理が成功した録音フォルダーが削除される

## 注意事項

- 音声品質やノイズによって文字起こし精度が変わる場合があります
- Whisper の初期化には時間がかかることがあります
- CPU / メモリ使用量は文字起こし処理の負荷に応じて増加します
