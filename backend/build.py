"""
Script auxiliar de build completo.
Executa o build do React + empacotamento PyInstaller em sequência.

Uso: python backend/build.py
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC_FILE = ROOT / "backend" / "orquestra.spec"


def run(cmd: list[str], cwd: Path | None = None) -> None:
    print(f"\n{'='*60}")
    print(f"  → {' '.join(cmd)}")
    print(f"{'='*60}\n")
    result = subprocess.run(cmd, cwd=cwd or ROOT, check=False, shell=True)
    if result.returncode != 0:
        print(f"\n✗ Falha ao executar: {' '.join(cmd)}")
        sys.exit(result.returncode)


def main() -> None:
    # 1. Build do frontend React
    print("\n🔨 Etapa 1/2: Build do Frontend (Vite)\n")
    run(["npm", "run", "build"])

    dist = ROOT / "dist"
    if not dist.is_dir():
        print("✗ Pasta dist/ não foi gerada. Verifique o build do Vite.")
        sys.exit(1)

    # 2. Empacotamento com PyInstaller
    print("\n📦 Etapa 2/2: Empacotamento Desktop (PyInstaller)\n")
    run([
        sys.executable, "-m", "PyInstaller",
        "--clean",
        "--noconfirm",
        str(SPEC_FILE),
    ])

    output = ROOT / "dist_desktop" / "GestaoIgreja"
    # PyInstaller default output é em dist/, mas com --distpath poderíamos mudar
    pyinstaller_out = ROOT / "dist" / "GestaoIgreja"
    if not pyinstaller_out.is_dir():
        pyinstaller_out = ROOT / "dist_desktop" / "GestaoIgreja"

    print(f"\n✓ Build concluído!")
    print(f"  Executável em: {pyinstaller_out}")
    print(f"  Execute: GestaoIgreja.exe")


if __name__ == "__main__":
    main()
