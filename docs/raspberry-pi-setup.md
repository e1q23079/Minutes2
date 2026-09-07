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
