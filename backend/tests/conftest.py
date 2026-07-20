from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import main as main_module
from app.api.routes import conversions as conversion_routes
from app.services import TemporaryFileService


@pytest.fixture
def app_client(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> Iterator[tuple[TestClient, Path]]:
    temporary_files = TemporaryFileService(tmp_path / "temp")
    monkeypatch.setattr(conversion_routes, "temporary_files", temporary_files)

    with TestClient(main_module.app) as client:
        yield client, temporary_files.base_directory
