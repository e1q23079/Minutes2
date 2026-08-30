import requests

from lib.logger import logger


class Notification:
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    def send_notification(self, message: str):
        logger.info("通知を送信しています。")
        data = {"content": message}
        response = requests.post(self.webhook_url, json=data)

        if response.status_code != 204:
            raise Exception(
                f"通知の送信に失敗しました。ステータスコード: {response.status_code}, レスポンス: {response.text}"
            )
        logger.info("通知が正常に送信されました。")
