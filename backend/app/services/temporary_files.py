from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import BackgroundTasks, HTTPException, UploadFile

from app.config import DEFAULT_MAX_UPLOAD_FILE_SIZE


@dataclass(frozen=True)
class ConversionPaths:
    input: Path
    output: Path


class TemporaryFileService:
    def __init__(
        self,
        base_directory: str | Path,
        chunk_size: int = 1024 * 1024,
        max_file_size: int = DEFAULT_MAX_UPLOAD_FILE_SIZE,
    ) -> None:
        if chunk_size <= 0:
            raise ValueError("chunk_size must be greater than zero")
        if max_file_size <= 0:
            raise ValueError("max_file_size must be greater than zero")

        self.base_directory = Path(base_directory).resolve()
        self.chunk_size = chunk_size
        self.max_file_size = max_file_size

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

    async def save_upload(self, upload: UploadFile, destination: str | Path) -> int:
        destination_path = self._contained_path(destination)
        bytes_written = 0

        try:
            async with aiofiles.open(destination_path, "wb") as output:
                while chunk := await upload.read(self.chunk_size):
                    bytes_written += len(chunk)
                    if bytes_written > self.max_file_size:
                        maximum_megabytes = self.max_file_size // (1024 * 1024)
                        raise HTTPException(
                            status_code=413,
                            detail=(
                                "O arquivo enviado excede o limite máximo permitido "
                                f"de {maximum_megabytes}MB."
                            ),
                        )
                    await output.write(chunk)
            if bytes_written == 0:
                raise HTTPException(
                    status_code=400,
                    detail="O arquivo enviado está vazio.",
                )
            return bytes_written
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
