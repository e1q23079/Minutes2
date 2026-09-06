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
    def translate_text_en2jp(text: str) -> str:
        """
        英語のテキストを日本語に翻訳する

        Args:
            text (str): 翻訳する英語のテキスト

        Returns:
            str: 翻訳された日本語のテキスト
        """
        lines = text.splitlines()
        translated_lines = []
        for line in lines:
            if not line.strip():
                translated_lines.append("")
                continue
            translated_line = Lib.translator.translate(line, src="en", dest="ja")
            translated_lines.append(translated_line.text)
        return "\n".join(translated_lines)
