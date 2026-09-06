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

    @patch("lib.notification.requests.post")
    def test_send_notification_over_length(self, mock_post):
        """
        send_notification メソッドのテスト（メッセージが長すぎる場合）
        """
        long_message = "A" * 2001  # 2001文字の長いメッセージ
        result = self.notification.send_notification(long_message)
        mock_post.assert_not_called()  # requests.postは呼ばれないことを確認
        self.assertIsNone(result)  # Noneが返されることを確認

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

    @patch("lib.notification.requests.patch")
    def test_edit_notification_over_length(self, mock_patch):
        """
        edit_notification メソッドのテスト（新しいメッセージが長すぎる場合）
        """
        long_message = "A" * 2001  # 2001文字の長いメッセージ
        message_id = "12345"
        result = self.notification.edit_notification(message_id, long_message)
        mock_patch.assert_not_called()  # requests.patchは呼ばれないことを確認
        self.assertFalse(result)  # Falseが返されることを確認
