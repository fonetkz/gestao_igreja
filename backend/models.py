"""
Modelos SQLModel para o banco SQLite (Em Português do Brasil).
"""
import re
from typing import Optional
from sqlmodel import Field, SQLModel
from pydantic import field_validator


# ═══════════════════════════════════════════════════════════
# Membros
# ═══════════════════════════════════════════════════════════

class MembroBase(SQLModel):
    nome: str = Field(max_length=120, index=True)
    iniciais: str = Field(max_length=4)
    secao: str = Field(max_length=60, index=True)
    instrumento_voz: str = Field(max_length=60)
    cargo: Optional[str] = Field(default=None, max_length=120)
    status: str = Field(default="Ativo", max_length=20)
    faltas_mes_atual: int = Field(default=0, ge=0)
    data_ultimo_ensaio: Optional[str] = Field(default=None, max_length=10)
    telefone: Optional[str] = Field(default=None, max_length=30)
    data_nascimento: Optional[str] = Field(default=None, max_length=10)

    @field_validator('nome', 'telefone')
    @classmethod
    def sanitize_input(cls, v):
        if v is None or v == '':
            return v
        if isinstance(v, str):
            return v.strip()[:500]
        return v

    @field_validator('nome')
    @classmethod
    def validate_nome(cls, v):
        if not v or not v.strip():
            raise ValueError('Nome não pode estar vazio')
        if len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()

    @field_validator('telefone')
    @classmethod
    def validate_telefone(cls, v):
        if not v or v == '':
            return v
        digits = re.sub(r'\D', '', v)
        if len(digits) < 10 or len(digits) > 11:
            raise ValueError('Telefone deve ter 10 ou 11 dígitos')
        return v


class Membro(MembroBase, table=True):
    __tablename__ = "membros"
    id: Optional[int] = Field(default=None, primary_key=True)


class MembroCreate(MembroBase):
    pass


class MembroRead(MembroBase):
    id: int


class MembroUpdate(SQLModel):
    nome: Optional[str] = None
    iniciais: Optional[str] = None
    secao: Optional[str] = None
    instrumento_voz: Optional[str] = None
    cargo: Optional[str] = None
    status: Optional[str] = None
    faltas_mes_atual: Optional[int] = None
    data_ultimo_ensaio: Optional[str] = None
    telefone: Optional[str] = None
    data_nascimento: Optional[str] = None


# ═══════════════════════════════════════════════════════════
# Hinos
# ═══════════════════════════════════════════════════════════

class HinoBase(SQLModel):
    numero: str = Field(max_length=50, index=True)
    titulo: str = Field(max_length=200, index=True)
    tonalidade: str = Field(default="", max_length=20)
    data_ultima_apresentacao: Optional[str] = Field(default=None, max_length=10)
    observacoes: Optional[str] = Field(default=None)
    secao_hino: Optional[str] = Field(default=None, max_length=40)
    regente: Optional[str] = Field(default=None, max_length=80)
    soloist: Optional[str] = Field(default=None, max_length=120)

    @field_validator('numero', 'titulo')
    @classmethod
    def sanitize_hino(cls, v):
        if v is None:
            return v
        return v.strip() if isinstance(v, str) else v


class Hino(HinoBase, table=True):
    __tablename__ = "hinos"
    id: Optional[int] = Field(default=None, primary_key=True)


class HinoCreate(HinoBase):
    pass


class HinoRead(HinoBase):
    id: int


class HinoUpdate(SQLModel):
    numero: Optional[str] = None
    titulo: Optional[str] = None
    tonalidade: Optional[str] = None
    data_ultima_apresentacao: Optional[str] = None
    observacoes: Optional[str] = None
    secao_hino: Optional[str] = None
    regente: Optional[str] = None
    solista: Optional[str] = None


# ═══════════════════════════════════════════════════════════
# Chamada (Attendance)
# ═══════════════════════════════════════════════════════════

class ChamadaBase(SQLModel):
    data: str = Field(max_length=10, index=True)  # ISO date
    contexto: str = Field(max_length=80)
    registros_json: str = Field(default="[]")


class Chamada(ChamadaBase, table=True):
    __tablename__ = "chamadas"
    id: Optional[int] = Field(default=None, primary_key=True)


class ChamadaCreate(ChamadaBase):
    pass


class ChamadaUpdate(SQLModel):
    data: Optional[str] = None
    contexto: Optional[str] = None
    registros_json: Optional[str] = None


class ChamadaRead(ChamadaBase):
    id: int


# ═══════════════════════════════════════════════════════════
# Programação (Program History)
# ═══════════════════════════════════════════════════════════

class ProgramacaoBase(SQLModel):
    data: str = Field(max_length=10, index=True)
    hinos_json: str = Field(default="[]")  # JSON: lista de IDs dos hinos
    responsavel: str = Field(max_length=120)
    status: str = Field(default="confirmado", max_length=20)  # rascunho | confirmado
    tipo_culto: str = Field(max_length=80)


class Programacao(ProgramacaoBase, table=True):
    __tablename__ = "programacoes"
    id: Optional[int] = Field(default=None, primary_key=True)


class ProgramacaoCreate(ProgramacaoBase):
    pass


class ProgramacaoRead(ProgramacaoBase):
    id: int


class ProgramacaoUpdate(SQLModel):
    data: Optional[str] = None
    hinos_json: Optional[str] = None
    responsavel: Optional[str] = None
    status: Optional[str] = None
    tipo_culto: Optional[str] = None


# ═══════════════════════════════════════════════════════════
# Configurações (Settings KV store)
# ═══════════════════════════════════════════════════════════

from sqlalchemy import Column, String

class Configuracao(SQLModel, table=True):
    __tablename__ = "configuracoes"
    key: str = Field(primary_key=True, max_length=60)
    valor_json: str = Field(default="{}")
