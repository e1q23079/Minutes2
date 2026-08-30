FROM node:24-slim

# Install git-lfs
RUN apt-get update \
    && apt-get install -y \
    ffmpeg \
    build-essential \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*
# 作業ディレクトリを作成
WORKDIR /app
# 依存関係をインストール
COPY package*.json ./
RUN npm ci
# ソースコードをコピー
COPY . .
# ビルド
RUN npm run build
# 不要な依存関係を削除
RUN npm prune --production
# 起動
CMD ["node", "dist/index.js"]
