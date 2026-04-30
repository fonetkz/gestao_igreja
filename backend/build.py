"""
Script auxiliar de build completo.
Executa o build do React + empacotamento PyInstaller em sequência.

Uso: python backend/build.py
"""
import subprocess
import sys
import os
import platform
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def run(cmd: list[str], cwd: Path | None = None, shell: bool = False) -> None:
    print(f"\n{'='*60}")
    print(f"  > {' '.join(cmd)}")
    print(f"{'='*60}\n")
    result = subprocess.run(cmd, cwd=cwd or ROOT, check=False, shell=shell)
    if result.returncode != 0:
        print(f"\n[ERRO] Falha ao executar: {' '.join(cmd)}")
        sys.exit(result.returncode)

def kill_existing_process() -> None:
    """Tenta encerrar o processo do GestaoIgreja.exe no Windows se estiver rodando."""
    if platform.system() == "Windows":
        print("\n[INFO] Verificando e encerrando instancias anteriores do GestaoIgreja.exe...")
        subprocess.run("taskkill /f /im GestaoIgreja.exe", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def main() -> None:
    kill_existing_process()
    
    # Limpa cache e o arquivo .spec antigo que força o console a aparecer
    spec_file = ROOT / "GestaoIgreja.spec"
    if spec_file.exists():
        try:
            spec_file.unlink()
        except Exception:
            pass
    build_dir = ROOT / "build" / "GestaoIgreja"
    if build_dir.exists():
        shutil.rmtree(build_dir, ignore_errors=True)

    # 1. Build do frontend React
    print("\n[1/2] Etapa 1/2: Build do Frontend (Vite)\n")
    
    # Shell=True com string costuma ser mais seguro no Windows para comandos como npm
    result = subprocess.run("npm run build", cwd=ROOT, shell=True)
    if result.returncode != 0:
        print(f"\n[ERRO] Falha ao executar o build do Vite.")
        sys.exit(result.returncode)

    dist = ROOT / "dist"
    if not dist.is_dir():
        print("[ERRO] Pasta dist/ não foi gerada. Verifique o build do Vite.")
        sys.exit(1)

    # 2. Empacotamento com PyInstaller
    print("\n[2/2] Etapa 2/2: Empacotamento Desktop (PyInstaller)\n")
    
    app_py = ROOT / "backend" / "app.py"
    dist_desktop = ROOT / "dist_desktop"
    
    # Separador de path do OS (; no Windows, : no Linux/Mac)
    separator = os.pathsep
    
    pyinstaller_cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name", "GestaoIgreja",
        "--windowed",
        "--onefile",
        "--clean",
        "--noconfirm",
        "--distpath", str(dist_desktop),
        "--add-data", f"{dist}{separator}dist",
        "--hidden-import", "uvicorn.logging",
        "--hidden-import", "uvicorn.loops",
        "--hidden-import", "uvicorn.loops.auto",
        "--hidden-import", "uvicorn.protocols",
        "--hidden-import", "uvicorn.protocols.http",
        "--hidden-import", "uvicorn.protocols.http.auto",
        "--hidden-import", "uvicorn.protocols.websockets",
        "--hidden-import", "uvicorn.protocols.websockets.auto",
        "--hidden-import", "uvicorn.lifespan",
        "--hidden-import", "uvicorn.lifespan.on",
        "--hidden-import", "uvicorn.lifespan.off",
        "--hidden-import", "sqlmodel",
        "--hidden-import", "sqlalchemy",
        "--hidden-import", "sqlite3",
        "--hidden-import", "webbrowser",
        str(app_py)
    ]
    
    run(pyinstaller_cmd, shell=False)

    # 3. Opcional: Copiar banco de dados existente para a pasta do executável
    db_source = ROOT / "orquestra.db"
    db_dest = dist_desktop / "orquestra.db"
    if db_source.exists():
        print(f"\n[INFO] Copiando banco de dados existente para a versão compilada...")
        shutil.copy2(db_source, db_dest)
        print("[OK] Banco de dados copiado com sucesso.")

    exe_file = dist_desktop / ("GestaoIgreja.exe" if platform.system() == "Windows" else "GestaoIgreja")
    print(f"\n[OK] Build concluído!")
    print(f"  Acesse a pasta: {dist_desktop}")
    print(f"  Basta copiar o arquivo '{exe_file.name}' e o 'orquestra.db' para o seu pendrive!")


if __name__ == "__main__":
    main()
