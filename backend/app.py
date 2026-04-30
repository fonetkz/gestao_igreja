"""
Launcher Desktop – PyWebView + Uvicorn em thread separada.
"""
import os
import sys
import signal
import socket
import threading
import time
import webbrowser
from typing import NoReturn, Optional
from pathlib import Path

# ─── Logging em arquivo (funciona mesmo em --windowed) ─────────
if getattr(sys, "frozen", False):
    log_dir = Path(sys.executable).parent
else:
    log_dir = Path.cwd()

log_file = log_dir / "gestao_igreja.log"
try:
    import logging
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.FileHandler(log_file, encoding="utf-8")],
    )
    logger = logging.getLogger("GestaoIgreja")
    logger.info("=" * 60)
    logger.info("Gestão Igreja iniciando...")
    logger.info(f"sys.frozen: {getattr(sys, 'frozen', False)}")
    logger.info(f"sys._MEIPASS: {getattr(sys, '_MEIPASS', 'N/A')}")
    logger.info(f"Executável: {sys.executable}")
    logger.info(f"Pasta de trabalho: {os.getcwd()}")
except Exception as e:
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"Falha ao configurar logging: {e}\n")

# Adiciona o diretório pai ao path para imports
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, base_dir)
sys.path.insert(0, os.path.dirname(base_dir))

try:
    import uvicorn
    logger.info("uvicorn importado com sucesso")
except Exception as e:
    logger.error(f"Erro ao importar uvicorn: {e}", exc_info=True)

try:
    from backend.config import API_HOST, API_PORT, _is_frozen
    logger.info(f"Config carregada: HOST={API_HOST}, PORT={API_PORT}")
except Exception as e:
    logger.error(f"Erro ao importar config: {e}", exc_info=True)

try:
    from backend.main import app as fastapi_app
    logger.info("FastAPI app importada com sucesso")
except Exception as e:
    logger.error(f"Erro ao importar FastAPI app: {e}", exc_info=True)

# Variável global para capturar a exceção da thread do servidor
server_exception: Optional[Exception] = None


def _find_free_port(preferred: int) -> int:
    """Retorna a porta preferida se livre, senão busca uma aleatória."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((API_HOST, preferred))
            return preferred
        except OSError:
            s.bind((API_HOST, 0))
            return s.getsockname()[1]


def _log_message(*args, **kwargs):
    message = " ".join(map(str, args))
    logger.info(message) # Sempre loga para o arquivo
    if not _is_frozen():
        print(message, **kwargs) # Apenas imprime no console se não estiver congelado


def _wait_for_server(host: str, port: int, timeout: float = 15.0) -> None:
    """Bloqueia até o servidor aceitar conexões TCP."""
    logger.info(f"Aguardando servidor em {host}:{port}...")
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        # Se a thread do servidor morreu, pare de esperar
        if server_exception:
            logger.warning("Thread do servidor morreu, interrompendo espera")
            return
        try:
            with socket.create_connection((host, port), timeout=0.5):
                logger.info("Servidor pronto!")
                return
        except OSError:
            time.sleep(0.15)
    logger.error(f"Servidor não respondeu em {timeout}s")
    raise TimeoutError(f"Servidor não respondeu em {timeout}s")


def _run_server(host: str, port: int) -> None:
    """Executa o Uvicorn em modo single-worker (thread)."""
    global server_exception
    try:
        logger.info(f"Iniciando Uvicorn em {host}:{port}")
        # log_config=None evita que o Uvicorn tente configurar logs que dependem de console
        uvicorn.run(
            fastapi_app,
            host=host,
            port=port,
            log_level="warning",
            reload=False,
            log_config=None,
        )
    except BaseException as e:
        # Captura qualquer exceção que ocorra na inicialização do servidor
        logger.error(f"Erro no servidor: {e}", exc_info=True)
        server_exception = e


def main() -> NoReturn:
    logger.info("main() iniciado")

    port = _find_free_port(API_PORT)
    url = f"http://{API_HOST}:{port}"
    logger.info(f"URL do sistema: {url}")

    # Servidor em thread daemon – morre com o processo principal
    server_thread = threading.Thread(
        target=_run_server,
        args=(API_HOST, port),
        daemon=True,
    )
    server_thread.start()
    logger.info("Thread do servidor iniciada")

    try:
        _wait_for_server(API_HOST, port)
        # Se a thread do servidor falhou, a exceção estará em server_exception
        if server_exception:
            raise server_exception
    except Exception as e:
        logger.error("FATAL: O servidor falhou ao iniciar.", exc_info=True)
        logger.info("O processo fechará em 30 segundos...")
        time.sleep(30)
        os._exit(1)

    # Abre o navegador padrão do usuário
    logger.info(f"Abrindo navegador em: {url}")
    if not webbrowser.open(url):
        logger.warning(f"Não foi possível abrir o navegador. Acesse manualmente: {url}")

    logger.info("=" * 40)
    logger.info("Servidor do Gestão Igreja está rodando!")
    logger.info("Feche o processo para encerrar o sistema.")
    logger.info("=" * 40)

    # Mantém o processo principal vivo para o servidor continuar rodando
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Interrupção recebida, encerrando...")
        pass

    # Ao fechar a janela, encerra o processo de forma confiável
    os._exit(0)


if __name__ == "__main__":
    main()
