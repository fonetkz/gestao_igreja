import sqlite3

conn = sqlite3.connect("E:/PROJETOS/saas_gestao_igreja/orquestra.db")
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("Tables:", cursor.fetchall())
conn.close()

conn = sqlite3.connect("E:/PROJETOS/saas_gestao_igreja/orquestra.db")
cursor = conn.cursor()
members = [
    ("Gustavo Rocha", "GR", "Cello", "Cello", "Maestro", "Ativo", 0, None, "17991825818", "2002-03-13"),
    ("Maria Lucia", "ML", "Soprano", "Soprano", "Musical, Regente", "Ativo", 0, None, "17981234567", "1985-06-22"),
    ("Vanderlei Xavier", "VX", "Baixo", "Baixo", "Coordenador", "Ativo", 0, None, "17991234567", "1978-11-15"),
    ("Larissa Rocha", "LR", "Soprano", "Soprano", "Solista", "Ativo", 0, None, "17991234568", "1995-02-28"),
    ("Viviany Perez", "VP", "Contralto", "Contralto", "Vice-Coordenadora", "Ativo", 0, None, "17991234569", "1990-08-10"),
    ("Joaquim Silva", "JS", "Tenor", "Tenor", "Tecnico de Som", "Ativo", 0, None, "17991234570", "1982-04-05"),
    ("Ana Paula", "AP", "Soprano", "Soprano", "Ministra Louvor", "Ativo", 0, None, "17991234571", "1992-12-20"),
    ("Carlos Eduardo", "CE", "Baixo", "Baixo", None, "Ativo", 0, None, "17991234572", "1988-01-25"),
    ("Patricia Santos", "PS", "Mezosoprano", "Mezosoprano", None, "Licenca", 0, None, "17991234573", "1991-07-14"),
    ("Roberto Alves", "RA", "Violino", "Violino", "Spalla", "Ativo", 0, None, "17991234574", "1975-09-30"),
]
cursor.executemany("INSERT INTO membros (nome, iniciais, secao, instrumento_voz, cargo, status, faltas_mes_atual, data_ultimo_ensaio, telefone, data_nascimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", members)
conn.commit()
print(f"Inseridos {cursor.rowcount} membros")
conn.close()