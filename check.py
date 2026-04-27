import requests
r = requests.get('http://127.0.0.1:39100/api/membros')
print([(m['nome'], m.get('cargo')) for m in r.json()[:5]])