import os
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path

from pydantic import AnyHttpUrl, TypeAdapter, ValidationError


BACKEND_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024

CORS_ORIGINS_ENV = "BACKEND_CORS_ORIGINS"
DEFAULT_CORS_ORIGINS = ("http://localhost:3000",)
HTTP_URL_ADAPTER = TypeAdapter(AnyHttpUrl)


@dataclass(frozen=True, slots=True)
class BackendSettings:
    cors_origins: tuple[str, ...]


def _normalize_origin(value: str) -> str:
    origin = value.strip()
    if origin == "*":
        raise ValueError("wildcard '*' não é permitido")

    try:
        parsed = HTTP_URL_ADAPTER.validate_python(origin)
    except ValidationError as error:
        raise ValueError("a origem deve ser uma URL HTTP(S) válida") from error

    if parsed.username is not None or parsed.password is not None:
        raise ValueError("credenciais não são permitidas na origem")
    if parsed.path not in {None, "", "/"} or parsed.query or parsed.fragment:
        raise ValueError("a origem não pode conter caminho, query ou fragmento")

    hostname = parsed.host
    if hostname is None:
        raise ValueError("a origem deve conter um host")

    default_port = (parsed.scheme == "http" and parsed.port == 80) or (
        parsed.scheme == "https" and parsed.port == 443
    )
    port_suffix = "" if parsed.port is None or default_port else f":{parsed.port}"
    return f"{parsed.scheme}://{hostname}{port_suffix}"


def load_settings(
    environment: Mapping[str, str] | None = None,
) -> BackendSettings:
    source = os.environ if environment is None else environment
    configured_value = source.get(CORS_ORIGINS_ENV)
    raw_origins = (
        DEFAULT_CORS_ORIGINS
        if configured_value is None
        else tuple(configured_value.split(","))
    )

    normalized_origins: list[str] = []
    try:
        for raw_origin in raw_origins:
            if not raw_origin.strip():
                continue
            origin = _normalize_origin(raw_origin)
            if origin not in normalized_origins:
                normalized_origins.append(origin)
    except ValueError as error:
        raise ValueError(f"{CORS_ORIGINS_ENV} inválida: {error}") from error

    if not normalized_origins:
        raise ValueError(
            f"{CORS_ORIGINS_ENV} deve conter ao menos uma origem HTTP(S)."
        )

    return BackendSettings(cors_origins=tuple(normalized_origins))
