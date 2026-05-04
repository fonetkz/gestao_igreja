import sys, os, json
sys.path.insert(0, os.path.abspath('.'))
from sqlmodel import Session, text
from backend.database import get_engine

engine = get_engine()
with Session(engine) as session:
    result = session.exec(text("SELECT hinos_json FROM programacoes LIMIT 1")).first()
    if result:
        valor = result[0]
        hinos = json.loads(valor)
        print(f'Total hinos: {len(hinos)}')
        print('Primeiro hino:')
        print(json.dumps(hinos[0], indent=2, ensure_ascii=False))