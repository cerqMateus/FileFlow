from pathlib import Path

import pytest
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient

from app.api.routes import conversions as conversion_routes
from app.main import app
from tests.fakes import (
    FakeDocxToPDFConverter,
    FakeImageConverter,
    FakePDFToDocxConverter,
    FakePDFToSVGConverter,
)


PDF_SOURCE_CONTENT = b"%PDF-source-file-content"
DOCX_SOURCE_CONTENT = b"PK\x03\x04source-file-content"
JPG_SOURCE_CONTENT = b"\xff\xd8\xffsource-image-content"
PNG_SOURCE_CONTENT = b"\x89PNG\r\n\x1a\nsource-image-content"
DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
EXPECTED_CONVERSION_ROUTES = {
    ("/convert/pdf-to-docx", "POST"),
    ("/convert/docx-to-pdf", "POST"),
    ("/convert/pdf-to-svg", "POST"),
    ("/convert/jpg-to-png", "POST"),
    ("/convert/png-to-jpg", "POST"),
}


def assert_download(
    response,
    media_type: str,
    filename: str,
    content: bytes,
) -> None:
    assert response.status_code == 200
    assert response.headers["content-type"] == media_type
    assert response.headers["content-disposition"] == f'attachment; filename="{filename}"'
    assert response.content == content


def assert_paths_removed(*paths: Path) -> None:
    assert all(not path.exists() for path in paths)


def test_registered_conversion_routes_match_public_contract() -> None:
    registered_routes = {
        (route.path, method)
        for route in app.routes
        if isinstance(route, APIRoute) and route.path.startswith("/convert/")
        for method in route.methods
    }

    assert registered_routes == EXPECTED_CONVERSION_ROUTES


