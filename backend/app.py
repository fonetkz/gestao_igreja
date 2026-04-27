"""
Launcher Desktop – PyWebView + Uvicorn em thread separada.
"""
import os
import sys
import signal
import socket
import threading
import time
from typing import NoReturn

# Adiciona o diretório pai ao path para imports
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(base_dir))

import uvicorn
import webview

from config import API_HOST, API_PORT


def _find_free_port(preferred: int) -> int:
    """Retorna a porta preferida se livre, senão busca uma aleatória."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((API_HOST, preferred))
            return preferred
        except OSError:
            s.bind((API_HOST, 0))
            return s.getsockname()[1]


def _wait_for_server(host: str, port: int, timeout: float = 15.0) -> None:
    """Bloqueia até o servidor aceitar conexões TCP."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=0.5):
                return
        except OSError:
            time.sleep(0.15)
    raise TimeoutError(f"Servidor não respondeu em {timeout}s")


def _run_server(host: str, port: int) -> None:
    """Executa o Uvicorn em modo single-worker (thread)."""
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        log_level="warning",
        reload=False,
    )


def main() -> NoReturn:
    port = _find_free_port(API_PORT)
    url = f"http://{API_HOST}:{port}"

    # Servidor em thread daemon – morre com o processo principal
    server_thread = threading.Thread(
        target=_run_server,
        args=(API_HOST, port),
        daemon=True,
    )
    server_thread.start()

    _wait_for_server(API_HOST, port)

    # Janela nativa sem chrome de browser
    window = webview.create_window(
        title="Choir Deck",
        url=url,
        width=1280,
        height=800,
        min_size=(960, 600),
        resizable=True,
        text_select=True,
    )

    is_frozen = getattr(sys, "frozen", False)

    webview.start(
        debug=not is_frozen,
        gui="edgechromium",  # Win10+ usa Edge WebView2
    )

    # Ao fechar a janela, encerra o processo de forma confiável
    os._exit(0)


if __name__ == "__main__":
    main()
