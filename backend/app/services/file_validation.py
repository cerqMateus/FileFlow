from pathlib import Path

from fastapi import HTTPException


MAGIC_SIGNATURES: dict[str, list[bytes]] = {
    "pdf": [b"%PDF-"],
    "docx": [b"PK\x03\x04"],
    "png": [b"\x89PNG\r\n\x1a\n"],
    "jpg": [b"\xff\xd8\xff"],
    "jpeg": [b"\xff\xd8\xff"],
}


def validate_extension(filename: str | None, allowed_extensions: set[str]) -> str:
    if not filename:
        raise HTTPException(
            status_code=400,
            detail="Nome de arquivo inválido ou ausente.",
        )

    extension = Path(filename).suffix.lower()
    if extension not in allowed_extensions:
        allowed = " ou ".join(sorted(allowed_extensions))
        raise HTTPException(
            status_code=400,
            detail=f"Apenas arquivos com extensão {allowed} são permitidos.",
        )
    return extension


def validate_magic_bytes(file_path: Path, expected_format: str) -> None:
    normalized_format = expected_format.lower().removeprefix(".")
    signatures = MAGIC_SIGNATURES.get(normalized_format)
    if not signatures:
        return

    with file_path.open("rb") as file:
        header = file.read(max(len(signature) for signature in signatures))

    if not any(header.startswith(signature) for signature in signatures):
        raise HTTPException(
            status_code=400,
            detail=(
                f"O arquivo fornecido não é um {normalized_format.upper()} válido."
            ),
        )
