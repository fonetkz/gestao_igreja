import sys, os, json
sys.path.insert(0, os.path.abspath('.'))
from sqlmodel import Session, text
from backend.database import get_engine

with Session(get_engine()) as session:
    result = session.exec(text("SELECT valor_json FROM config_global WHERE chave = 'global_settings'")).first()
    if result:
        data = json.loads(result)
        ht = data.get('hymnTypes', [])
        print(f'Total hymnTypes no banco: {len(ht)}')
        for t in ht:
            print(f'  {t}')
    else:
        print('Nenhuma config global_settings encontrada')