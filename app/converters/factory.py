from app.converters.base import PDFToDocxConverter, DocxToPDFConverter, PDFToSVGConverter, ImageConverter
from app.converters.adapters.pdf_adapter import PDF2DocxAdapter, PyMuPDFAdapter
from app.converters.adapters.docx_adapter import LibreOfficeAdapter
from app.converters.adapters.image_adapter import PillowImageAdapter


def get_pdf_to_docx_converter() -> PDFToDocxConverter:
    return PDF2DocxAdapter()


def get_docx_to_pdf_converter() -> DocxToPDFConverter:
    return LibreOfficeAdapter()


def get_pdf_to_svg_converter() -> PDFToSVGConverter:
    return PyMuPDFAdapter()


def get_image_converter() -> ImageConverter:
    return PillowImageAdapter()
