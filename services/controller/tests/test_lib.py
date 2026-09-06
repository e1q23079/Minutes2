import unittest

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
