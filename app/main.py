from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.converters import get_pdf_to_docx_converter, get_docx_to_pdf_converter, get_pdf_to_svg_converter, get_image_converter
from app.services import TemporaryFileService

temporary_files = TemporaryFileService(Path("temp"))


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    temporary_files.ensure_directory()
    yield


app = FastAPI(title="FileFLOW MVP", lifespan=lifespan)

@app.post("/convert/pdf-to-docx")
async def pdf_to_docx(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos .pdf são permitidos.")

    paths = temporary_files.allocate("pdf", "docx")

    try:
        await temporary_files.save_upload(file, paths.input)
        converter = get_pdf_to_docx_converter()
        success = converter.convert(str(paths.input), str(paths.output))

        if not success:
            raise HTTPException(status_code=500, detail="Falha ao converter o documento")
    except Exception:
        temporary_files.remove(paths.input, paths.output)
        raise

    temporary_files.schedule_cleanup(background_tasks, paths.input, paths.output)

    return FileResponse(
        path=paths.output,
        filename="FileFlow_Converted.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )

@app.post("/convert/docx-to-pdf")
async def docx_to_pdf(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Apenas arquivos .docx são permitidos.")

    paths = temporary_files.allocate("docx", "pdf")
    output_path = paths.output

    try:
        await temporary_files.save_upload(file, paths.input)
        converter = get_docx_to_pdf_converter()
        converted_path = converter.convert(
            str(paths.input),
            str(temporary_files.base_directory),
        )
        if converted_path:
            output_path = Path(converted_path).resolve()

        if (
            not converted_path
            or output_path != paths.output
            or not output_path.exists()
        ):
            raise HTTPException(status_code=500, detail="Falha ao converter o documento.")
    except Exception:
        temporary_files.remove(paths.input, paths.output, output_path)
        raise

    temporary_files.schedule_cleanup(background_tasks, paths.input, output_path)

    return FileResponse(
        path=output_path,
        filename="FileFlow_Convertido.pdf",
        media_type="application/pdf",
    )

@app.post("/convert/pdf-to-svg")
async def pdf_to_svg(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos .pdf são permitidos.")

    paths = temporary_files.allocate("pdf", "svg")

    try:
        await temporary_files.save_upload(file, paths.input)
        converter = get_pdf_to_svg_converter()
        success = converter.convert(str(paths.input), str(paths.output))

        if not success:
            raise HTTPException(status_code=500, detail="Falha ao converter o documento")
    except Exception:
        temporary_files.remove(paths.input, paths.output)
        raise

    temporary_files.schedule_cleanup(background_tasks, paths.input, paths.output)

    return FileResponse(
        path=paths.output,
        filename="FileFlow_Converted.svg",
        media_type="image/svg+xml",
    )

@app.post("/convert/jpg-to-png")
async def jpg_to_png(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not (file.filename.endswith(".jpg") or file.filename.endswith(".jpeg")):
        raise HTTPException(status_code=400, detail="Apenas arquivos .jpg ou .jpeg são permitidos.")

    paths = temporary_files.allocate("jpg", "png")

    try:
        await temporary_files.save_upload(file, paths.input)
        converter = get_image_converter()
        success = converter.jpg_to_png(str(paths.input), str(paths.output))

        if not success:
            raise HTTPException(status_code=500, detail="Falha ao converter a imagem")
    except Exception:
        temporary_files.remove(paths.input, paths.output)
        raise

    temporary_files.schedule_cleanup(background_tasks, paths.input, paths.output)

    return FileResponse(
        path=paths.output,
        filename="FileFlow_Converted.png",
        media_type="image/png",
    )

@app.post("/convert/png-to-jpg")
async def png_to_jpg(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".png"):
        raise HTTPException(status_code=400, detail="Apenas arquivos .png são permitidos.")

    paths = temporary_files.allocate("png", "jpg")

    try:
        await temporary_files.save_upload(file, paths.input)
        converter = get_image_converter()
        success = converter.png_to_jpg(str(paths.input), str(paths.output))

        if not success:
            raise HTTPException(status_code=500, detail="Falha ao converter a imagem")
    except Exception:
        temporary_files.remove(paths.input, paths.output)
        raise

    temporary_files.schedule_cleanup(background_tasks, paths.input, paths.output)

    return FileResponse(
        path=paths.output,
        filename="FileFlow_Converted.jpg",
        media_type="image/jpeg",
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
