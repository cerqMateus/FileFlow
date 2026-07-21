from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.api.routes import conversions as conversion_routes
from app.config import (
    CORS_ORIGINS_ENV,
    BackendSettings,
    load_settings,
)
from app.main import create_app
from app.services import TemporaryFileService
from tests.fakes import FakePDFToDocxConverter


LOCAL_ORIGIN = "http://localhost:3000"
SECOND_ORIGIN = "https://app.fileflow.test"


@contextmanager
def create_cors_client(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    *origins: str,
) -> Iterator[TestClient]:
    temporary_files = TemporaryFileService(tmp_path / "temp")
    monkeypatch.setattr(conversion_routes, "temporary_files", temporary_files)

    application = create_app(BackendSettings(cors_origins=origins))
    with TestClient(application) as client:
        yield client


def test_settings_use_safe_local_default() -> None:
    settings = load_settings({})

    assert settings.cors_origins == (LOCAL_ORIGIN,)


def test_settings_normalize_spaces_empty_entries_duplicates_and_ports() -> None:
    settings = load_settings(
        {
            CORS_ORIGINS_ENV: (
                " http://localhost:3000/ , , HTTPS://APP.FILEFLOW.TEST:443,"
                "http://localhost:3000 "
            )
        }
    )

    assert settings.cors_origins == (LOCAL_ORIGIN, SECOND_ORIGIN)


@pytest.mark.parametrize(
    "configured_value",
    [
        "*",
        "ftp://app.fileflow.test",
        "https://app.fileflow.test/path",
        "https://app.fileflow.test?query=value",
        "https://user:secret@app.fileflow.test",
        "https://app.fileflow.test:invalid",
        "https://bad host.fileflow.test",
        " , ",
    ],
)
def test_invalid_settings_fail_with_clear_environment_name(
    configured_value: str,
) -> None:
    with pytest.raises(ValueError, match=CORS_ORIGINS_ENV):
        load_settings({CORS_ORIGINS_ENV: configured_value})


def test_invalid_environment_prevents_application_startup(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv(CORS_ORIGINS_ENV, "*")

    with pytest.raises(ValueError, match="wildcard"):
        create_app()


def test_allowed_preflight_is_restricted_to_post_and_required_headers(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    with create_cors_client(
        tmp_path,
        monkeypatch,
        LOCAL_ORIGIN,
    ) as client:
        response = client.options(
            "/convert/pdf-to-docx",
            headers={
                "Origin": LOCAL_ORIGIN,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )

        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == LOCAL_ORIGIN
        assert response.headers["access-control-allow-methods"] == "POST"
        assert "Content-Type" in response.headers["access-control-allow-headers"]
        assert "access-control-allow-credentials" not in response.headers


@pytest.mark.parametrize("origin", [LOCAL_ORIGIN, SECOND_ORIGIN])
def test_each_configured_origin_receives_cors_headers_on_post(
    origin: str,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fake = FakePDFToDocxConverter()
    monkeypatch.setattr(
        conversion_routes,
        "get_pdf_to_docx_converter",
        lambda: fake,
    )
    with create_cors_client(
        tmp_path,
        monkeypatch,
        LOCAL_ORIGIN,
        SECOND_ORIGIN,
    ) as client:
        response = client.post(
            "/convert/pdf-to-docx",
            headers={"Origin": origin},
            files={"file": ("document.pdf", b"source", "application/pdf")},
        )

        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == origin
        assert fake.received_content == [b"source"]


def test_unconfigured_origin_is_rejected_by_preflight(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    with create_cors_client(
        tmp_path,
        monkeypatch,
        LOCAL_ORIGIN,
    ) as client:
        response = client.options(
            "/convert/pdf-to-docx",
            headers={
                "Origin": "https://untrusted.fileflow.test",
                "Access-Control-Request-Method": "POST",
            },
        )

        assert response.status_code == 400
        assert "access-control-allow-origin" not in response.headers


@pytest.mark.parametrize(
    ("requested_method", "requested_headers"),
    [("GET", None), ("POST", "Authorization")],
)
def test_preflight_rejects_unneeded_methods_and_headers(
    requested_method: str,
    requested_headers: str | None,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    headers = {
        "Origin": LOCAL_ORIGIN,
        "Access-Control-Request-Method": requested_method,
    }
    if requested_headers is not None:
        headers["Access-Control-Request-Headers"] = requested_headers

    with create_cors_client(
        tmp_path,
        monkeypatch,
        LOCAL_ORIGIN,
    ) as client:
        response = client.options(
            "/convert/pdf-to-docx",
            headers=headers,
        )

        assert response.status_code == 400
