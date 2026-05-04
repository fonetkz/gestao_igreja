import sys, os, json
sys.path.insert(0, os.path.abspath('.'))
from sqlmodel import Session, text
from backend.database import get_engine

HYMN_TYPES = [
    { 'id': 1,  'value': 'gc',   'label': 'GC' },
    { 'id': 2,  'value': 'cs',   'label': 'CS' },
    { 'id': 3,  'value': 'oh',   'label': 'OH' },
    { 'id': 4,  'value': 'oc',   'label': 'OC' },
    { 'id': 5,  'value': 'sc',   'label': 'SC' },
    { 'id': 6,  'value': 'ocam', 'label': 'OCam' },
    { 'id': 7,  'value': 'hinario', 'label': 'Hinário' },
    { 'id': 8,  'value': 'cj',   'label': 'CJ' },
    { 'id': 9,  'value': 'ccam', 'label': 'CCam' },
    { 'id': 10, 'value': 'cf',   'label': 'CF' },
    { 'id': 11, 'value': 'cij',  'label': 'CIJ' },
    { 'id': 12, 'value': 'cm',   'label': 'CM' },
    { 'id': 13, 'value': 'dm',   'label': 'DM' },
    { 'id': 14, 'value': 'inst', 'label': 'Inst' },
    { 'id': 15, 'value': 'ov',   'label': 'OV' },
    { 'id': 16, 'value': 'se',   'label': 'SE' },
    { 'id': 17, 'value': 'sn',   'label': 'SN' },
]

engine = get_engine()
with Session(engine) as session:
    result = session.exec(text("SELECT valor_json FROM configuracoes WHERE key = 'global_settings'")).first()
    if result:
        valor_json = result[0]
        data = json.loads(valor_json)
        data['hymnTypes'] = HYMN_TYPES
        new_valor_json = json.dumps(data, ensure_ascii=False)
        session.execute(text("UPDATE configuracoes SET valor_json = :v WHERE key = :k"), {'v': new_valor_json, 'k': 'global_settings'})
        session.commit()
        print(f'Atualizado! Novo total: {len(HYMN_TYPES)} tipos')
    else:
        print('Nao encontrada config global_settings')