import re

import ollama

from lib.logger import logger


class Lib:
    """
    ライブラリクラス
    """

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
        try:
            logger.info("翻訳を開始します。")
            response = ollama.chat(
                model="gemma2:2b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "あなたは英語から日本語への翻訳アシスタントです。\n"
                            "入力された英語の文章を、自然で正確な日本語に翻訳してください。\n"
                            "要約したり、原文にない情報を追加したりしないでください。\n"
                            "翻訳結果のみを出力してください。\n"
                        ),
                    },
                    {"role": "user", "content": text},
                ],
            )
            logger.info("翻訳が完了しました。")
            return response["message"]["content"]
        except Exception as e:
            logger.error(f"翻訳中にエラーが発生しました: {e}")
            return text  # エラーが発生した場合は元のテキストを返す
