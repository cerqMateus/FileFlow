import os
import subprocess
import pymupdf
from pdf2docx import Converter
from PIL import Image

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

def convert_pdf_to_svg(pdf_path: str, svg_path: str):
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

def convert_jpg_to_png(jpg_path: str, png_path: str):
    try:
        with Image.open(jpg_path) as img:
            if img.mode == "RGBA":
                img.save(png_path, "PNG")
            else:
                img.convert("RGB").save(png_path, "PNG")
        return True
    except Exception as ex:
        print(f"Erro na conversão: {ex}")
        return False

def convert_png_to_jpg(png_path: str, jpg_path: str):
    try:
        with Image.open(png_path) as img:
            if img.mode in ("RGBA", "LA", "P"):
                rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                rgb_img.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
                rgb_img.save(jpg_path, "JPEG", quality=95)
            else:
                img.convert("RGB").save(jpg_path, "JPEG", quality=95)
        return True
    except Exception as ex:
        print(f"Erro na conversão: {ex}")
        return False        