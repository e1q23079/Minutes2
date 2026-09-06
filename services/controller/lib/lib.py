import re

import argostranslate.package
import argostranslate.translate

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
    def install_translation_model() -> bool:
        """
        Argos Translateの翻訳モデルをインストールする
        """
        try:
            installed_languages = argostranslate.translate.get_installed_languages()
            for language in installed_languages:
                if language.code == "en":
                    for translation in language.translations_from:
                        if translation.to_lang.code == "ja":
                            logger.info("翻訳モデルはすでにインストールされています")
                            return True

            argostranslate.package.update_package_index()
            packages = argostranslate.package.get_available_packages()
            for package in packages:
                if package.from_code == "en" and package.to_code == "ja":
                    argostranslate.package.install_from_path(package.download())
                    logger.info("翻訳モデルのインストールに成功しました")
                    return True
            logger.warning("翻訳モデルが見つかりませんでした")
        except Exception as e:
            logger.error(f"翻訳モデルのインストールに失敗しました: {e}")
        return False

    @staticmethod
    def translate_text_en2jp(text: str) -> str:
        """
        英語のテキストを日本語に翻訳する

        Args:
            text (str): 翻訳する英語のテキスト

        Returns:
            str: 翻訳された日本語のテキスト
        """
        if not text or not text.strip():
            return text

        try:
            translated_text = argostranslate.translate.translate(text, "en", "ja")
            return translated_text
        except Exception as e:
            # 翻訳に失敗した場合は元のテキストを返す
            print(f"翻訳に失敗しました: {e}")
            return text
