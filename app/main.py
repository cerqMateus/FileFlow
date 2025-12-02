from fastapi import FastAPI

app = FastAPI(title="FileFLOW MVP")

@app.get("/")
def read_root():
    return {"status": "Online", "message": "O servidor DocuSwap está rodando!"}
