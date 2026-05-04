import sys, os, json
sys.path.insert(0, os.path.abspath('.'))
from sqlmodel import Session, text
from backend.database import get_engine

engine = get_engine()
with Session(engine) as session:
    result = session.exec(text("PRAGMA table_info(configuracoes)")).all()
    print("Schema da tabela configuracoes:")
    for r in result:
        print(f"  {r}")