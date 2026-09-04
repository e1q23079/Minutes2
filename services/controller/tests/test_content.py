import unittest
from pathlib import Path

from lib.content import make_content
from lib.data import Data
from lib.logger import logger
from lib.transcriber import Transcriber


class TestContent(unittest.TestCase):
    """
    コンテンツ生成のテストクラス
    """

    def setUp(self):
        """
        テストのセットアップを行います。
        """
        logger.setLevel("CRITICAL")  # テスト中のログ出力を抑制するためにログレベルを変更

    def test_make_content(self):
        """
        make_content関数のテスト
        """
        # テスト用のファイルパスを作成
        test_file = Path("test_file.txt")

        # テスト用のTranscriberインスタンスを作成
        transcriber = Transcriber()

        # テスト用のDataインスタンスを作成
        data = Data(test_file, transcriber)

        # make_content関数を呼び出す
        result = make_content(test_file, data, "テストコンテンツ")

        # 期待される結果を定義
        expected_result = f"# {data.get_transcription_name(test_file)}\n\nテストコンテンツ"

        # 結果を検証
        self.assertEqual(result, expected_result)
