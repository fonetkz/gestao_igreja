import sys, os, json
sys.path.insert(0, os.path.abspath('.'))
from sqlmodel import Session, text
from backend.database import get_engine

engine = get_engine()
with Session(engine) as session:
    result = session.exec(text("SELECT valor_json FROM configuracoes WHERE key = 'global_settings'")).first()
    if result:
        # Result is a Row object, get the first column
        valor_json = result[0]
        data = json.loads(valor_json)
        ht = data.get('hymnTypes', [])
        print(f'Total hymnTypes no banco: {len(ht)}')
        for t in ht:
            print(f'  value={t.get("value")}, label={t.get("label")}')
    else:
        print('Nenhuma config global_settings encontrada')