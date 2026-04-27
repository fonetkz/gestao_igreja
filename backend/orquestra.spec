# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec – Sacred Gallery
Gera um executável --onedir com o frontend React e o backend Python.

Uso (a partir da raiz do monorepo):
    cd e:\PROJETOS\saas_gestao_igreja
    pyinstaller backend/orquestra.spec
"""
import os
from pathlib import Path

block_cipher = None

# SPECPATH aponta para o diretório do .spec (backend/)
ROOT = Path(os.path.abspath(SPECPATH)).parent  # raiz do monorepo
DIST_REACT = ROOT / "dist"
BACKEND_DIR = ROOT / "backend"

if not DIST_REACT.is_dir():
    raise FileNotFoundError(
        f"Pasta dist/ não encontrada em {DIST_REACT}. "
        "Execute 'npm run build' antes de empacotar."
    )

a = Analysis(
    [str(BACKEND_DIR / "app.py")],
    pathex=[str(ROOT)],
    binaries=[],
    datas=[
        # Inclui todo o build React como 'dist/' dentro do bundle
        (str(DIST_REACT), "dist"),
    ],
    hiddenimports=[
        # FastAPI / Starlette internals que o PyInstaller não detecta
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        "uvicorn.lifespan.off",
        # SQLAlchemy dialects
        "sqlalchemy.dialects.sqlite",
        # Multipart (FastAPI body parsing)
        "multipart",
        # Backend modules
        "backend",
        "backend.config",
        "backend.database",
        "backend.models",
        "backend.main",
        "backend.app",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        "tkinter",
        "unittest",
        "test",
        "xmlrpc",
        "pydoc",
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="SacredGallery",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # Sem janela de console
    icon=None,      # Adicionar .ico aqui se desejar
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="SacredGallery",
)
