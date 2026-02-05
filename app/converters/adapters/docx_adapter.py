import os
import subprocess
from typing import Optional


class LibreOfficeAdapter:
    def convert(self, docx_path: str, output_folder: str) -> Optional[str]:
        try:
            cmd = [
                "libreoffice",
                "--headless",
                "--convert-to", "pdf",
                "--outdir", output_folder,
                docx_path
            ]

            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)

            if result.returncode != 0:
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
