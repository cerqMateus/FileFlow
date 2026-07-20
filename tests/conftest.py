from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import main as main_module


@pytest.fixture
def app_client(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> Iterator[tuple[TestClient, Path]]:
    temporary_folder = tmp_path / "temp"
    monkeypatch.setattr(main_module, "TEMP_FOLDER", str(temporary_folder))

    with TestClient(main_module.app) as client:
        yield client, temporary_folder
