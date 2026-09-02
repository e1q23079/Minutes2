# import os
import ollama

from lib.logger import logger


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
        prompt = f"""以下は会議の文字起こしデータです。
        会話の内容を省略・除外することなく、議事録を日本語で作成してください。

        ■ 指示事項
        - 日本語で要約してください。
        - 決まった進行がない会議のため、会話の文脈からAI自身で「トピック（議題）」を見つけ出し、適切な見出しをつけて整理してください。
        - 議論の本筋に関係のない「単なる雑談」は除外してください。
        - ただし、本題に関する意見、議論の経緯、懸念点、保留になった事項は一切省略せずに具体的に記録してください。
        - 会話の中で「決定したこと」や「アクションアイテム（誰が・何を・いつまでに）」が発生した場合は、文中に埋もれないよう各見出しの中、または最後に箇条書きで目立たせてください。
        - 同じ単語や言い回しを避け、プロフェッショナルで読みやすい文章に洗練させてください。
        - 文字数の目安は1000文字程度でお願いします。
        - 「議論の網羅性」と「正確性」を最優先し、計算能力を最大限活用して出力してください。

        【重要】結果は最初から最後まで、必ず「日本語」で出力してください。英語による出力は絶対に避けてください。
        (Output strictly in Japanese.)

        【文字起こしデータ】
        {text}
        """
        minutes = ""
        try:
            logger.info("議事録作成中．．．")
            response = ollama.chat(
                model="gemma2:2b",
                messages=[
                    {
                        "role": "system",
                        "content": "あなたはプロフェッショナルな議事録作成アシスタントです。すべての回答を必ず日本語（Japanese）で行ってください。",  # noqa : E501
                    },
                    {"role": "user", "content": prompt},
                ],
            )
            minutes = response["message"]["content"]
            # print(minutes)

            # save_dir = "../../data"
            # file_path = os.path.join(save_dir, "minutes.md")

            # with open(file_path, "w", encoding="utf-8") as f:
            #    f.write(minutes)
            # print("結果を 'minutes.md' に保存しました。")
            return minutes
        except Exception as e:
            logger.error(f"エラーが発生しました: {e}")
        return ""
