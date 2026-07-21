from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import conversions
from app.config import BackendSettings, load_settings
from app.legacy_frontend import register_legacy_frontend


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    conversions.temporary_files.ensure_directory()
    yield


def create_app(settings: BackendSettings | None = None) -> FastAPI:
    resolved_settings = load_settings() if settings is None else settings
    application = FastAPI(title="FileFLOW MVP", lifespan=lifespan)
    application.include_router(conversions.router)
    register_legacy_frontend(application)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(resolved_settings.cors_origins),
        allow_credentials=False,
        allow_methods=["POST"],
        allow_headers=["Content-Type"],
    )
    return application


app = create_app()
