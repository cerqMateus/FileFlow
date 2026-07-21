from pathlib import Path

import pytest
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from starlette.routing import BaseRoute, Mount, Route

from app.config import BACKEND_ROOT
from app.main import app


EXPECTED_TECHNICAL_ROUTES = {
    ("/openapi.json", frozenset({"GET", "HEAD"})),
    ("/docs", frozenset({"GET", "HEAD"})),
    ("/docs/oauth2-redirect", frozenset({"GET", "HEAD"})),
    ("/redoc", frozenset({"GET", "HEAD"})),
}
EXPECTED_CONVERSION_ROUTES = {
    ("/convert/pdf-to-docx", frozenset({"POST"})),
    ("/convert/docx-to-pdf", frozenset({"POST"})),
    ("/convert/pdf-to-svg", frozenset({"POST"})),
    ("/convert/jpg-to-png", frozenset({"POST"})),
    ("/convert/png-to-jpg", frozenset({"POST"})),
}


def route_contract(route: BaseRoute) -> tuple[str, frozenset[str]]:
    methods = route.methods if isinstance(route, (APIRoute, Route)) else set()
    return route.path, frozenset(methods or set())


def test_backend_exposes_only_technical_and_conversion_routes() -> None:
    registered_routes = {route_contract(route) for route in app.routes}

    assert registered_routes == EXPECTED_TECHNICAL_ROUTES | EXPECTED_CONVERSION_ROUTES
    assert not any(isinstance(route, Mount) for route in app.routes)


@pytest.mark.parametrize(
    "legacy_path",
    ["/", "/converter/pdf/docx", "/static/script.js"],
)
def test_legacy_product_routes_return_not_found(
    legacy_path: str,
    app_client: tuple[TestClient, Path],
) -> None:
    client, _ = app_client

    response = client.get(legacy_path)

    assert response.status_code == 404


def test_legacy_frontend_files_and_directories_do_not_exist() -> None:
    assert not (BACKEND_ROOT / "app" / "legacy_frontend.py").exists()
    assert not (BACKEND_ROOT / "templates").exists()
    assert not (BACKEND_ROOT / "static").exists()


def test_legacy_template_dependencies_are_not_direct_requirements() -> None:
    requirements = {
        line.partition("==")[0].lower()
        for line in (BACKEND_ROOT / "requirements.txt").read_text(
            encoding="utf-16"
        ).splitlines()
        if line and not line.startswith("-")
    }

    assert requirements.isdisjoint({"jinja2", "markupsafe"})
