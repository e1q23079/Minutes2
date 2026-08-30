from pathlib import Path


class Data:
    def __init__(self, path: Path):
        self.path = path

    def get_files(self):
        files = []
        for file_path in self.path.glob("transcription_*.txt"):
            with file_path.open("r", encoding="utf-8") as f:
                content = f.read().strip()
                if content.endswith("--- End of Transcription ---"):
                    files.append(file_path)
        return files

    def read_file(self, file_path: Path):
        with file_path.open("r", encoding="utf-8") as f:
            return f.read()

    def delete_file(self, file_path: Path):
        if file_path.is_file():
            file_path.unlink()
