import os
from pathlib import Path

from dotenv import load_dotenv

from lib.data import Data
from lib.logger import logger
from lib.notification import Notification
from lib.process import Process

load_dotenv()

WEBHOOK_URL = os.environ.get("WEBHOOK_URL")
FILE_PATH = os.environ.get("DATA_PATH", "../data")

INTERVAL = 10


def main():
    """
    メイン関数。環境変数から設定を読み込み、データ処理と通知のプロセスを開始します。
    """

    try:
        logger.info("管理プロセスを開始します。")
        data = Data(Path(FILE_PATH))
        if not WEBHOOK_URL:
            raise ValueError(
                "Webhook URL が設定されていません。環境変数 'WEBHOOK_URL' を確認してください。"
            )
        notification = Notification(WEBHOOK_URL)
        process = Process(data, notification, interval=INTERVAL)
        process.start()

    except KeyboardInterrupt:
        logger.info("管理プロセスはユーザーによって中断されました。")
    except Exception as e:
        logger.error(f"エラーが発生しました: {e}")
    finally:
        logger.info("管理プロセスが終了しました。")


if __name__ == "__main__":
    """
    スクリプトが直接実行された場合にメイン関数を呼び出します。
    """
    main()
