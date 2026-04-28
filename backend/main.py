"""
Aplicação FastAPI – endpoints REST + fallback para o React SPA.
"""
import os
import sys
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Sequence

# Adiciona o diretório pai ao path para imports
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(base_dir))

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from starlette.middleware.base import BaseHTTPMiddleware

from pydantic import BaseModel, field_validator
import secrets
import json
import re
from datetime import datetime, timedelta, date

def _compare_dates(d1_str, d2_str):
    try:
        if not d1_str or not d2_str:
            return True
        d1 = datetime.strptime(str(d1_str), '%Y-%m-%d')
        d2 = datetime.strptime(str(d2_str), '%Y-%m-%d')
        return d2 > d1
    except Exception as e:
        print(f'Date compare error: {e}')
        return False

from config import DIST_DIR
from email_service import send_password_reset_email
from database import get_session, init_db
from models import (
    Chamada,
    ChamadaCreate,
    ChamadaRead,
    ChamadaUpdate,
    Configuracao,
    Hino,
    HinoBase,
    HinoCreate,
    HinoRead,
    HinoUpdate,
    Membro,
    MembroCreate,
    MembroRead,
    MembroUpdate,
    Programacao,
    ProgramacaoCreate,
    ProgramacaoRead,
    ProgramacaoUpdate,
)


# ─── Lifecycle ────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    init_db()
    yield


# Configuração de CORS seguro
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else ["http://localhost:5173", "http://localhost:39100"]

app = FastAPI(
    title="Gestão Igreja API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS seguro - apenas origens permitidas
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "PUT"],
    allow_headers=["Content-Type", "Authorization"],
    allow_credentials=True,
)

# Rate Limiting simples para login
class RateLimiter:
    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict = defaultdict(list)
    
    def is_allowed(self, key: str) -> bool:
        now = time.time()
        # Limpa requisições antigas
        self.requests[key] = [t for t in self.requests[key] if now - t < self.window_seconds]
        
        if len(self.requests[key]) >= self.max_requests:
            return False
        
        self.requests[key].append(now)
        return True
    
    def clear(self, key: str):
        if key in self.requests:
            del self.requests[key]

# Rate limiter para tentativas de login
login_limiter = RateLimiter(max_requests=5, window_seconds=60)
password_reset_limiter = RateLimiter(max_requests=3, window_seconds=300)


# ═══════════════════════════════════════════════════════════
# Membros
# ═══════════════════════════════════════════════════════════

@app.get("/api/membros", response_model=list[MembroRead])
def listar_membros(
    status: str | None = None,
    session: Session = Depends(get_session),
) -> Sequence[Membro]:
    stmt = select(Membro)
    if status is not None:
        stmt = stmt.where(Membro.status == status)
    return session.exec(stmt).all()


@app.get("/api/membros/{membro_id}", response_model=MembroRead)
def obter_membro(
    membro_id: int,
    session: Session = Depends(get_session),
) -> Membro:
    membro = session.get(Membro, membro_id)
    if not membro:
        raise HTTPException(404, "Membro não encontrado")
    return membro


@app.post("/api/membros", response_model=MembroRead, status_code=201)
def criar_membro(
    payload: MembroCreate,
    session: Session = Depends(get_session),
) -> Membro:
    membro = Membro.model_validate(payload, from_attributes=True)
    session.add(membro)
    session.commit()
    session.refresh(membro)
    return membro


@app.patch("/api/membros/{membro_id}", response_model=MembroRead)
def atualizar_membro(
    membro_id: int,
    payload: MembroUpdate,
    session: Session = Depends(get_session),
) -> Membro:
    membro = session.get(Membro, membro_id)
    if not membro:
        raise HTTPException(404, "Membro não encontrado")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(membro, field, value)
    session.add(membro)
    session.commit()
    session.refresh(membro)
    return membro


@app.delete("/api/membros/{membro_id}", status_code=204)
def remover_membro(
    membro_id: int,
    session: Session = Depends(get_session),
) -> None:
    membro = session.get(Membro, membro_id)
    if not membro:
        raise HTTPException(404, "Membro não encontrado")
    session.delete(membro)
    session.commit()


# ═══════════════════════════════════════════════════════════
# Hinos
# ═══════════════════════════════════════════════════════════

@app.get("/api/hinos", response_model=list[HinoRead])
def listar_hinos(
    session: Session = Depends(get_session),
) -> Sequence[Hino]:
    hinos = session.exec(select(Hino).order_by(Hino.numero)).all()
    return hinos


@app.get("/api/hinos/{hino_id}", response_model=HinoRead)
def obter_hino(
    hino_id: int,
    session: Session = Depends(get_session),
) -> Hino:
    hino = session.get(Hino, hino_id)
    if not hino:
        raise HTTPException(404, "Hino não encontrado")
    return hino


