import unittest
from unittest.mock import MagicMock, patch

from lib.logger import logger
from lib.notification import Notification


class TestNotification(unittest.TestCase):
    """
    通知のテストクラス
    """

    def setUp(self):
        """
        テストのセットアップを行います。
        """
        self.notification = Notification("https://example.com/webhook")  # テスト用のWebhook URLを指定してください
        logger.setLevel("CRITICAL")  # テスト中のログ出力を抑制するためにログレベルを変更

    def tearDown(self):
        """
        テストの後処理を行います。
        """
        logger.setLevel("INFO")  # ログレベルを元に戻す

    @patch("lib.notification.requests.post")
    def test_send_notification(self, mock_post):
        """
        send_notification メソッドのテスト
        """
        mock_response = MagicMock()
        mock_response.json.return_value = {"id": "12345"}
        mock_post.return_value = mock_response

        message = "This is a test notification."
        result = self.notification.send_notification(message)
        mock_post.assert_called_once_with("https://example.com/webhook?wait=true", json={"content": message}, timeout=10)
        self.assertEqual(result, "12345")

    @patch("lib.notification.requests.patch")
    def test_edit_notification(self, mock_patch):
        """
        edit_notification メソッドのテスト
        """
        mock_response = MagicMock()
        mock_response.json.return_value = {"id": "12345"}
        mock_patch.return_value = mock_response

        message_id = "12345"
        new_message = "This is an edited test notification."
        self.notification.edit_notification(message_id, new_message)
        mock_patch.assert_called_once_with(f"https://example.com/webhook/messages/{message_id}", json={"content": new_message}, timeout=10)
