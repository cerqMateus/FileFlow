from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

import anyio
import pytest
from fastapi import BackgroundTasks, UploadFile

from app.services import TemporaryFileService


def test_allocate_normalizes_extensions_and_keeps_paths_contained(tmp_path: Path) -> None:
    service = TemporaryFileService(tmp_path / "temp")

    paths = service.allocate(".PDF", "DoCx")

    assert paths.input.suffix == ".pdf"
    assert paths.output.suffix == ".docx"
    assert paths.input.stem == paths.output.stem
    assert paths.input.is_relative_to(service.base_directory)
    assert paths.output.is_relative_to(service.base_directory)
    assert service.base_directory.is_dir()


@pytest.mark.parametrize(
    "extension",
    ["", ".", "../pdf", "pdf/svg", "pdf\\svg", "tar.gz", "💾"],
)
def test_allocate_rejects_unsafe_extensions(tmp_path: Path, extension: str) -> None:
    service = TemporaryFileService(tmp_path / "temp")

    with pytest.raises(ValueError):
        service.allocate(extension, "pdf")


def test_allocate_is_unique_under_concurrency(tmp_path: Path) -> None:
    service = TemporaryFileService(tmp_path / "temp")

    with ThreadPoolExecutor(max_workers=8) as executor:
        allocations = list(executor.map(lambda _: service.allocate("pdf", "docx"), range(100)))

    identifiers = {paths.input.stem for paths in allocations}
    assert len(identifiers) == 100
    assert all(paths.input.stem == paths.output.stem for paths in allocations)


def test_save_upload_writes_multiple_chunks(tmp_path: Path) -> None:
    service = TemporaryFileService(tmp_path / "temp", chunk_size=4)
    paths = service.allocate("pdf", "docx")
    content = b"content-larger-than-one-chunk"
    upload = UploadFile(file=BytesIO(content), filename="document.pdf")

    anyio.run(service.save_upload, upload, paths.input)

    assert paths.input.read_bytes() == content
    service.remove(paths.input)
    assert not paths.input.exists()


def test_remove_is_idempotent(tmp_path: Path) -> None:
    service = TemporaryFileService(tmp_path / "temp")
    paths = service.allocate("png", "jpg")
    paths.input.write_bytes(b"image")

    service.remove(paths.input, paths.output)
    service.remove(paths.input, paths.output)

    assert not paths.input.exists()
    assert not paths.output.exists()


def test_remove_does_not_delete_files_outside_base_directory(tmp_path: Path) -> None:
    service = TemporaryFileService(tmp_path / "temp")
    outside_path = tmp_path / "outside.pdf"
    outside_path.write_bytes(b"keep")

    service.remove(outside_path)

    assert outside_path.read_bytes() == b"keep"


def test_schedule_cleanup_keeps_file_until_background_tasks_run(tmp_path: Path) -> None:
    service = TemporaryFileService(tmp_path / "temp")
    paths = service.allocate("pdf", "svg")
    paths.output.write_bytes(b"<svg />")
    background_tasks = BackgroundTasks()

    service.schedule_cleanup(background_tasks, paths.output)

    assert paths.output.exists()
    anyio.run(background_tasks)
    assert not paths.output.exists()


def test_save_upload_removes_partial_file_after_read_failure(tmp_path: Path) -> None:
    service = TemporaryFileService(tmp_path / "temp", chunk_size=4)
    paths = service.allocate("pdf", "docx")

    class FailingUpload:
        def __init__(self) -> None:
            self.read_count = 0

        async def read(self, _: int) -> bytes:
            self.read_count += 1
            if self.read_count == 1:
                return b"part"
            raise OSError("simulated upload read failure")

    async def save() -> None:
        await service.save_upload(FailingUpload(), paths.input)  # type: ignore[arg-type]

    with pytest.raises(OSError, match="simulated upload read failure"):
        anyio.run(save)

    assert not paths.input.exists()


def test_service_rejects_destination_outside_base_directory(tmp_path: Path) -> None:
    service = TemporaryFileService(tmp_path / "temp")
    upload = UploadFile(file=BytesIO(b"content"), filename="document.pdf")
    outside_path = tmp_path / "outside.pdf"

    async def save() -> None:
        await service.save_upload(upload, outside_path)

    with pytest.raises(ValueError, match="inside the base directory"):
        anyio.run(save)

    assert not outside_path.exists()
