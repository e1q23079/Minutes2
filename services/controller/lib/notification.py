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

    def send_notification(self, message: str) -> str:
        """
        通知を送信します。
        Args:
            message (str): 送信する通知の内容。
        Returns:
            str: 送信された通知のID。
        """
        logger.info("通知を送信しています。")
        data = {"content": message}
        response = requests.post(f"{self.webhook_url}?wait=true", json=data, timeout=10)
        response.raise_for_status()  # ステータスコードが200番台でない場合に例外を発生させる
        logger.info("通知が正常に送信されました。")

        return response.json()["id"]

    def edit_notification(self, message_id: str, new_message: str) -> None:
        """
        既存の通知を編集します。
        Args:
            message_id (str): 編集する通知のID。
            new_message (str): 新しい通知の内容。
        """
        logger.info("通知を編集しています。")
        data = {"content": new_message}
        response = requests.patch(f"{self.webhook_url}/messages/{message_id}", json=data, timeout=10)
        response.raise_for_status()  # ステータスコードが200番台でない場合に例外を発生させる
        logger.info("通知が正常に編集されました。")
