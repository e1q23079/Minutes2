import unittest
from pathlib import Path

from lib.data import Data
from lib.logger import logger
from lib.transcriber import Transcriber


class TestData(unittest.TestCase):
    """
    データのテストクラス
    """

    def setUp(self):
        """
        テストのセットアップを行います。
        """
        self.transcriber = Transcriber()
        self.test_path = Path("test_data")
        self.data = Data(self.test_path, self.transcriber)
        logger.setLevel("CRITICAL")  # テスト中のログ出力を抑制するためにログレベルを変更

    def test_get_transcription_name(self):
        """
        get_transcription_name メソッドのテスト
        """
        transcription_name = self.data.get_transcription_name(self.test_path)
        self.assertEqual(transcription_name, "test_data")