@app.post("/api/hinos", response_model=HinoRead, status_code=201)
def criar_hino(
    payload: HinoCreate,
    session: Session = Depends(get_session),
) -> Hino:
    hino = Hino.model_validate(payload, from_attributes=True)
    session.add(hino)
    session.commit()
    session.refresh(hino)
    return hino


@app.patch("/api/hinos/{hino_id}", response_model=HinoRead)
def atualizar_hino(
    hino_id: int,
    payload: HinoUpdate,
    session: Session = Depends(get_session),
) -> Hino:
    hino = session.get(Hino, hino_id)
    if not hino:
        raise HTTPException(404, "Hino não encontrado")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(hino, field, value)
    session.add(hino)
    session.commit()
    session.refresh(hino)
    return hino


@app.delete("/api/hinos/{hino_id}", status_code=204)
def remover_hino(
    hino_id: int,
    session: Session = Depends(get_session),
) -> None:
    hino = session.get(Hino, hino_id)
    if not hino:
        raise HTTPException(404, "Hino não encontrado")
    session.delete(hino)
    session.commit()


# ═══════════════════════════════════════════════════════════
# Chamada (Attendance)
# ═══════════════════════════════════════════════════════════

@app.get("/api/chamadas", response_model=list[ChamadaRead])
def listar_chamadas(
    session: Session = Depends(get_session),
) -> Sequence[Chamada]:
    return session.exec(select(Chamada).order_by(Chamada.data.desc())).all()


@app.post("/api/chamadas", response_model=ChamadaRead, status_code=201)
def criar_chamada(
    payload: ChamadaCreate,
    session: Session = Depends(get_session),
) -> Chamada:
    chamada = Chamada.model_validate(payload, from_attributes=True)
    session.add(chamada)
    session.commit()
    session.refresh(chamada)
    return chamada


@app.patch("/api/chamadas/{chamada_id}", response_model=ChamadaRead)
def atualizar_chamada(
    chamada_id: int,
    payload: ChamadaUpdate,
    session: Session = Depends(get_session),
) -> Chamada:
    chamada = session.get(Chamada, chamada_id)
    if not chamada:
        raise HTTPException(status_code=404, detail="Chamada não encontrada")
    
    payload_dict = payload.model_dump(exclude_unset=False)
    for key, value in payload_dict.items():
        if value is not None:
            setattr(chamada, key, value)
    
    session.add(chamada)
    session.commit()
    session.refresh(chamada)
    return chamada


@app.post("/api/chamadas/{chamada_id}/deletar", status_code=200)
def deletar_chamada(
    chamada_id: int,
    session: Session = Depends(get_session),
) -> dict:
    chamada = session.get(Chamada, chamada_id)
    if not chamada:
        raise HTTPException(status_code=404, detail="Chamada não encontrada")
    
    session.delete(chamada)
    session.commit()
    return {"ok": True, "message": "Chamada deletada com sucesso"}


# Rota DELETE alternativa (para compatibilidade)
@app.delete("/api/chamadas/{chamada_id}", status_code=200)
def deletar_chamada_alt(
    chamada_id: int,
    session: Session = Depends(get_session),
) -> dict:
    return deletar_chamada(chamada_id, session)


# ═══════════════════════════════════════════════════════════
# Programação (Program History)
# ═══════════════════════════════════════════════════════════

@app.get("/api/programacoes", response_model=list[ProgramacaoRead])
def listar_programacoes(
    session: Session = Depends(get_session),
) -> Sequence[Programacao]:
    return session.exec(
        select(Programacao).order_by(Programacao.data.desc())
    ).all()


@app.get("/api/programacoes/{prog_id}", response_model=ProgramacaoRead)
def obter_programacao(
    prog_id: int,
    session: Session = Depends(get_session),
) -> Programacao:
    prog = session.get(Programacao, prog_id)
    if not prog:
        raise HTTPException(404, "Programação não encontrada")
    return prog


@app.post("/api/programacoes", response_model=ProgramacaoRead, status_code=201)
def criar_programacao(
    payload: ProgramacaoCreate,
    session: Session = Depends(get_session),
) -> Programacao:
    prog = Programacao.model_validate(payload, from_attributes=True)
    session.add(prog)
    session.commit()
    session.refresh(prog)
    
    def _parse_json(js):
        if isinstance(js, list):
            return js
        if isinstance(js, str):
            try:
                return json.loads(js)
            except:
                return []
        return []
    
    hinos_ids = _parse_json(prog.hinos_json)
    data_culto = prog.data
    
    for item in hinos_ids:
        hino_id = item.get("id") if isinstance(item, dict) else item
        hino = session.get(Hino, hino_id)
        if hino:
            if not hino.data_ultima_apresentacao or _compare_dates(hino.data_ultima_apresentacao, data_culto):
                hino.data_ultima_apresentacao = data_culto
                session.add(hino)
    
    session.commit()
    return prog


