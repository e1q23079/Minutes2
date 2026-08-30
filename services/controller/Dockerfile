FROM python:3.12-slim

# 作業ディレクトリを作成
WORKDIR /app
# 依存関係をインストール
COPY requirements.txt ./
# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt
# ソースコードをコピー
COPY . .
# 起動
CMD ["python", "main.py"]
