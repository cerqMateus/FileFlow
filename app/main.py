import os
import shutil
import uuid
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.converter import convert_pdf_to_docx, remove_file

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

@app.get("/")
def read_root():
    return {"status": "Online", "project": "FileFlow"}
    
    