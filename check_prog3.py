import sys, os
sys.path.insert(0, os.path.abspath('.'))
from sqlmodel import Session, text
from backend.database import get_engine

engine = get_engine()
with Session(engine) as session:
    result = session.exec(text("SELECT hinos_json FROM programacoes WHERE id = 3")).first()
    if result:
        import json
        hinos = json.loads(result[0])
        print('Prog 3 hinos:')
        for h in hinos:
            print(f'  {h}')