from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class FakePDFToDocxConverter:
    success: bool = True
    write_partial_on_failure: bool = False
    payload: bytes = b"fake-docx"
    calls: list[tuple[Path, Path]] = field(default_factory=list)
    received_content: list[bytes] = field(default_factory=list)

    def convert(self, pdf_path: str, docx_path: str) -> bool:
        input_path = Path(pdf_path)
        output_path = Path(docx_path)
        self.calls.append((input_path, output_path))
        self.received_content.append(input_path.read_bytes())

        if not self.success:
            if self.write_partial_on_failure:
                output_path.write_bytes(b"partial-docx")
            return False

        output_path.write_bytes(self.payload)
        return True


@dataclass
class FakeDocxToPDFConverter:
    success: bool = True
    write_partial_on_failure: bool = False
    payload: bytes = b"fake-pdf"
    calls: list[tuple[Path, Path]] = field(default_factory=list)
    output_paths: list[Path] = field(default_factory=list)
    received_content: list[bytes] = field(default_factory=list)

    def convert(self, docx_path: str, output_folder: str) -> Optional[str]:
        input_path = Path(docx_path)
        output_directory = Path(output_folder)
        output_path = output_directory / f"{input_path.stem}.pdf"
        self.calls.append((input_path, output_directory))
        self.output_paths.append(output_path)
        self.received_content.append(input_path.read_bytes())

        if not self.success:
            if self.write_partial_on_failure:
                output_path.write_bytes(b"partial-pdf")
            return None

        output_path.write_bytes(self.payload)
        return str(output_path)


@dataclass
class FakePDFToSVGConverter:
    success: bool = True
    payload: bytes = b"<svg>fake</svg>"
    calls: list[tuple[Path, Path]] = field(default_factory=list)
    received_content: list[bytes] = field(default_factory=list)

    def convert(self, pdf_path: str, svg_path: str) -> bool:
        input_path = Path(pdf_path)
        output_path = Path(svg_path)
        self.calls.append((input_path, output_path))
        self.received_content.append(input_path.read_bytes())

        if not self.success:
            return False

        output_path.write_bytes(self.payload)
        return True


@dataclass
class FakeImageConverter:
    success: bool = True
    png_payload: bytes = b"fake-png"
    jpg_payload: bytes = b"fake-jpg"
    jpg_to_png_calls: list[tuple[Path, Path]] = field(default_factory=list)
    png_to_jpg_calls: list[tuple[Path, Path]] = field(default_factory=list)
    received_content: list[bytes] = field(default_factory=list)

    def jpg_to_png(self, jpg_path: str, png_path: str) -> bool:
        input_path = Path(jpg_path)
        output_path = Path(png_path)
        self.jpg_to_png_calls.append((input_path, output_path))
        self.received_content.append(input_path.read_bytes())

        if not self.success:
            return False

        output_path.write_bytes(self.png_payload)
        return True

    def png_to_jpg(self, png_path: str, jpg_path: str) -> bool:
        input_path = Path(png_path)
        output_path = Path(jpg_path)
        self.png_to_jpg_calls.append((input_path, output_path))
        self.received_content.append(input_path.read_bytes())

        if not self.success:
            return False

        output_path.write_bytes(self.jpg_payload)
        return True
