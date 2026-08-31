from pathlib import Path


class Data:
    """
    データ操作を行うクラス。
    Attributes:
        path (Path): データファイルが格納されているディレクトリのパス。
    """

    def __init__(self, path: Path):
        """
        Args:
            path (Path): データファイルが格納されているディレクトリのパス。
        """
        self.path = path

    def get_files(self):
        """
        指定されたディレクトリから、特定の条件を満たすファイルのリストを取得します。
        Returns:
            list: 条件を満たすファイルのリスト。
        """
        files = []
        for file_path in self.path.glob("transcription_*.txt"):
            with file_path.open("r", encoding="utf-8") as f:
                content = f.read().strip()
                if content.endswith("--- End of Transcription ---"):
                    files.append(file_path)
        return files

    def get_transcription_name(self, file_path: Path) -> str:
        """
        指定された議事録ファイルの名前を取得します。
        Args:
            file_path (Path): 名前を取得するファイルのパス。
        Returns:
            str: ファイルの名前。
        """
        return file_path.stem.removeprefix("transcription_")

    def read_file(self, file_path: Path):
        """
        指定されたファイルの内容を読み取ります。
        Args:
            file_path (Path): 読み取るファイルのパス。
        Returns:
            str: ファイルの内容。
        """
        with file_path.open("r", encoding="utf-8") as f:
            return f.read()

    def delete_file(self, file_path: Path):
        """
        指定されたファイルを削除します。
        Args:
            file_path (Path): 削除するファイルのパス。
        """
        if file_path.is_file():
            file_path.unlink()
