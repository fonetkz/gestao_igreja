import sys, os, json
sys.path.insert(0, os.path.abspath('.'))
from sqlmodel import Session, text
from backend.database import get_engine

engine = get_engine()
with Session(engine) as session:
    tables = session.exec(text("SELECT name FROM sqlite_master WHERE type='table'")).all()
    print("Tabelas no banco:")
    for t in tables:
        print(f"  {t}")