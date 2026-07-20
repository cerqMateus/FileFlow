from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.config import BACKEND_ROOT


router = APIRouter()
templates = Jinja2Templates(directory=BACKEND_ROOT / "templates")

CONVERTER_CONFIG = {
    ("pdf", "docx"): {
        "title": "PDF para Word",
        "icon": "📄",
        "description": "Converta arquivos PDF em documentos Word editáveis",
        "from_format": "pdf",
        "from_format_label": "PDF",
        "to_format": "docx",
        "to_format_label": "Word",
    },
    ("docx", "pdf"): {
        "title": "Word para PDF",
        "icon": "📝",
        "description": "Converta documentos Word em arquivos PDF universais",
        "from_format": "docx",
        "from_format_label": "Word",
        "to_format": "pdf",
        "to_format_label": "PDF",
    },
    ("pdf", "svg"): {
        "title": "PDF para SVG",
        "icon": "🎨",
        "description": "Converta arquivos PDF em imagens vetoriais SVG",
        "from_format": "pdf",
        "from_format_label": "PDF",
        "to_format": "svg",
        "to_format_label": "SVG",
    },
    ("jpg", "png"): {
        "title": "JPG para PNG",
        "icon": "🖼️",
        "description": "Converta imagens JPG em formato PNG com transparência",
        "from_format": "jpg",
        "from_format_label": "JPG",
        "to_format": "png",
        "to_format_label": "PNG",
    },
    ("png", "jpg"): {
        "title": "PNG para JPG",
        "icon": "🖼️",
        "description": "Converta imagens PNG em formato JPG comprimido",
        "from_format": "png",
        "from_format_label": "PNG",
        "to_format": "jpg",
        "to_format_label": "JPG",
    },
}


@router.get("/")
def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})


@router.get("/converter/{from_format}/{to_format}")
def converter_page(request: Request, from_format: str, to_format: str):
    config = CONVERTER_CONFIG.get((from_format, to_format))
    if not config:
        raise HTTPException(status_code=404, detail="Conversor não encontrado")

    return templates.TemplateResponse(
        "converter.html",
        {
            "request": request,
            **config,
        },
    )


def register_legacy_frontend(app: FastAPI) -> None:
    # TODO(Group 12): remove the legacy Jinja2 frontend after Next.js takes over.
    app.mount("/static", StaticFiles(directory=BACKEND_ROOT / "static"), name="static")
    app.include_router(router)