@app.patch("/api/programacoes/{prog_id}", response_model=ProgramacaoRead)
def atualizar_programacao(
    prog_id: int,
    payload: ProgramacaoUpdate,
    session: Session = Depends(get_session),
) -> Programacao:
    prog = session.get(Programacao, prog_id)
    if not prog:
        raise HTTPException(404, "Programação não encontrada")
    
    def _parse_json(js):
        if isinstance(js, list):
            return js
        if isinstance(js, str):
            try:
                return json.loads(js)
            except:
                return []
        return []
    
    data = payload.model_dump(exclude_unset=True)
    hinos_json = data.pop('hinos_json', None)
    
    for field, value in data.items():
        setattr(prog, field, value)
    
    if hinos_json:
        prog.hinos_json = hinos_json
        hinos_ids = _parse_json(hinos_json)
        data_culto = prog.data
        
        for item in hinos_ids:
            hino_id = item.get("id") if isinstance(item, dict) else item
            hino = session.get(Hino, hino_id)
            if hino:
                if not hino.data_ultima_apresentacao or _compare_dates(hino.data_ultima_apresentacao, data_culto):
                    hino.data_ultima_apresentacao = data_culto
                    session.add(hino)
    
    session.add(prog)
    session.commit()
    session.refresh(prog)
    return prog


@app.delete("/api/programacoes/{prog_id}", status_code=204)
def remover_programacao(
    prog_id: int,
    session: Session = Depends(get_session),
) -> None:
    try:
        prog = session.get(Programacao, prog_id)
        if not prog:
            raise HTTPException(404, "Programação não encontrada")
        
        def _parse_json(js):
            if isinstance(js, list):
                return js
            if isinstance(js, str):
                try:
                    return json.loads(js)
                except:
                    return []
            return []
        
        hinos_afetados = _parse_json(prog.hinos_json)
        
        session.delete(prog)
        session.commit()
        
        # Recalcula a data_ultima_apresentacao para os hinos que estavam nesta programação
        if hinos_afetados:
            todas_progs = session.exec(select(Programacao)).all()
            for item in hinos_afetados:
                hino_id = item.get("id") if isinstance(item, dict) else item
                hino = session.get(Hino, hino_id)
                if hino:
                    ultima_data = None
                    for p in todas_progs:
                        p_hinos = _parse_json(p.hinos_json)
                        if any((x.get("id") if isinstance(x, dict) else x) == hino_id for x in p_hinos):
                            # Usa a mesma função de comparação para achar a maior data
                            if ultima_data is None or _compare_dates(ultima_data, p.data):
                                ultima_data = p.data
                    
                    hino.data_ultima_apresentacao = ultima_data
                    session.add(hino)
            session.commit()
            
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(500, f"Erro ao excluir: {str(e)}")


# ═══════════════════════════════════════════════════════════
# Configurações (key-value)
# ═══════════════════════════════════════════════════════════

@app.get("/api/config/{chave}")
def obter_config(
    chave: str,
    session: Session = Depends(get_session),
) -> JSONResponse:
    cfg = session.get(Configuracao, chave)
    if not cfg:
        raise HTTPException(404, f"Configuração '{chave}' não encontrada")
    return JSONResponse({"chave": cfg.key, "valor_json": cfg.valor_json})


@app.put("/api/config/{chave}")
def salvar_config(
    chave: str,
    payload: dict,
    session: Session = Depends(get_session),
) -> JSONResponse:
    import json
    cfg = session.get(Configuracao, chave)
    valor = json.dumps(payload.get("valor", payload))
    if cfg:
        cfg.valor_json = valor
    else:
        cfg = Configuracao(key=chave, valor_json=valor)
    session.add(cfg)
    session.commit()
    session.refresh(cfg)
    return JSONResponse({"chave": cfg.key, "valor_json": cfg.valor_json})


# ═══════════════════════════════════════════════════════════
# Auth (Password Recovery)
# ═══════════════════════════════════════════════════════════

class ForgotPasswordRequest(BaseModel):
    email: str

class ValidateTokenRequest(BaseModel):
    token: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@app.post("/api/auth/esqueci-senha")
