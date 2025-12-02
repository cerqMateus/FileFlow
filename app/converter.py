import os
from pdf2docx import Converter

def convert_pdf_to_docx(pdf_path:str,docx_path:str):
    try:
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0,end=None)
        cv.close()
        return True
    except Exception as ex:
        print(f"Erro na conversão {ex}")
        return False

def remove_file(path: str):
    try:
        os.remove(path)
    except OSError:
        pass        