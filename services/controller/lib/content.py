from pathlib import Path

from lib.data import Data


def make_content(file: Path, data: Data, content: str) -> str:
    """
    コンテンツから見出しを生成します。
    Args:
        file (Path): 見出しを生成する元となるファイルのパス。
        data (Data): データ操作を行うための Data クラスのインスタンス。
        content (str): 元となるコンテンツ。
    Returns:
        str: 生成された見出し。
    """
    content_name = data.get_transcription_name(file)
    content = f"# {content_name}\n\n{content}"
    return content
