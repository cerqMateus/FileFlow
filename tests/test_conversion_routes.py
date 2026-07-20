from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import main as main_module
from tests.fakes import (
    FakeDocxToPDFConverter,
    FakeImageConverter,
    FakePDFToDocxConverter,
    FakePDFToSVGConverter,
)


SOURCE_CONTENT = b"source-file-content"
DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


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


def test_pdf_to_docx_uses_fake_adapter_and_cleans_files(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakePDFToDocxConverter()
    monkeypatch.setattr(main_module, "get_pdf_to_docx_converter", lambda: fake)

    response = client.post(
        "/convert/pdf-to-docx",
        files={"file": ("document.pdf", SOURCE_CONTENT, "application/pdf")},
    )

    assert_download(response, DOCX_MEDIA_TYPE, "FileFlow_Converted.docx", fake.payload)
    assert fake.received_content == [SOURCE_CONTENT]
    assert len(fake.calls) == 1
    assert_paths_removed(*fake.calls[0])
    assert list(temporary_folder.iterdir()) == []


def test_docx_to_pdf_uses_fake_adapter_and_cleans_files(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakeDocxToPDFConverter()
    monkeypatch.setattr(main_module, "get_docx_to_pdf_converter", lambda: fake)

    response = client.post(
        "/convert/docx-to-pdf",
        files={"file": ("document.docx", SOURCE_CONTENT, DOCX_MEDIA_TYPE)},
    )

    assert_download(response, "application/pdf", "FileFlow_Convertido.pdf", fake.payload)
    assert fake.received_content == [SOURCE_CONTENT]
    assert len(fake.calls) == 1
    assert_paths_removed(fake.calls[0][0], fake.output_paths[0])
    assert list(temporary_folder.iterdir()) == []


def test_pdf_to_svg_uses_fake_adapter_and_cleans_files(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakePDFToSVGConverter()
    monkeypatch.setattr(main_module, "get_pdf_to_svg_converter", lambda: fake)

    response = client.post(
        "/convert/pdf-to-svg",
        files={"file": ("document.pdf", SOURCE_CONTENT, "application/pdf")},
    )

    assert_download(response, "image/svg+xml", "FileFlow_Converted.svg", fake.payload)
    assert fake.received_content == [SOURCE_CONTENT]
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
    monkeypatch.setattr(main_module, "get_image_converter", lambda: fake)

    response = client.post(
        "/convert/jpg-to-png",
        files={"file": (f"image.{extension}", SOURCE_CONTENT, "image/jpeg")},
    )

    assert_download(response, "image/png", "FileFlow_Converted.png", fake.png_payload)
    assert fake.received_content == [SOURCE_CONTENT]
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
    monkeypatch.setattr(main_module, "get_image_converter", lambda: fake)

    response = client.post(
        "/convert/png-to-jpg",
        files={"file": ("image.png", SOURCE_CONTENT, "image/png")},
    )

    assert_download(response, "image/jpeg", "FileFlow_Converted.jpg", fake.jpg_payload)
    assert fake.received_content == [SOURCE_CONTENT]
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
            "Apenas arquivos .pdf são permitidos.",
        ),
        (
            "/convert/docx-to-pdf",
            "document.pdf",
            "get_docx_to_pdf_converter",
            "Apenas arquivos .docx são permitidos.",
        ),
        (
            "/convert/pdf-to-svg",
            "document.svg",
            "get_pdf_to_svg_converter",
            "Apenas arquivos .pdf são permitidos.",
        ),
        (
            "/convert/jpg-to-png",
            "image.png",
            "get_image_converter",
            "Apenas arquivos .jpg ou .jpeg são permitidos.",
        ),
        (
            "/convert/png-to-jpg",
            "image.jpg",
            "get_image_converter",
            "Apenas arquivos .png são permitidos.",
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

    monkeypatch.setattr(main_module, factory_name, forbidden_factory)

    response = client.post(
        endpoint,
        files={"file": (filename, SOURCE_CONTENT, "application/octet-stream")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": detail}
    assert list(temporary_folder.iterdir()) == []


def test_boolean_adapter_failure_returns_500_and_cleans_input(
    app_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client, temporary_folder = app_client
    fake = FakePDFToDocxConverter(success=False)
    monkeypatch.setattr(main_module, "get_pdf_to_docx_converter", lambda: fake)

    response = client.post(
        "/convert/pdf-to-docx",
        files={"file": ("document.pdf", SOURCE_CONTENT, "application/pdf")},
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
    fake = FakeDocxToPDFConverter(success=False)
    monkeypatch.setattr(main_module, "get_docx_to_pdf_converter", lambda: fake)

    response = client.post(
        "/convert/docx-to-pdf",
        files={"file": ("document.docx", SOURCE_CONTENT, DOCX_MEDIA_TYPE)},
    )

    assert response.status_code == 500
    assert response.json() == {"detail": "Falha ao converter o documento."}
    assert len(fake.calls) == 1
    assert_paths_removed(fake.calls[0][0], fake.output_paths[0])
    assert list(temporary_folder.iterdir()) == []
