import time

from lib.data import Data
from lib.logger import logger
from lib.notification import Notification


class Process:
    def __init__(self, data: Data, notification: Notification, interval: int = 10):
        self.data = data
        self.notification = notification
        self.interval = interval

    def processing(self):
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
        self.is_running = True
        self.processing()
