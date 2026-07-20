from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import conversions
from app.legacy_frontend import register_legacy_frontend


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    conversions.temporary_files.ensure_directory()
    yield


app = FastAPI(title="FileFLOW MVP", lifespan=lifespan)
app.include_router(conversions.router)
register_legacy_frontend(app)
