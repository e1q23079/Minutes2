import time

from lib.data import Data
from lib.logger import logger
from lib.notification import Notification


class Process:
    """
    データ処理と通知のプロセスを管理するクラス。
    Attributes:
        data (Data): データ操作を行うための Data クラスのインスタンス。
        notification (Notification): 通知を送信するための Notification クラスのインスタンス。
        interval (int): データ処理の間隔（秒単位）。
    """

    def __init__(self, data: Data, notification: Notification, interval: int = 10):
        """
        Args:
            data (Data): データ操作を行うための Data クラスのインスタンス。
            notification (Notification): 通知を送信するための Notification クラスのインスタンス。
            interval (int, optional): データ処理の間隔（秒単位）。デフォルトは 10 秒。
        """
        self.data = data
        self.notification = notification
        self.interval = interval

    def _processing(self):
        """
        データ処理と通知のメインループ。
        指定された間隔でデータを取得し、通知を送信し、処理が完了したファイルを削除します。
        """
        while True:
            files = self.data.get_files()
            for file in files:
                try:
                    content = self.data.read_file(file)
                    self.notification.send_notification(content)
                    self.data.delete_file(file)
                except Exception as e:
                    logger.error(f"エラーが発生しました {file}: {e}")
            time.sleep(self.interval)

    def start(self):
        """
        プロセスを開始します。
        """
        self._processing()
