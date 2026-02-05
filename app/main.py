import os
import shutil
import uuid
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.converters import get_pdf_to_docx_converter, get_docx_to_pdf_converter, get_pdf_to_svg_converter, get_image_converter
from app.converter import remove_file

app = FastAPI(title="FileFLOW MVP")

TEMP_FOLDER = "temp"

@app.on_event("startup")
async def startup_event():
    """Create temp folder if it doesn't exist"""
    os.makedirs(TEMP_FOLDER, exist_ok=True)

@app.post("/convert/pdf-to-docx")
async def pdf_to_docx(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos .pdf são permitidos.")
    
    filename_id = str(uuid.uuid4())
    input_filename = f"{filename_id}.pdf"
    output_filename = f"{filename_id}.docx"

    input_path = os.path.join(TEMP_FOLDER,input_filename)
    output_path = os.path.join(TEMP_FOLDER, output_filename)

    with open(input_path,"wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    converter = get_pdf_to_docx_converter()
    success = converter.convert(input_path, output_path)

    if not success:
            remove_file(input_path)
            raise HTTPException(status_code=500, detail="Falha ao converter o documento")
    
    background_tasks.add_task(remove_file, input_path)
    background_tasks.add_task(remove_file, output_path)

    return FileResponse(
         path = output_path,
         filename=f"FileFlow_Converted.docx",
         media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

@app.post("/convert/docx-to-pdf")
async def docx_to_pdf(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Apenas arquivos .docx são permitidos.")

    filename_id = str(uuid.uuid4())
    input_filename = f"{filename_id}.docx"

    
    input_path = os.path.join(TEMP_FOLDER, input_filename)
    

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    converter = get_docx_to_pdf_converter()
    output_path = converter.convert(input_path, TEMP_FOLDER)

    if not output_path or not os.path.exists(output_path):
        remove_file(input_path)
        raise HTTPException(status_code=500, detail="Falha ao converter o documento.")

    background_tasks.add_task(remove_file, input_path)
    background_tasks.add_task(remove_file, output_path)

    return FileResponse(
        path=output_path, 
        filename="FileFlow_Convertido.pdf",
        media_type="application/pdf"
    )

@app.post("/convert/pdf-to-svg")
async def pdf_to_svg(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos .pdf são permitidos.")
    
    filename_id = str(uuid.uuid4())
    input_filename = f"{filename_id}.pdf"
    output_filename = f"{filename_id}.svg"

    input_path = os.path.join(TEMP_FOLDER, input_filename)
    output_path = os.path.join(TEMP_FOLDER, output_filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    converter = get_pdf_to_svg_converter()
    success = converter.convert(input_path, output_path)

    if not success:
        remove_file(input_path)
        raise HTTPException(status_code=500, detail="Falha ao converter o documento")
    
    background_tasks.add_task(remove_file, input_path)
    background_tasks.add_task(remove_file, output_path)

    return FileResponse(
        path=output_path,
        filename="FileFlow_Converted.svg",
        media_type="image/svg+xml"
    )

@app.post("/convert/jpg-to-png")
async def jpg_to_png(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not (file.filename.endswith(".jpg") or file.filename.endswith(".jpeg")):
        raise HTTPException(status_code=400, detail="Apenas arquivos .jpg ou .jpeg são permitidos.")
    
    filename_id = str(uuid.uuid4())
    input_filename = f"{filename_id}.jpg"
    output_filename = f"{filename_id}.png"

    input_path = os.path.join(TEMP_FOLDER, input_filename)
    output_path = os.path.join(TEMP_FOLDER, output_filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    converter = get_image_converter()
    success = converter.jpg_to_png(input_path, output_path)

    if not success:
        remove_file(input_path)
        raise HTTPException(status_code=500, detail="Falha ao converter a imagem")
    
    background_tasks.add_task(remove_file, input_path)
    background_tasks.add_task(remove_file, output_path)

    return FileResponse(
        path=output_path,
        filename="FileFlow_Converted.png",
        media_type="image/png"
    )

@app.post("/convert/png-to-jpg")
async def png_to_jpg(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".png"):
        raise HTTPException(status_code=400, detail="Apenas arquivos .png são permitidos.")
    
    filename_id = str(uuid.uuid4())
    input_filename = f"{filename_id}.png"
    output_filename = f"{filename_id}.jpg"

    input_path = os.path.join(TEMP_FOLDER, input_filename)
    output_path = os.path.join(TEMP_FOLDER, output_filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    converter = get_image_converter()
    success = converter.png_to_jpg(input_path, output_path)

    if not success:
        remove_file(input_path)
        raise HTTPException(status_code=500, detail="Falha ao converter a imagem")
    
    background_tasks.add_task(remove_file, input_path)
    background_tasks.add_task(remove_file, output_path)

    return FileResponse(
        path=output_path,
        filename="FileFlow_Converted.jpg",
        media_type="image/jpeg"
    )

app.mount("/static",StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

CONVERTER_CONFIG = {
    ("pdf", "docx"): {
        "title": "PDF para Word",
        "icon": "📄",
        "description": "Converta arquivos PDF em documentos Word editáveis",
        "from_format": "pdf",
        "from_format_label": "PDF",
        "to_format": "docx",
        "to_format_label": "Word"
    },
    ("docx", "pdf"): {
        "title": "Word para PDF",
        "icon": "📝",
        "description": "Converta documentos Word em arquivos PDF universais",
        "from_format": "docx",
        "from_format_label": "Word",
        "to_format": "pdf",
        "to_format_label": "PDF"
    },
    ("pdf", "svg"): {
        "title": "PDF para SVG",
        "icon": "🎨",
        "description": "Converta arquivos PDF em imagens vetoriais SVG",
        "from_format": "pdf",
        "from_format_label": "PDF",
        "to_format": "svg",
        "to_format_label": "SVG"
    },
    ("jpg", "png"): {
        "title": "JPG para PNG",
        "icon": "🖼️",
        "description": "Converta imagens JPG em formato PNG com transparência",
        "from_format": "jpg",
        "from_format_label": "JPG",
        "to_format": "png",
        "to_format_label": "PNG"
    },
    ("png", "jpg"): {
        "title": "PNG para JPG",
        "icon": "🖼️",
        "description": "Converta imagens PNG em formato JPG comprimido",
        "from_format": "png",
        "from_format_label": "PNG",
        "to_format": "jpg",
        "to_format_label": "JPG"
    }
}

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

@app.get("/converter/{from_format}/{to_format}")
def converter_page(request: Request, from_format: str, to_format: str):
    config = CONVERTER_CONFIG.get((from_format, to_format))
    if not config:
        raise HTTPException(status_code=404, detail="Conversor não encontrado")
    
    return templates.TemplateResponse("converter.html", {
        "request": request,
        **config
    })
    
    