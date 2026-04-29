"""
Engine e gerenciamento de sessão do SQLite.
"""
import os
import sys
from collections.abc import Generator

from sqlalchemy import Engine
from sqlalchemy import text
from sqlmodel import Session, create_engine

# Adiciona o diretório pai ao path para imports
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, base_dir)
sys.path.insert(0, os.path.dirname(base_dir))

from config import DATABASE_URL, DB_PATH

_engine: Engine | None = None


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        _engine = create_engine(
            DATABASE_URL,
            echo=False,
            connect_args={"check_same_thread": False},
        )
    return _engine


def init_db() -> None:
    """Cria todas as tabelas caso não existam."""
    # Importa modelos para forçar o registro no metadata do SQLModel
    from models import (  # noqa: F401
        Chamada,
        Configuracao,
        HinoBase,
        Membro,
        Programacao,
    )
    from sqlmodel import SQLModel

    SQLModel.metadata.create_all(get_engine())

    # Auto-migrate: adiciona colunas que podem estar faltando
    with Session(get_engine()) as session:
        migrate_columns = [
            ("membros", "cargo", "VARCHAR(120)", None),
            ("membros", "data_ultimo_ensaio", "VARCHAR(10)", None),
            ("membros", "iniciais", "VARCHAR(4)", ""),
            ("hinos", "soloist", "VARCHAR(120)", None),
        ]
        for table, col, col_type, default_val in migrate_columns:
            try:
                # Verifica se a coluna existe
                result = session.execute(text(f"PRAGMA table_info({table})"))
                columns = [row[1] for row in result.fetchall()]
                if col not in columns:
                    session.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                    session.commit()
            except Exception as e:
                session.rollback()
                # Coluna pode já existir, ignora erro

def get_session() -> Generator[Session, None, None]:
    """Dependency do FastAPI – yield session com auto-close."""
    with Session(get_engine()) as session:
        yield session
