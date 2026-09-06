import re

from googletrans import Translator


class Lib:
    """
    ライブラリクラス
    """

    translator = Translator()

    @staticmethod
    def is_over_text_len(text: str, max_len: int) -> bool:
        """
        テキストが指定された最大長を超えているかどうかを判定する

        Args:
            text (str): 判定するテキスト
            max_len (int): 最大長

        Returns:
            bool: テキストが最大長を超えている場合はTrue、そうでない場合はFalse
        """
        return len(text) > max_len

    @staticmethod
    def is_text_jp(text: str) -> bool:
        """
        テキストが日本語かどうかを判定する

        Args:
            text (str): 判定するテキスト

        Returns:
            bool: テキストが日本語の場合はTrue、そうでない場合はFalse
        """
        if not text:
            return False
        # ひらがな・カタカナの文字が含まれているかどうかを正規表現で判定
        jp_pattern = re.search(r"[ぁ-んァ-ヴー]+", text)
        return bool(jp_pattern)

    @staticmethod
    async def translate_text_en2jp(text: str) -> str:
        """
        英語のテキストを日本語に翻訳する

        Args:
            text (str): 翻訳する英語のテキスト

        Returns:
            str: 翻訳された日本語のテキスト
        """
        translated = await Lib.translator.translate(text, src="en", dest="ja")
        return translated.text
