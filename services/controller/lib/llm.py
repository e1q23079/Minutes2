class LLM:
    """
    要約を生成するための言語モデル（LLM）を表すクラス。
    """

    def __init__(self):
        """
        LLMクラスのインスタンスを初期化します。
        """
        self.model_name = "default_model"

    def generate_summary(self, text: str) -> str:
        """
        与えられたテキストの要約を生成します。
        """
        return "This is a generated summary -> " + text[:50] + "..."  # 仮の要約生成ロジック
