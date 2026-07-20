from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import BackgroundTasks, UploadFile


@dataclass(frozen=True)
class ConversionPaths:
    input: Path
    output: Path


class TemporaryFileService:
    def __init__(self, base_directory: str | Path, chunk_size: int = 1024 * 1024) -> None:
        if chunk_size <= 0:
            raise ValueError("chunk_size must be greater than zero")

        self.base_directory = Path(base_directory).resolve()
        self.chunk_size = chunk_size

    def ensure_directory(self) -> None:
        self.base_directory.mkdir(parents=True, exist_ok=True)

    def allocate(self, input_extension: str, output_extension: str) -> ConversionPaths:
        self.ensure_directory()
        identifier = str(uuid4())
        input_suffix = self._normalize_extension(input_extension)
        output_suffix = self._normalize_extension(output_extension)

        return ConversionPaths(
            input=self.base_directory / f"{identifier}{input_suffix}",
            output=self.base_directory / f"{identifier}{output_suffix}",
        )

    async def save_upload(self, upload: UploadFile, destination: str | Path) -> None:
        destination_path = self._contained_path(destination)

        try:
            async with aiofiles.open(destination_path, "wb") as output:
                while chunk := await upload.read(self.chunk_size):
                    await output.write(chunk)
        except Exception:
            self.remove(destination_path)
            raise

    def remove(self, *paths: str | Path) -> None:
        for path in paths:
            try:
                self._contained_path(path).unlink(missing_ok=True)
            except (OSError, ValueError):
                pass

    def schedule_cleanup(
        self,
        background_tasks: BackgroundTasks,
        *paths: str | Path,
    ) -> None:
        background_tasks.add_task(self.remove, *paths)

    def _contained_path(self, path: str | Path) -> Path:
        resolved_path = Path(path).resolve()
        if not resolved_path.is_relative_to(self.base_directory):
            raise ValueError("temporary file path must be inside the base directory")
        return resolved_path

    @staticmethod
    def _normalize_extension(extension: str) -> str:
        normalized = extension.lower().removeprefix(".")
        if not normalized or not normalized.isascii() or not normalized.isalnum():
            raise ValueError("file extension must contain only ASCII letters and numbers")
        return f".{normalized}"
