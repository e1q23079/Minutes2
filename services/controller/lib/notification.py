import requests

from lib.logger import logger


class Notification:
    """
    通知を送信するためのクラス。
    Attributes:
        webhook_url (str): 通知を送信するための Webhook URL。
    """

    def __init__(self, webhook_url: str):
        """
        Args:
            webhook_url (str): 通知を送信するための Webhook URL。
        """
        self.webhook_url = webhook_url

    def send_notification(self, message: str):
        """
        通知を送信します。
        Args:
            message (str): 送信する通知の内容。
        """
        logger.info("通知を送信しています。")
        data = {"content": message}
        response = requests.post(self.webhook_url, json=data)

        if response.status_code != 204:
            raise Exception(f"通知の送信に失敗しました。ステータスコード: {response.status_code}, レスポンス: {response.text}")
        logger.info("通知が正常に送信されました。")
