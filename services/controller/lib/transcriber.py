from pathlib import Path

from faster_whisper import WhisperModel

from lib.logger import logger


class Transcriber:
    """
    音声ファイルを文字起こしするためのクラス。
    Attributes:
        model (WhisperModel): Whisperモデルのインスタンス。
    """

    def __init__(self, device: str = "cpu", compute_type: str = "int8"):
        """
        Args:
            device (str): モデルを実行するデバイス。デフォルトは "cpu"。
            compute_type (str): モデルの計算タイプ。デフォルトは "int8"。
        """
        logger.info(f"Whisperを初期化しています。device={device}, compute_type={compute_type}")
        self.model = WhisperModel("small", device=device, compute_type=compute_type)
        logger.info("Whisperの初期化が完了しました。")

    def transcribe(self, audio_path: Path) -> str:
        """
        音声ファイルを文字起こしします。
        Args:
            audio_path (Path): 文字起こしする音声ファイルのパス。
        Returns:
            str: 文字起こし結果。
        """
        segments, _ = self.model.transcribe(str(audio_path), beam_size=5, language="ja")
        transcription = "".join(segment.text for segment in segments).strip()
        return transcription
