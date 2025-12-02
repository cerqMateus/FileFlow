import os
import subprocess
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
    
def convert_docx_to_pdf(docx_path: str, output_folder:str):
    try:
        cmd = [
            "libreoffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", output_folder,
            docx_path
        ]

        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)

        if result.returncode !=0:
            print(f"Erro no LibreOffice: {result.stderr.decode()}")
            return None
        
        filename = os.path.basename(docx_path)
        pdf_filename = os.path.splitext(filename)[0] + ".pdf"
        full_pdf_path = os.path.join(output_folder, pdf_filename)

        return full_pdf_path
    
    except subprocess.TimeoutExpired:
        print("A conversão excedeu o tempo limite.")
        return None
    except Exception as ex:
        print(f"Erro inesperado: {ex}")
        return None



def remove_file(path: str):
    try:
        os.remove(path)
    except OSError:
        pass        