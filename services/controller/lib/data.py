import shutil
from datetime import datetime
from pathlib import Path

from lib.logger import logger
from lib.transcriber import Transcriber


class Data:
    """
    データ操作を行うクラス。
    Attributes:
        path (Path): データファイルが格納されているディレクトリのパス。
    """

    def __init__(self, path: Path, transcriber: Transcriber):
        """
        Args:
            path (Path): データファイルが格納されているディレクトリのパス。
            transcriber (Transcriber): 文字起こしを行うためのTranscriberインスタンス。
        """
        self.path = path
        self.transcriber = transcriber

    def get_folders(self) -> list[Path]:
        """
        指定されたディレクトリから、特定の条件を満たすフォルダーのリストを取得します。
        Returns:
            list: 条件を満たすフォルダーのリスト。
        """
        folders = []
        for folder in sorted(self.path.iterdir()):
            # フォルダーでなければスキップ
            if not folder.is_dir():
                continue
            # フォルダー名：YYYY-MM-DD_HH-MM-SS の形式であることを確認
            try:
                datetime.strptime(folder.name, "%Y-%m-%d_%H-%M-%S")
            except ValueError:
                continue
            # rec_end.dat が存在しない場合はスキップ
            if not (folder / "rec_end.dat").is_file():
                continue
            folders.append(folder)
        return folders

    def get_transcription_name(self, folder: Path) -> str:
        """
        議事録の名前を取得します。
        Args:
            folder (Path): 名前を取得するフォルダーのパス。
        Returns:
            str: 議事録の名前。
        """
        try:
            date = datetime.strptime(folder.name, "%Y-%m-%d_%H-%M-%S")
            date_text = date.strftime("%Y-%m-%d %H:%M:%S")
            transcription_name = f"【議事録】 {date_text}"
            return transcription_name
        except ValueError:
            logger.error(f"フォルダー名の形式が不正です: {folder.name}")
            return "【議事録】 不明"

    def get_transcription(self, folder: Path) -> str | None:
        """
        指定されたフォルダー内の音声ファイルを文字起こしし、結果を結合して返します。
        Args:
            folder (Path): 文字起こしする音声ファイルが格納されているフォルダーのパス。
        Returns:
            str | None: 文字起こし結果を結合した文字列を返します。文字起こし結果が空の場合は None を返します。
        """
        logger.info(f"フォルダー {folder} の音声ファイルを文字起こししています。")
        transcriptions = []
        for file in sorted(folder.glob("rec_*.wav")):
            transcription = self.transcriber.transcribe(file)
            transcriptions.append(transcription)
        text = "\n".join(transcriptions)
        logger.info(f"フォルダー {folder} の文字起こしが完了しました。")
        if not text.strip():
            return None
        return text

    def delete_folder(self, folder_path: Path) -> None:
        """
        指定されたフォルダーを削除します。
        Args:
            folder_path (Path): 削除するフォルダーのパス。
        """
        if folder_path.is_dir():
            shutil.rmtree(folder_path)
        logger.info(f"フォルダー {folder_path} を削除しました。")

    def delete_end_dat(self, folder_path: Path) -> None:
        """
        指定されたフォルダー内の rec_end.dat ファイルを削除します。
        Args:
            folder_path (Path): rec_end.dat ファイルを削除するフォルダーのパス。
        """
        end_dat_path = folder_path / "rec_end.dat"
        if end_dat_path.is_file():
            end_dat_path.unlink()
        logger.info(f"フォルダー {folder_path} 内の rec_end.dat ファイルを削除しました。")
