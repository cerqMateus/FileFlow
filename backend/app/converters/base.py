from typing import Protocol, Optional


class PDFToDocxConverter(Protocol):
    def convert(self, pdf_path: str, docx_path: str) -> bool:
        ...


class DocxToPDFConverter(Protocol):
    def convert(self, docx_path: str, output_folder: str) -> Optional[str]:
        ...


class PDFToSVGConverter(Protocol):
    def convert(self, pdf_path: str, svg_path: str) -> bool:
        ...


class ImageConverter(Protocol):
    def jpg_to_png(self, jpg_path: str, png_path: str) -> bool:
        ...
    
    def png_to_jpg(self, png_path: str, jpg_path: str) -> bool:
        ...
