import requests

from lib.lib import Lib
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

    def send_notification(self, message: str) -> str | None:
        """
        通知を送信します。
        Args:
            message (str): 送信する通知の内容。
        Returns:
            str | None: 送信された通知のID、またはNone。
        """
        logger.info("通知を送信しています。")
        if Lib.is_over_text_len(message, 2000):
            logger.error("通知の送信に失敗しました。メッセージが長すぎます。")
            return None
        data = {"content": message}
        response = requests.post(f"{self.webhook_url}?wait=true", json=data, timeout=10)
        response.raise_for_status()  # ステータスコードが200番台でない場合に例外を発生させる
        logger.info("通知が正常に送信されました。")

        return response.json()["id"]

    def edit_notification(self, message_id: str, new_message: str) -> bool:
        """
        既存の通知を編集します。
        Args:
            message_id (str): 編集する通知のID。
            new_message (str): 新しい通知の内容。
        Returns:
            bool: 通知の編集が成功した場合True、それ以外はFalse。
        """
        logger.info("通知を編集しています。")
        if Lib.is_over_text_len(new_message, 2000):
            logger.error("通知の編集に失敗しました。新しいメッセージが長すぎます。")
            return False
        data = {"content": new_message}
        response = requests.patch(f"{self.webhook_url}/messages/{message_id}", json=data, timeout=10)
        response.raise_for_status()  # ステータスコードが200番台でない場合に例外を発生させる
        logger.info("通知が正常に編集されました。")
        return True
