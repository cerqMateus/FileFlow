from typing import Optional
from pdf2docx import Converter as PDF2DocxLib
import pymupdf


class PDF2DocxAdapter:
    def convert(self, pdf_path: str, docx_path: str) -> bool:
        try:
            cv = PDF2DocxLib(pdf_path)
            cv.convert(docx_path, start=0, end=None)
            cv.close()
            return True
        except Exception as ex:
            print(f"Erro na conversão {ex}")
            return False


class PyMuPDFAdapter:
    def convert(self, pdf_path: str, svg_path: str) -> bool:
        try:
            doc = pymupdf.open(pdf_path)
            page = doc[0]
            svg_content = page.get_svg_image()
            
            with open(svg_path, "w", encoding="utf-8") as f:
                f.write(svg_content)
            
            doc.close()
            return True
        except Exception as ex:
            print(f"Erro na conversão: {ex}")
            return False
