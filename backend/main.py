"""
Aplicação FastAPI – endpoints REST + fallback para o React SPA.
"""
import os
import sys
import time
import json
import bcrypt
from collections import defaultdict
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Sequence

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, text
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, field_validator
import secrets
from datetime import datetime, timedelta, date
from jwt import PyJWTError
import jwt

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

from backend.config import DIST_DIR
from backend.config import API_PORT
from backend.email_service import send_password_reset_email, send_email_change_code
from backend.database import get_session, init_db
from backend.models import (
    Chamada,
    ChamadaCreate,
    ChamadaRead,
    ChamadaUpdate,
    Configuracao,
    Evento,
    EventoCreate,
    EventoRead,
    EventoUpdate,
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
    Usuario,
)

JWT_SECRET = os.getenv("JWT_SECRET", "gestao_igreja_secret_key_2024_very_secure")
JWT_ALGORITHM = "HS256"


class TokenData(BaseModel):
    id: int
    nome: str
    email: str
    papel: str
    contexto_padrao: str | None = None


def create_token(user_data: dict) -> str:
    payload = {
        "id": user_data["id"],
        "nome": user_data["nome"],
        "email": user_data["email"],
        "papel": user_data["papel"],
        "contexto_padrao": user_data.get("contexto_padrao"),
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(request: Request) -> TokenData:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Não autenticado")

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return TokenData(
            id=payload["id"],
            nome=payload["nome"],
            email=payload["email"],
            papel=payload["papel"],
            contexto_padrao=payload.get("contexto_padrao"),
        )
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")


def require_admin(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    if current_user.papel != "admin":
        raise HTTPException(status_code=403, detail="Acesso administrativo necessário")
    return current_user


# ─── Lifecycle ────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    init_db()
    yield


# Configuração de CORS seguro
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else ["http://localhost:5173", f"http://localhost:{API_PORT}"]

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
    current_user: TokenData = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Sequence[Chamada]:
    stmt = select(Chamada)
    if current_user.papel == "responsavel":
        stmt = stmt.where(Chamada.criado_por_id == current_user.id)
    return session.exec(stmt.order_by(Chamada.data.desc())).all()


@app.post("/api/chamadas", response_model=ChamadaRead, status_code=201)
def criar_chamada(
    payload: ChamadaCreate,
    current_user: TokenData = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Chamada:
    chamada = Chamada.model_validate(payload, from_attributes=True)
    chamada.criado_por_id = current_user.id
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
        try:
            hino = session.get(Hino, int(hino_id))
            if hino:
                if not hino.data_ultima_apresentacao or _compare_dates(hino.data_ultima_apresentacao, data_culto):
                    hino.data_ultima_apresentacao = data_culto
                    session.add(hino)
        except (ValueError, TypeError):
            pass # Ignora IDs de texto customizados (ex: 'custom_1234')
    
    session.commit()
    return prog


def _atualizar_data_ultima_apresentacao(session, hinos_ids):
    """Atualiza data_ultima_apresentacao para uma lista de hinos buscando em todas as programações."""
    def _parse_json(js):
        if isinstance(js, list):
            return js
        if isinstance(js, str):
            try:
                return json.loads(js)
            except:
                return []
        return []
    
    todas_progs = session.exec(select(Programacao)).all()
    for item in hinos_ids:
        hino_id = item.get("id") if isinstance(item, dict) else item
        try:
            hino = session.get(Hino, int(hino_id))
            if hino:
                ultima_data = None
                for p in todas_progs:
                    p_hinos = _parse_json(p.hinos_json)
                    if any(str(x.get("id") if isinstance(x, dict) else x) == str(int(hino_id)) for x in p_hinos):
                        if ultima_data is None or _compare_dates(ultima_data, p.data):
                            ultima_data = p.data
                
                hino.data_ultima_apresentacao = ultima_data
                session.add(hino)
        except (ValueError, TypeError):
            pass


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
        _atualizar_data_ultima_apresentacao(session, hinos_ids)
    
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
        
        if hinos_afetados:
            _atualizar_data_ultima_apresentacao(session, hinos_afetados)
            session.commit()
            
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(500, f"Erro ao excluir: {str(e)}")


# ═══════════════════════════════════════════════════════════
# Eventos (cronograma de reuniões especiais)
# ═══════════════════════════════════════════════════════════

@app.get("/api/eventos", response_model=list[EventoRead])
def listar_eventos(
    session: Session = Depends(get_session),
) -> Sequence[Evento]:
    return session.exec(select(Evento).order_by(Evento.data)).all()


@app.get("/api/eventos/{evento_id}", response_model=EventoRead)
def obter_evento(
    evento_id: int,
    session: Session = Depends(get_session),
) -> Evento:
    evento = session.get(Evento, evento_id)
    if not evento:
        raise HTTPException(404, "Evento não encontrado")
    return evento


@app.post("/api/eventos", response_model=EventoRead, status_code=201)
def criar_evento(
    payload: EventoCreate,
    session: Session = Depends(get_session),
) -> Evento:
    evento = Evento.model_validate(payload, from_attributes=True)
    session.add(evento)
    session.commit()
    session.refresh(evento)
    return evento


@app.patch("/api/eventos/{evento_id}", response_model=EventoRead)
def atualizar_evento(
    evento_id: int,
    payload: EventoUpdate,
    session: Session = Depends(get_session),
) -> Evento:
    evento = session.get(Evento, evento_id)
    if not evento:
        raise HTTPException(404, "Evento não encontrado")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(evento, field, value)
    session.add(evento)
    session.commit()
    session.refresh(evento)
    return evento


@app.delete("/api/eventos/{evento_id}", status_code=204)
def remover_evento(
    evento_id: int,
    session: Session = Depends(get_session),
) -> None:
    evento = session.get(Evento, evento_id)
    if not evento:
        raise HTTPException(404, "Evento não encontrado")
    session.delete(evento)
    session.commit()


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


@app.patch("/api/config/{chave}")
def patch_config(
    chave: str,
    payload: dict,
    current_user: TokenData = Depends(require_admin),
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


@app.post("/api/config/{chave}")
def post_config(
    chave: str,
    payload: dict,
    current_user: TokenData = Depends(require_admin),
    session: Session = Depends(get_session),
) -> JSONResponse:
    return patch_config(chave, payload, current_user, session)


@app.delete("/api/config/{chave}")
def delete_config(
    chave: str,
    current_user: TokenData = Depends(require_admin),
    session: Session = Depends(get_session),
) -> JSONResponse:
    cfg = session.get(Configuracao, chave)
    if cfg:
        session.delete(cfg)
        session.commit()
    return JSONResponse({"message": "Configuração removida."})


# ═══════════════════════════════════════════════════════════
# Auth (Login)
# ═══════════════════════════════════════════════════════════

class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/api/auth/login", status_code=200)
def login(
    payload: LoginRequest,
    session: Session = Depends(get_session),
) -> JSONResponse:
    if not login_limiter.is_allowed(payload.email.lower()):
        raise HTTPException(429, "Muitas tentativas. Aguarde 1 minuto.")

    user = session.exec(
        select(Usuario).where(
            Usuario.email == payload.email.lower(),
            Usuario.ativo == 1
        )
    ).first()

    if not user:
        raise HTTPException(401, "E-mail ou senha incorretos.")

    try:
        password_ok = bcrypt.checkpw(
            payload.password.encode(),
            user.senha_hash.encode()
        )
    except Exception:
        password_ok = False

    if not password_ok:
        raise HTTPException(401, "E-mail ou senha incorretos.")

    login_limiter.clear(payload.email.lower())

    token = create_token({
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "papel": user.papel,
        "contexto_padrao": user.contexto_padrao,
    })

    return JSONResponse({
        "token": token,
        "user": {
            "id": user.id,
            "nome": user.nome,
            "email": user.email,
            "papel": user.papel,
            "contexto_padrao": user.contexto_padrao,
        }
    })


@app.get("/api/auth/me")
def get_me(
    current_user: TokenData = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> JSONResponse:
    user = session.exec(select(Usuario).where(Usuario.id == current_user.id)).first()
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    return JSONResponse({
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "papel": user.papel,
        "contexto_padrao": user.contexto_padrao,
    })


# ═══════════════════════════════════════════════════════════
# Auth (Password Recovery)
# ═══════════════════════════════════════════════════════════

class RedefineOwnPasswordRequest(BaseModel):
    current_password: str
    new_password: str


@app.post("/api/auth/redefinir-senha-propria")
def redefinir_senha_propria(
    payload: RedefineOwnPasswordRequest,
    current_user: TokenData = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> JSONResponse:
    user = session.exec(
        select(Usuario).where(Usuario.id == current_user.id)
    ).first()
    if not user:
        raise HTTPException(404, "Usuário não encontrado.")

    try:
        password_ok = bcrypt.checkpw(
            payload.current_password.encode(),
            user.senha_hash.encode()
        )
    except Exception:
        password_ok = False

    if not password_ok:
        raise HTTPException(401, "Senha atual incorreta.")

    new_hash = bcrypt.hashpw(payload.new_password.encode(), bcrypt.gensalt()).decode()
    session.execute(
        text("UPDATE usuarios SET senha_hash = :hash WHERE id = :id"),
        {"hash": new_hash, "id": current_user.id}
    )
    session.commit()
    return JSONResponse({"message": "Senha alterada com sucesso."})


class UpdateUserProfileRequest(BaseModel):
    nome: str


@app.post("/api/auth/profile")
@app.patch("/api/auth/profile")
def atualizar_perfil(
    payload: UpdateUserProfileRequest,
    current_user: TokenData = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> JSONResponse:
    session.execute(
        text("UPDATE usuarios SET nome = :nome WHERE id = :id"),
        {"nome": payload.nome, "id": current_user.id}
    )
    session.commit()
    return JSONResponse({"message": "Perfil atualizado.", "nome": payload.nome})


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
    if not password_reset_limiter.is_allowed(payload.email.lower()):
        raise HTTPException(429, "Muitas tentativas. Aguarde 5 minutos.")

    user = session.exec(
        select(Usuario).where(
            Usuario.email == payload.email.lower(),
            Usuario.ativo == 1
        )
    ).first()

    if not user:
        raise HTTPException(404, "E-mail não encontrado na base de dados.")

    token = secrets.token_hex(4).upper()
    expiry = (datetime.now() + timedelta(hours=1)).isoformat()

    reset_cfg = session.get(Configuracao, "reset_token_data")
    reset_data = {"token": token, "expiry": expiry, "email": user.email}

    if reset_cfg:
        reset_cfg.valor_json = json.dumps(reset_data)
    else:
        reset_cfg = Configuracao(key="reset_token_data", valor_json=json.dumps(reset_data))

    session.add(reset_cfg)
    session.commit()

    base_url = request.headers.get("origin", str(request.base_url).rstrip('/'))
    success = send_password_reset_email(payload.email, token, base_url)

    if success:
        return JSONResponse({"message": "E-mail de recuperação enviado com sucesso."})
    else:
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

    user = session.exec(
        select(Usuario).where(Usuario.email == reset_data["email"])
    ).first()

    if not user:
        raise HTTPException(500, "Usuário não encontrado.")

    new_hash = bcrypt.hashpw(payload.new_password.encode(), bcrypt.gensalt()).decode()

    session.execute(
        text("UPDATE usuarios SET senha_hash = :hash WHERE id = :id"),
        {"hash": new_hash, "id": user.id}
    )
    session.delete(reset_cfg)
    session.commit()

    return JSONResponse({"message": "Senha redefinida com sucesso."})


class EmailChangeRequest(BaseModel):
    new_email: str

class EmailChangeConfirm(BaseModel):
    token: str

@app.post("/api/auth/solicitar-troca-email")
def solicitar_troca_email(
    payload: EmailChangeRequest,
    session: Session = Depends(get_session),
) -> JSONResponse:
    token = secrets.token_hex(4).upper()
    expiry = (datetime.now() + timedelta(hours=1)).isoformat()
    
    cfg = session.get(Configuracao, "email_change_token_data")
    reset_data = {"token": token, "expiry": expiry, "new_email": payload.new_email}
    
    if cfg:
        cfg.valor_json = json.dumps(reset_data)
    else:
        cfg = Configuracao(key="email_change_token_data", valor_json=json.dumps(reset_data))
        
    session.add(cfg)
    session.commit()

    success = send_email_change_code(payload.new_email, token)
    
    if success:
        return JSONResponse({"message": "Código enviado para o novo e-mail."})
    else:
        print(f"DEV MOCK: Token gerado para troca de email: {token}")
        return JSONResponse({"message": "E-mail simulado com sucesso (SMTP não configurado)."})

@app.post("/api/auth/confirmar-troca-email")
def confirmar_troca_email(
    payload: EmailChangeConfirm,
    session: Session = Depends(get_session),
) -> JSONResponse:
    cfg = session.get(Configuracao, "email_change_token_data")
    if not cfg:
        raise HTTPException(400, "Nenhuma solicitação de troca de e-mail encontrada.")
        
    data = json.loads(cfg.valor_json)
    if data.get("token") != payload.token.strip().upper():
        raise HTTPException(400, "Código inválido. Verifique e tente novamente.")
        
    expiry = datetime.fromisoformat(data.get("expiry", "2000-01-01T00:00:00"))
    if datetime.now() > expiry:
        raise HTTPException(400, "O código de verificação expirou. Solicite um novo.")

    auth_cfg = session.get(Configuracao, "auth_settings")
    if not auth_cfg:
        raise HTTPException(500, "Configurações de usuário não encontradas.")
        
    auth_data = json.loads(auth_cfg.valor_json)
    if "user" not in auth_data:
        auth_data["user"] = {}
    auth_data["user"]["email"] = data["new_email"]
    
    auth_cfg.valor_json = json.dumps(auth_data)
    
    session.delete(cfg)
    session.add(auth_cfg)
    session.commit()
    
    return JSONResponse({"message": "E-mail alterado com sucesso.", "new_email": data["new_email"]})

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
