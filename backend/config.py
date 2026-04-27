"""
Resolução de caminhos para dev e produção (PyInstaller).
"""
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


def _is_frozen() -> bool:
    return getattr(sys, "frozen", False)


def get_base_dir() -> Path:
    """Diretório base dos assets empacotados (dist/)."""
    if _is_frozen():
        # PyInstaller --onefile extrai em sys._MEIPASS
        # PyInstaller --onedir usa o dir do executável
        return Path(getattr(sys, "_MEIPASS", Path(sys.executable).parent))
    # Dev: raiz do monorepo (um nível acima de backend/)
    return Path(__file__).resolve().parent.parent


def get_dist_dir() -> Path:
    """Caminho para os estáticos do React (build)."""
    return get_base_dir() / "dist"


def get_db_path() -> Path:
    """
    Caminho do SQLite. Em produção, fica ao lado do .exe
    para persistir entre execuções. Em dev, fica na raiz do projeto.
    """
    if _is_frozen():
        return Path(sys.executable).parent / "orquestra.db"
    return get_base_dir() / "orquestra.db"


# Constantes exportáveis
DIST_DIR: Path = get_dist_dir()
DB_PATH: Path = get_db_path()
DATABASE_URL: str = f"sqlite:///{DB_PATH}"
API_HOST: str = "127.0.0.1"
API_PORT: int = 39100
