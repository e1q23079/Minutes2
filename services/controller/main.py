import os
from pathlib import Path

from dotenv import load_dotenv

from lib.data import Data
from lib.logger import logger
from lib.notification import Notification
from lib.process import Process

load_dotenv()


def main():
    webhook_url = os.environ.get("WEBHOOK_URL")
    file_path = os.environ.get("DATA_PATH", "../data")
    if not webhook_url:
        raise ValueError(
            "Webhook URL が設定されていません。環境変数 'WEBHOOK_URL' を確認してください。"
        )
    try:
        logger.info("管理プロセスを開始します。")
        data = Data(Path(file_path))
        notification = Notification(webhook_url)
        process = Process(data, notification, interval=10)
        process.start()

    except KeyboardInterrupt:
        logger.info("管理プロセスはユーザーによって中断されました。")
    except Exception as e:
        logger.error(f"エラーが発生しました: {e}")
    finally:
        logger.info("管理プロセスが終了しました。")


if __name__ == "__main__":
    main()
