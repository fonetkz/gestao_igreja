import sys, os, json
sys.path.insert(0, os.path.abspath('.'))
from sqlmodel import Session, text
from backend.database import get_engine

engine = get_engine()
with Session(engine) as session:
    rows = session.exec(text("SELECT id, hinos_json FROM programacoes")).all()
    for row in rows:
        hid, hinos_json = row
        hinos = json.loads(hinos_json)
        if hinos:
            print(f"Prog {hid}: {len(hinos)} hinos")
            for h in hinos[:3]:
                print(f"  {h}")
        if hid >= 3:
            break