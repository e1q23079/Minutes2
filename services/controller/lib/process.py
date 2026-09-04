import threading

from lib.content import make_content
from lib.data import Data
from lib.llm import LLM
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
        self._stop_event = threading.Event()
        self.llm = LLM()

    def _processing(self):
        """
        データ処理と通知のメインループ。
        指定された間隔でデータを取得し、通知を送信し、処理が完了したファイルを削除します。
        """
        logger.info("管理プロセスを実行しています。")
        while not self._stop_event.is_set():
            folders = self.data.get_folders()
            for folder in folders:
                try:
                    # 通知を送信
                    message = make_content(folder, self.data, "議事録を作成しています...")
                    message_id = self.notification.send_notification(message)
                    # データを読み込み
                    content = self.data.get_transcription(folder)
                    if content is None:
                        # 音声ファイルが空の場合はフォルダーを削除して次のフォルダーへ
                        self.data.delete_folder(folder)
                        # 通知を編集して要約を送信
                        message = make_content(folder, self.data, "音声ファイルが空のため、処理をスキップしました。")
                        self.notification.edit_notification(message_id, message)
                        continue
                    # LLMを使って要約を生成
                    summary = self.llm.generate_summary(content)
                    success = summary != ""
                    if not success:
                        summary = "要約の生成に失敗しました。"
                    # 通知を編集して要約を送信
                    message = make_content(folder, self.data, summary)
                    self.notification.edit_notification(message_id, message)
                    if success:
                        # 処理が完了したファイルを削除
                        self.data.delete_folder(folder)
                except Exception as e:
                    logger.error(f"エラーが発生しました {folder}: {e}")
            if self._stop_event.wait(self.interval):
                break

    def start(self):
        """
        プロセスを開始します。
        """
        logger.info("管理プロセスを開始します。")
        self._processing()

    def stop(self):
        """
        プロセスを停止します。
        """
        logger.info("管理プロセスを停止します。")
        self._stop_event.set()
