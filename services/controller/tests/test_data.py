import unittest
from pathlib import Path

from lib.data import Data


class TestData(unittest.TestCase):
    """
    データのテストクラス
    """

    def setUp(self):
        """
        テストのセットアップを行います。
        """
        self.test_path = Path("test_data")
        self.data = Data(self.test_path)

    def test_get_transcription_name(self):
        """
        get_transcription_name メソッドのテスト
        """
        file_path = self.test_path / "transcription_test.txt"
        transcription_name = self.data.get_transcription_name(file_path)
        self.assertEqual(transcription_name, "test")
