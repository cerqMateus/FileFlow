import os
import shutil
import uuid
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.converter import convert_docx_to_pdf, convert_pdf_to_docx, convert_pdf_to_svg, remove_file

app = FastAPI(title="FileFLOW MVP")

TEMP_FOLDER = "temp"

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

    success = convert_pdf_to_docx(input_path, output_path)

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

    output_path = convert_docx_to_pdf(input_path, TEMP_FOLDER)

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

    success = convert_pdf_to_svg(input_path, output_path)

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
    
    