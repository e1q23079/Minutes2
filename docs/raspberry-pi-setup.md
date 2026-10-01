# Raspberry Piの初期設定

## SSH接続

ラズパイと同じネットワークに接続した端末から、次のコマンドでSSH接続します。

```bash
ssh <ユーザー名>@<ホスト名>.local
```

## パッケージの更新

ラズパイに接続後、次のコマンドでパッケージ一覧とインストール済みのパッケージを更新します。

```bash
sudo apt update && sudo apt upgrade -y
```

## Dockerのインストール

Docker公式のインストールスクリプトを実行します。

```bash
curl -fsSL https://get.docker.com | sh
```

インストール後、DockerとDocker Composeが利用できることを確認します。

```bash
docker -v
docker compose version
```

## Dockerの実行設定

スワップ領域の状態を確認

```bash
sudo swapon --show
free -h
```

スワップ用ファイルの作成

```bash
sudo fallocate -l 2G /swapfile
```

権限の設定

```bash
sudo chmod 600 /swapfile
```

ファイルをスワップ形式に初期化&有効化

```bash
sudo mkswap /swapfile
sudo swapon /swapfile
```

設定を永続化

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

現在のユーザーを`docker`グループに追加すると、毎回`sudo`を付けずにDockerを実行できます。

```bash
sudo usermod -aG docker $USER
```

グループ設定を反映するため、いったんSSHセッションからログアウトして再接続してください。

Dockerのsystemd設定を編集し、`[Service]`セクションに次の設定を追加します。

```bash
sudo systemctl edit docker
```

```ini
[Service]
Environment="MOBY_DISABLE_PIGZ=true"
```

設定を反映してDockerを再起動します。

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```
