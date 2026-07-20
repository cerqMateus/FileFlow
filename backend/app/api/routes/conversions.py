from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.config import BACKEND_ROOT
from app.converters import (
    get_docx_to_pdf_converter,
    get_image_converter,
    get_pdf_to_docx_converter,
    get_pdf_to_svg_converter,
)
from app.services import TemporaryFileService


router = APIRouter()
temporary_files = TemporaryFileService(BACKEND_ROOT / "temp")


@router.post("/convert/pdf-to-docx")
async def pdf_to_docx(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
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


@router.post("/convert/docx-to-pdf")
async def docx_to_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
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


@router.post("/convert/pdf-to-svg")
async def pdf_to_svg(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
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


@router.post("/convert/jpg-to-png")
async def jpg_to_png(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    if not (file.filename.endswith(".jpg") or file.filename.endswith(".jpeg")):
        raise HTTPException(
            status_code=400,
            detail="Apenas arquivos .jpg ou .jpeg são permitidos.",
        )

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


@router.post("/convert/png-to-jpg")
async def png_to_jpg(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
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
