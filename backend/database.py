"""
Engine e gerenciamento de sessão do SQLite.
"""
import bcrypt
from collections.abc import Generator

from sqlalchemy import Engine
from sqlalchemy import text
from sqlmodel import Session, create_engine
from backend.config import DATABASE_URL, DB_PATH

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
    from backend.models import (
        Chamada,
        Configuracao,
        HinoBase,
        Membro,
        Programacao,
        Usuario,
    )
    from sqlmodel import SQLModel

    SQLModel.metadata.create_all(get_engine())

    with Session(get_engine()) as session:
        migrate_columns = [
            ("membros", "cargo", "VARCHAR(120)", None),
            ("membros", "data_ultimo_ensaio", "VARCHAR(10)", None),
            ("membros", "iniciais", "VARCHAR(4)", ""),
            ("hinos", "soloist", "VARCHAR(120)", None),
            ("usuarios", "contexto_padrao", "VARCHAR(80)", None),
            ("programacoes", "layout_json", "TEXT", "{}"),
        ]
        for table, col, col_type, default_val in migrate_columns:
            try:
                result = session.execute(text(f"PRAGMA table_info({table})"))
                columns = [row[1] for row in result.fetchall()]
                if col not in columns:
                    session.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                    session.commit()
            except Exception as e:
                session.rollback()

        migrate_usuarios(session)

        try:
            session.execute(text("""
                UPDATE usuarios SET contexto_padrao = 'Ensaio Orquestra'
                WHERE email = 'alexandre@ia.com' AND (contexto_padrao IS NULL OR contexto_padrao = '')
            """))
            session.commit()
        except Exception:
            session.rollback()

        try:
            session.execute(text("""
                UPDATE programacoes SET layout_json = '{}'
                WHERE layout_json IS NULL
            """))
            session.commit()
        except Exception:
            session.rollback()


import json

def migrate_usuarios(session: Session) -> None:
    """Cria tabela usuarios, adiciona criado_por_id em chamadas, e popula usuários iniciais."""
    try:
        result = session.execute(text("PRAGMA table_info(usuarios)"))
        columns = [row[1] for row in result.fetchall()]
    except Exception:
        columns = []

    if not columns:
        session.execute(text("""
            CREATE TABLE usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                senha_hash TEXT NOT NULL,
                papel TEXT NOT NULL CHECK (papel IN ('admin', 'responsavel')),
                ativo INTEGER NOT NULL DEFAULT 1
            )
        """))
        session.commit()

    try:
        result = session.execute(text("PRAGMA table_info(chamadas)"))
        chamada_cols = [row[1] for row in result.fetchall()]
        if "criado_por_id" not in chamada_cols:
            session.execute(text("ALTER TABLE chamadas ADD COLUMN criado_por_id INTEGER REFERENCES usuarios(id)"))
            session.commit()
    except Exception:
        session.rollback()

    result = session.execute(text("SELECT COUNT(*) FROM usuarios"))
    if result.scalar() > 0:
        return

    result = session.execute(text("SELECT valor_json FROM configuracoes WHERE key = 'auth_settings'"))
    row = result.fetchone()

    admin_email = "admin@igreja.com"
    admin_hash = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()

    if row:
        try:
            auth_data = json.loads(row[0]) if row[0] else {}
            user = auth_data.get("user", {})
            if user.get("email"):
                admin_email = user["email"]
            if user.get("passwordHash"):
                raw = user["passwordHash"]
                if len(raw) > 20 and raw.startswith("$2"):
                    admin_hash = raw
                else:
                    admin_hash = bcrypt.hashpw(raw.encode(), bcrypt.gensalt()).decode()
        except Exception:
            pass

    altair_hash = bcrypt.hashpw("altair123".encode(), bcrypt.gensalt()).decode()
    alexandre_hash = bcrypt.hashpw("alexandre123".encode(), bcrypt.gensalt()).decode()

    session.execute(text("""
        INSERT INTO usuarios (nome, email, senha_hash, papel, ativo)
        VALUES (:nome, :email, :senha_hash, :papel, 1)
    """), {"nome": "Elen Márcia", "email": admin_email, "senha_hash": admin_hash, "papel": "admin"})
    session.execute(text("""
        INSERT INTO usuarios (nome, email, senha_hash, papel, ativo)
        VALUES (:nome, :email, :senha_hash, :papel, 1)
    """), {"nome": "Altair", "email": "altair@ia.com", "senha_hash": altair_hash, "papel": "responsavel"})
    session.execute(text("""
        INSERT INTO usuarios (nome, email, senha_hash, papel, ativo)
        VALUES (:nome, :email, :senha_hash, :papel, 1)
    """), {"nome": "Alexandre", "email": "alexandre@ia.com", "senha_hash": alexandre_hash, "papel": "responsavel"})

    session.commit()


def get_session() -> Generator[Session, None, None]:
    """Dependency do FastAPI – yield session com auto-close."""
    with Session(get_engine()) as session:
        yield session