def test_pdf_to_docx_uses_fake_adapter_and_cleans_files(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakePDFToDocxConverter()
    monkeypatch.setattr(conversion_routes, "get_pdf_to_docx_converter", lambda: fake)

    response = client.post(
        "/convert/pdf-to-docx",
        files={"file": ("document.PDF", PDF_SOURCE_CONTENT, "application/pdf")},
    )

    assert_download(response, DOCX_MEDIA_TYPE, "FileFlow_Converted.docx", fake.payload)
    assert fake.received_content == [PDF_SOURCE_CONTENT]
    assert len(fake.calls) == 1
    assert_paths_removed(*fake.calls[0])
    assert list(temporary_folder.iterdir()) == []


def test_docx_to_pdf_uses_fake_adapter_and_cleans_files(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakeDocxToPDFConverter()
    monkeypatch.setattr(conversion_routes, "get_docx_to_pdf_converter", lambda: fake)

    response = client.post(
        "/convert/docx-to-pdf",
        files={"file": ("document.DOCX", DOCX_SOURCE_CONTENT, DOCX_MEDIA_TYPE)},
    )

    assert_download(response, "application/pdf", "FileFlow_Convertido.pdf", fake.payload)
    assert fake.received_content == [DOCX_SOURCE_CONTENT]
    assert len(fake.calls) == 1
    assert_paths_removed(fake.calls[0][0], fake.output_paths[0])
    assert list(temporary_folder.iterdir()) == []


def test_pdf_to_svg_uses_fake_adapter_and_cleans_files(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakePDFToSVGConverter()
    monkeypatch.setattr(conversion_routes, "get_pdf_to_svg_converter", lambda: fake)

    response = client.post(
        "/convert/pdf-to-svg",
        files={"file": ("document.PDF", PDF_SOURCE_CONTENT, "application/pdf")},
    )

    assert_download(response, "image/svg+xml", "FileFlow_Converted.svg", fake.payload)
    assert fake.received_content == [PDF_SOURCE_CONTENT]
    assert len(fake.calls) == 1
    assert_paths_removed(*fake.calls[0])
    assert list(temporary_folder.iterdir()) == []


@pytest.mark.parametrize("extension", ["jpg", "jpeg"])
def test_jpg_to_png_uses_fake_adapter_and_cleans_files(
    extension: str,
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakeImageConverter()
    monkeypatch.setattr(conversion_routes, "get_image_converter", lambda: fake)

    response = client.post(
        "/convert/jpg-to-png",
        files={"file": (f"image.{extension.upper()}", JPG_SOURCE_CONTENT, "image/jpeg")},
    )

    assert_download(response, "image/png", "FileFlow_Converted.png", fake.png_payload)
    assert fake.received_content == [JPG_SOURCE_CONTENT]
    assert len(fake.jpg_to_png_calls) == 1
    assert fake.png_to_jpg_calls == []
    assert_paths_removed(*fake.jpg_to_png_calls[0])
    assert list(temporary_folder.iterdir()) == []


def test_png_to_jpg_uses_fake_adapter_and_cleans_files(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakeImageConverter()
    monkeypatch.setattr(conversion_routes, "get_image_converter", lambda: fake)

    response = client.post(
        "/convert/png-to-jpg",
        files={"file": ("image.PNG", PNG_SOURCE_CONTENT, "image/png")},
    )

    assert_download(response, "image/jpeg", "FileFlow_Converted.jpg", fake.jpg_payload)
    assert fake.received_content == [PNG_SOURCE_CONTENT]
    assert len(fake.png_to_jpg_calls) == 1
    assert fake.jpg_to_png_calls == []
    assert_paths_removed(*fake.png_to_jpg_calls[0])
    assert list(temporary_folder.iterdir()) == []


@pytest.mark.parametrize(
    ("endpoint", "filename", "factory_name", "detail"),
    [
        (
            "/convert/pdf-to-docx",
            "document.txt",
            "get_pdf_to_docx_converter",
            "Apenas arquivos com extensão .pdf são permitidos.",
        ),
        (
            "/convert/docx-to-pdf",
            "document.pdf",
            "get_docx_to_pdf_converter",
            "Apenas arquivos com extensão .docx são permitidos.",
        ),
        (
            "/convert/pdf-to-svg",
            "document.svg",
            "get_pdf_to_svg_converter",
            "Apenas arquivos com extensão .pdf são permitidos.",
        ),
        (
            "/convert/jpg-to-png",
            "image.png",
            "get_image_converter",
            "Apenas arquivos com extensão .jpeg ou .jpg são permitidos.",
        ),
        (
            "/convert/png-to-jpg",
            "image.jpg",
            "get_image_converter",
            "Apenas arquivos com extensão .png são permitidos.",
        ),
    ],
)
def test_invalid_extensions_are_rejected_before_adapter_creation(
    endpoint: str,
    filename: str,
    factory_name: str,
    detail: str,
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client

    def forbidden_factory():
        raise AssertionError("adapter factory must not be called")

    monkeypatch.setattr(conversion_routes, factory_name, forbidden_factory)

    response = client.post(
        endpoint,
        files={"file": (filename, b"invalid", "application/octet-stream")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": detail}
    assert list(temporary_folder.iterdir()) == []


@pytest.mark.parametrize("filename", [None, ""])
def test_missing_filename_is_rejected_with_a_friendly_message(filename: str | None) -> None:
    with pytest.raises(conversion_routes.HTTPException) as error:
        conversion_routes.validate_extension(filename, {".pdf"})

    assert error.value.status_code == 400
    assert error.value.detail == "Nome de arquivo inválido ou ausente."


@pytest.mark.parametrize(
    ("endpoint", "filename", "expected_format", "factory_name"),
    [
        ("/convert/pdf-to-docx", "document.pdf", "PDF", "get_pdf_to_docx_converter"),
        ("/convert/docx-to-pdf", "document.docx", "DOCX", "get_docx_to_pdf_converter"),
        ("/convert/pdf-to-svg", "document.pdf", "PDF", "get_pdf_to_svg_converter"),
        ("/convert/jpg-to-png", "image.jpg", "JPG", "get_image_converter"),
        ("/convert/png-to-jpg", "image.png", "PNG", "get_image_converter"),
    ],
)
def test_invalid_magic_bytes_are_rejected_before_adapter_creation(
    endpoint: str,
    filename: str,
    expected_format: str,
    factory_name: str,
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client

    def forbidden_factory():
        raise AssertionError("adapter factory must not be called")

    monkeypatch.setattr(conversion_routes, factory_name, forbidden_factory)

    response = client.post(
        endpoint,
        files={"file": (filename, b"not-a-valid-file", "application/octet-stream")},
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": f"O arquivo fornecido não é um {expected_format} válido."
    }
    assert list(temporary_folder.iterdir()) == []


def test_boolean_adapter_failure_returns_500_and_cleans_input(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakePDFToDocxConverter(success=False, write_partial_on_failure=True)
    monkeypatch.setattr(conversion_routes, "get_pdf_to_docx_converter", lambda: fake)

    response = client.post(
        "/convert/pdf-to-docx",
        files={"file": ("document.pdf", PDF_SOURCE_CONTENT, "application/pdf")},
    )

    assert response.status_code == 500
    assert response.json() == {"detail": "Falha ao converter o documento"}
    assert len(fake.calls) == 1
    assert_paths_removed(*fake.calls[0])
    assert list(temporary_folder.iterdir()) == []


def test_path_adapter_failure_returns_500_and_cleans_input(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakeDocxToPDFConverter(success=False, write_partial_on_failure=True)
    monkeypatch.setattr(conversion_routes, "get_docx_to_pdf_converter", lambda: fake)

    response = client.post(
        "/convert/docx-to-pdf",
        files={"file": ("document.docx", DOCX_SOURCE_CONTENT, DOCX_MEDIA_TYPE)},
    )

    assert response.status_code == 500
    assert response.json() == {"detail": "Falha ao converter o documento."}
    assert len(fake.calls) == 1
    assert_paths_removed(fake.calls[0][0], fake.output_paths[0])
    assert list(temporary_folder.iterdir()) == []
