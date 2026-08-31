import threading
from pathlib import Path

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

    def _make_content(self, file: Path, content: str) -> str:
        """
        コンテンツから見出しを生成します。
        Args:
            file (Path): 見出しを生成する元となるファイルのパス。
            content (str): 元となるコンテンツ。
            processing (bool): 処理中かどうか。
        Returns:
            str: 生成された見出し。
        """
        content_name = self.data.get_transcription_name(file)
        content = f"# {content_name}\n\n{content}"
        return content

    def _processing(self):
        """
        データ処理と通知のメインループ。
        指定された間隔でデータを取得し、通知を送信し、処理が完了したファイルを削除します。
        """
        logger.info("管理プロセスを実行しています。")
        while not self._stop_event.is_set():
            files = self.data.get_files()
            for file in files:
                try:
                    # データを読み込み
                    content = self.data.read_file(file)
                    # 通知を送信
                    message = self._make_content(file, "議事録を作成しています...")
                    message_id = self.notification.send_notification(message)
                    # LLMを使って要約を生成
                    summary = self.llm.generate_summary(content)
                    # 通知を編集して要約を送信
                    message = self._make_content(file, summary)
                    self.notification.edit_notification(message_id, message)
                    # 処理が完了したファイルを削除
                    self.data.delete_file(file)
                except Exception as e:
                    logger.error(f"エラーが発生しました {file}: {e}")
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
