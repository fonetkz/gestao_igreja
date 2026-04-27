import sqlite3
conn = sqlite3.connect('orquestra.db')
cursor = conn.cursor()
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='configuracoes';")
res = cursor.fetchone()
print(res[0] if res else "Table not found")
