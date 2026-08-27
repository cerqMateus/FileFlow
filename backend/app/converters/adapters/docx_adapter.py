import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


def _resolve_libreoffice_binary() -> str:
    """Return the first available LibreOffice executable on this host."""
    environment_binary = os.environ.get("LIBREOFFICE_PATH")
    if environment_binary and Path(environment_binary).exists():
        return environment_binary

    binary = shutil.which("libreoffice") or shutil.which("soffice")
    if binary:
        return binary

    if os.name == "nt":
        default_windows_binary = Path(r"C:\Program Files\LibreOffice\program\soffice.exe")
        if default_windows_binary.exists():
            return str(default_windows_binary)

    # Keep the command useful on hosts where LibreOffice is installed later.
    return "libreoffice"


class LibreOfficeAdapter:
    def __init__(self, timeout_seconds: int = 60) -> None:
        self.timeout_seconds = timeout_seconds
        self.binary_path = _resolve_libreoffice_binary()

    def convert(self, docx_path: str, output_folder: str) -> Optional[str]:
        source_path = Path(docx_path).resolve()
        output_path = Path(output_folder).resolve()

        if not source_path.exists():
            logger.error("Arquivo de origem não encontrado: %s", source_path)
            return None

        # LibreOffice locks its user profile. A unique temporary profile makes
        # independent conversion processes safe to run concurrently.
        with tempfile.TemporaryDirectory(prefix="fileflow_lo_profile_") as profile_directory:
            profile_uri = Path(profile_directory).resolve().as_uri()
            cmd = [
                self.binary_path,
                "--headless",
                f"-env:UserInstallation={profile_uri}",
                "--convert-to", "pdf",
                "--outdir", str(output_path),
                str(source_path),
            ]

            try:
                result = subprocess.run(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=self.timeout_seconds,
                    check=False,
                )

                if result.returncode != 0:
                    logger.error(
                        "Falha na conversão LibreOffice (code %d): %s",
                        result.returncode,
                        result.stderr.decode(errors="replace"),
                    )
                    return None

                expected_pdf_path = output_path / f"{source_path.stem}.pdf"
                if not expected_pdf_path.exists():
                    logger.error("Arquivo PDF esperado não foi gerado em: %s", expected_pdf_path)
                    return None

                return str(expected_pdf_path)
            except subprocess.TimeoutExpired:
                logger.error(
                    "Conversão excedeu o limite de tempo (%ds): %s",
                    self.timeout_seconds,
                    source_path,
                )
                return None
            except Exception:
                logger.exception("Erro inesperado ao executar LibreOffice")
                return None
