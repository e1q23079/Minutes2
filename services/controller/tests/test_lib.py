import unittest
from unittest.mock import patch

from lib.lib import Lib


class TestLib(unittest.TestCase):
    """
    ライブラリのテストクラス
    """

    def test_is_over_text_len_over(self):
        """
        is_over_text_len関数のテスト（テキストが最大長を超えている場合）
        """
        result = Lib.is_over_text_len("This is a test string.", 10)
        self.assertTrue(result)

    def test_is_over_text_len_not_over(self):
        """
        is_over_text_len関数のテスト（テキストが最大長を超えていない場合）
        """
        result = Lib.is_over_text_len("This is a test.", 20)
        self.assertFalse(result)

    def test_is_text_jp_true(self):
        """
        is_text_jp関数のテスト（テキストが日本語の場合）
        """
        result = Lib.is_text_jp("これはテストです。")
        self.assertTrue(result)

    def test_is_text_jp_false(self):
        """
        is_text_jp関数のテスト（テキストが日本語でない場合）
        """
        result = Lib.is_text_jp("This is a test.")
        self.assertFalse(result)

    def test_is_text_jp_empty(self):
        """
        is_text_jp関数のテスト（テキストが空の場合）
        """
        result = Lib.is_text_jp("")
        self.assertFalse(result)

    def test_is_text_jp_hiragana(self):
        """
        is_text_jp関数のテスト（テキストがひらがなを含む場合）
        """
        result = Lib.is_text_jp("あいうえお")
        self.assertTrue(result)

    def test_is_text_jp_katakana(self):
        """
        is_text_jp関数のテスト（テキストがカタカナを含む場合）
        """
        result = Lib.is_text_jp("アイウエオ")
        self.assertTrue(result)

    def test_is_text_jp_mixed(self):
        """
        is_text_jp関数のテスト（テキストがひらがなとカタカナを含む場合）
        """
        result = Lib.is_text_jp("あいうえおアイウエオ")
        self.assertTrue(result)

    def test_is_text_jp_text(self):
        """
        is_text_jp関数のテスト（文章の場合）
        """
        result = Lib.is_text_jp("これはテストです。")
        self.assertTrue(result)

    def test_is_text_jp_text_with_english(self):
        """
        is_text_jp関数のテスト（文章に英語が含まれる場合）
        """
        result = Lib.is_text_jp("これはテストです。This is a test.")
        self.assertTrue(result)

    @patch("lib.lib.ollama.chat")
    def test_translate_text_en2jp(self, mock_chat):
        """
        translate_text_en2jp関数のテスト（英語のテキストを日本語に翻訳する場合）
        """
        mock_chat.return_value = {"message": {"content": "これはテストです。"}}
        result = Lib.translate_text_en2jp("This is a test.")
        self.assertIsInstance(result, str)
        self.assertNotEqual(result, "")
        self.assertEqual(result, "これはテストです。")

    @patch("lib.lib.ollama.chat")
    def test_translate_text_en2jp_exception(self, mock_chat):
        """
        translate_text_en2jp関数のテスト（翻訳中に例外が発生する場合）
        """
        mock_chat.side_effect = Exception("翻訳中にエラーが発生しました。")
        result = Lib.translate_text_en2jp("This is a test.")
        self.assertEqual(result, "This is a test.")
