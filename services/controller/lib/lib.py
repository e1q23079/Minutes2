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
