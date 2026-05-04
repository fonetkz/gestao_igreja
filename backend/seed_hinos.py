import sys
import os
import re
import pdfplumber
from sqlmodel import Session
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import get_engine
from backend.models import Hino

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SIGLAS = {
    'coral-jovem':          'CJ',
    'coro-da-sede':         'CS',
    'coro-de-camara':       'CCam',
    'coro-feminino':        'CF',
    'coro-infanto-juvenil': 'CIJ',
    'coro-masculino':       'CM',
    'dia-das-maes':         'DM',
    'grande-coral':         'GC',
    'instrumentais':        'Inst',
    'orquestra-de-camara':  'OCam',
    'orquestra-de-violoes': 'OV',
    'orquestra-do-coral':   'OC',
    'orquestra-do-hinario': 'OH',
    'solos-com-coral':      'SC',
    'solos-especiais':      'SE',
    'solos-normais':        'SN',
}


def clean_titulo(t):
    t = re.sub(r'\s*\([^)]*\)\s*', ' ', t)   # remove (Coro), (Orq), etc.
    t = re.sub(r'\s*"[^"]*"\s*', ' ', t)      # remove "Versão Natal" etc.
    t = re.sub(r'\s+\d+\s*$', '', t)          # remove número de índice no final (ex: grande-coral págs. 5-8)
    t = re.sub(r'\s+', ' ', t)
    return t.strip().upper()


def should_skip(line):
    """Pula linhas que NÃO são de hino (cabeçalhos, rodapés, descritivos)."""
    stripped = line.strip()
    if not stripped:
        return True
    if line[0] == ' ':
        return True
    # Mantém apenas linhas que começam com dígito ou prefixo conhecido
    return not re.match(r'^\d|^CM\s*-|^OV-|^S\.\d|^C\.Cam', stripped)


def get_text(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        return '\n'.join(p.extract_text() or '' for p in pdf.pages)


def extrair_hinos(pdf_path, sigla):
    nome = os.path.splitext(os.path.basename(pdf_path))[0]
    full_text = get_text(pdf_path)
    pares = []  # lista de (num_str, titulo_raw)

    # ── Formato OV-01: Orquestra de Violões ────────────────────────────────
    if nome == 'orquestra-de-violoes':
        for m in re.finditer(r'OV-(\d+) +([^\n]+?)(?=\s+OV-\d+|\s*$)', full_text):
            pares.append((m.group(1), m.group(2)))

    # ── Formato CM - 01: Coro Masculino ────────────────────────────────────
    elif nome == 'coro-masculino':
        for m in re.finditer(r'CM\s*-\s*(\d+)\s+(.*?)(?=\s+CM\s*-\s*\d+|\n|$)', full_text):
            pares.append((m.group(1), m.group(2)))

    # ── Formato S.04: Solos com Coral ──────────────────────────────────────
    elif nome == 'solos-com-coral':
        for m in re.finditer(r'S\.(\d+)\s+([^\n]+)', full_text):
            pares.append((m.group(1), m.group(2)))

    # ── Formato C.Cam. 1: Coro de Câmara ───────────────────────────────────
    elif nome == 'coro-de-camara':
        for m in re.finditer(r'C\.Cam\.?\s*(\d+)\s*[–\-]\s*([^\n]+)', full_text):
            pares.append((m.group(1), m.group(2)))

    # ── Formatos padrão (com ou sem traço) ─────────────────────────────────
    else:
        # Detecta se o separador é traço, verificando apenas linhas de hino
        has_dash = any(
            re.match(r'^\d{1,3}\s*[–\-]', line.strip())
            for line in full_text.split('\n')
            if line.strip() and line[0] != ' '
        )

        for line in full_text.split('\n'):
            if should_skip(line):
                continue
            stripped = line.strip()

            if has_dash:
                # Divide a linha em blocos "NN – Título"
                chunks = re.split(r'(?<!\w)(?=\b\d{1,3}\b\s*[–\-]\s*[A-ZÀ-Ÿ])', stripped)
                for chunk in chunks:
                    m = re.match(r'(\d{1,3})\s*[–\-]\s*(.+)', chunk.strip())
                    if m:
                        pares.append((m.group(1), m.group(2).strip()))
            else:
                # Divide a linha em blocos "NN Título"
                chunks = re.split(r'(?<!\w)(?=\b\d{1,3}\b\s+[A-ZÀ-Ÿ])', stripped)
                for chunk in chunks:
                    m = re.match(r'(\d{1,3})\s+(.+)', chunk.strip())
                    if m:
                        pares.append((m.group(1), m.group(2).strip()))

    # ── Normaliza e deduplica ───────────────────────────────────────────────
    hinos = []
    seen = set()
    for num_raw, titulo_raw in pares:
        num = num_raw.strip().zfill(3)
        titulo = clean_titulo(titulo_raw)
        if not titulo or len(titulo) < 2:
            continue
        if num == '000':                  # cabeçalho de seção (ex: coral-jovem)
            continue
        if re.match(r'^\d+$', titulo):    # índice sem título (ex: grande-coral pág.7-8)
            continue
        key = (num, sigla)
        if key not in seen:
            seen.add(key)
            hinos.append(Hino(numero=num, titulo=titulo, secao_hino=sigla, tonalidade=sigla.lower()))

    return hinos


def popular_banco():
    todos = []

    print("Lendo PDFs...\n")
    for nome, sigla in SIGLAS.items():
        caminho = os.path.join(BASE_DIR, f'{nome}.pdf')
        if not os.path.exists(caminho):
            print(f"  NAO ENCONTRADO: {nome}.pdf")
            continue
        hinos = extrair_hinos(caminho, sigla)
        print(f"  OK  {nome:<32} -> {sigla:<5}: {len(hinos)} hinos")
        todos.extend(hinos)

    print(f"\n  Total: {len(todos)} hinos\n")

    try:
        with Session(get_engine()) as session:
            deleted = session.execute(text('DELETE FROM hinos')).rowcount
            session.commit()
            print(f"  {deleted} hinos removidos do banco.")

            session.add_all(todos)
            session.commit()
            print(f"  {len(todos)} hinos inseridos com sucesso!\n")
    except Exception as e:
        print(f"  ERRO: {e}")
        raise


if __name__ == "__main__":
    popular_banco()