def esqueci_senha(
    payload: ForgotPasswordRequest,
    request: Request,
    session: Session = Depends(get_session),
) -> JSONResponse:
    # Obtém as configurações de auth
    cfg = session.get(Configuracao, "auth_settings")
    
    if not cfg:
        # Se não há config de auth, usa o fallback padrão para validação inicial
        if payload.email != "email@email.com":
            raise HTTPException(404, "E-mail não encontrado na base de dados.")
        
        # Cria a configuração se não existe
        cfg = Configuracao(
            key="auth_settings", 
            valor_json=json.dumps({"user": {"email": "adm@ia.com"}, "passwordHash": "adm123"})
        )
        session.add(cfg)
        session.commit()
        session.refresh(cfg)
        
    auth_data = json.loads(cfg.valor_json)
    user = auth_data.get("user", {})
    stored_email = user.get("email", "email@email.com")

    if payload.email != stored_email:
        raise HTTPException(404, "E-mail não encontrado na base de dados.")

    # Gera token
    token = secrets.token_hex(4).upper()
    expiry = (datetime.now() + timedelta(hours=1)).isoformat()
    
    # Salva o token na base de dados (em uma configuração separada para reset)
    reset_cfg = session.get(Configuracao, "reset_token_data")
    reset_data = {"token": token, "expiry": expiry, "email": stored_email}
    
    if reset_cfg:
        reset_cfg.valor_json = json.dumps(reset_data)
    else:
        reset_cfg = Configuracao(key="reset_token_data", value_json=json.dumps(reset_data))
        
    session.add(reset_cfg)
    session.commit()

    # Pega a URL correta do frontend dinamicamente (útil para dev e PyWebView)
    base_url = request.headers.get("origin", str(request.base_url).rstrip('/'))

    # Envia o email
    success = send_password_reset_email(payload.email, token, base_url)
    
    if success:
        return JSONResponse({"message": "E-mail de recuperação enviado com sucesso."})
    else:
        # Se não há SMTP configurado, no dev ambiente retorna sucesso simulado
        print(f"DEV MOCK: Token gerado: {token}")
        return JSONResponse({"message": "E-mail simulado com sucesso (SMTP não configurado)."})


@app.post("/api/auth/validar-token")
def validar_token(
    payload: ValidateTokenRequest,
    session: Session = Depends(get_session),
) -> JSONResponse:
    reset_cfg = session.get(Configuracao, "reset_token_data")
    if not reset_cfg:
        raise HTTPException(400, "Nenhuma solicitação de redefinição encontrada.")
        
    reset_data = json.loads(reset_cfg.valor_json)
    if reset_data.get("token") != payload.token.strip().upper():
        raise HTTPException(400, "Código inválido. Verifique e tente novamente.")
        
    expiry = datetime.fromisoformat(reset_data.get("expiry", "2000-01-01T00:00:00"))
    if datetime.now() > expiry:
        raise HTTPException(400, "O código de verificação expirou. Solicite um novo.")
        
    return JSONResponse({"message": "Código válido."})


@app.post("/api/auth/redefinir-senha")
def redefinir_senha(
    payload: ResetPasswordRequest,
    session: Session = Depends(get_session),
) -> JSONResponse:
    reset_cfg = session.get(Configuracao, "reset_token_data")
    if not reset_cfg:
        raise HTTPException(400, "Nenhuma solicitação de redefinição encontrada.")
        
    reset_data = json.loads(reset_cfg.valor_json)
    
    if reset_data.get("token") != payload.token.strip().upper():
        raise HTTPException(400, "Token inválido ou expirado.")
        
    expiry = datetime.fromisoformat(reset_data.get("expiry", "2000-01-01T00:00:00"))
    if datetime.now() > expiry:
        raise HTTPException(400, "O link de redefinição expirou. Solicite um novo.")

    # Token válido, atualiza a senha
    auth_cfg = session.get(Configuracao, "auth_settings")
    if not auth_cfg:
        raise HTTPException(500, "Configurações de usuário não encontradas.")
        
    auth_data = json.loads(auth_cfg.valor_json)
    auth_data["passwordHash"] = payload.new_password
    
    auth_cfg.valor_json = json.dumps(auth_data)
    
    # Invalida o token
    session.delete(reset_cfg)
    
    session.add(auth_cfg)
    session.commit()
    
    return JSONResponse({"message": "Senha redefinida com sucesso."})


# ─── Health ───────────────────────────────────────────────

@app.get("/api/health")
def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


# ═══════════════════════════════════════════════════════════
# Static files + SPA fallback
# ═══════════════════════════════════════════════════════════
# Monta APENAS se a pasta dist existir (evita crash em testes isolados)

_index_html: Path = DIST_DIR / "index.html"

if DIST_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str) -> FileResponse:
        """
        Qualquer rota que não seja /api/* e não tenha match em StaticFiles
        retorna index.html para o React Router assumir.
        """
        file = DIST_DIR / full_path
        if file.is_file():
            return FileResponse(file)
        return FileResponse(_index_html)
