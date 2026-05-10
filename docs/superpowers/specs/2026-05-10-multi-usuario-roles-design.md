# Multi-usuário com Papéis e Permissões — Design Spec

**Data:** 2026-05-10
**Objetivo:** Adicionar suporte a múltiplos usuários com papéis diferenciados (admin e responsavel), controle de visibilidade de justificativas por usuário, bloqueio de edição das Tabelas Auxiliares para não-admins, e correção do "lembrar dados" para guardar apenas o email.

---

## Contexto

O sistema atualmente possui autenticação de usuário único, com credenciais armazenadas na tabela `Configuracao` (KV store) sob a chave `auth_settings`. Não existe controle de acesso por papel. Três pessoas precisam de contas distintas:

- **Elen Márcia** — Regente Geral, precisa ver todas as justificativas e gerenciar as Tabelas Auxiliares
- **Altair** — Regente Suplente, vê apenas justificativas das chamadas que ele criou
- **Alexandre** — Responsável pela Orquestra, vê apenas justificativas das chamadas que ele criou

---

## 1. Modelo de Dados

### 1.1 Nova tabela `usuarios`

```sql
CREATE TABLE usuarios (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      TEXT NOT NULL,
  email     TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  papel     TEXT NOT NULL CHECK (papel IN ('admin', 'responsavel')),
  ativo     INTEGER NOT NULL DEFAULT 1
);
```

### 1.2 Migração da tabela `chamadas`

Adicionar coluna `criado_por_id` (nullable, FK para `usuarios`):

```sql
ALTER TABLE chamadas ADD COLUMN criado_por_id INTEGER REFERENCES usuarios(id);
```

Registros existentes ficam com `criado_por_id = NULL` e são visíveis apenas para admins.

### 1.3 Usuários iniciais

| Nome | Email | Papel | Observação |
|------|-------|-------|------------|
| Elen Márcia | *(email atual lido de `auth_settings`)* | `admin` | Migrado da Configuracao |
| Altair | `altair@ia.com` | `responsavel` | Senha inicial: `altair123` |
| Alexandre | `alexandre@ia.com` | `responsavel` | Senha inicial: `alexandre123` |

A migração da Elen lê o campo `email` e `passwordHash` de `auth_settings` e os insere diretamente na tabela `usuarios`, sem exigir redefinição de senha.

---

## 2. Backend (FastAPI)

### 2.1 Autenticação

- `POST /api/auth/login` passa a consultar a tabela `usuarios` em vez do `Configuracao` KV
- O token JWT retornado inclui os campos: `id`, `nome`, `email`, `papel`
- A função `get_current_user` (dependência de rota) é atualizada para ler o `papel` do token e expô-lo às rotas

### 2.2 Criação de chamada

- `POST /api/chamadas` → extrai o `id` do usuário logado do token e salva em `criado_por_id`

### 2.3 Leitura de chamadas

- `GET /api/chamadas` → filtra por papel:
  - `admin`: retorna todas as chamadas
  - `responsavel`: retorna somente `WHERE criado_por_id = {user_id}`
- Chamadas com `criado_por_id = NULL` (registros antigos) são retornadas apenas para `admin`

### 2.4 Tabelas Auxiliares — proteção de escrita

Os endpoints de mutação das listas de configuração (Tipos de Reunião, Tipos de Hino, Instrumentos, etc.) passam a exigir `papel = 'admin'`. Requisições de `responsavel` retornam `403 Forbidden`.

Endpoints protegidos (PUT/POST/DELETE):
- `/api/config/meetingTypes`
- `/api/config/hymnTypes`
- `/api/config/instruments`
- `/api/config/positions`
- Qualquer outro endpoint de configuração de lista

---

## 3. Frontend

### 3.1 authStore (`src/store/authStore.js`)

- Passa a ler e gravar o campo `papel` no localStorage junto ao token
- Expõe getter `isAdmin` → `papel === 'admin'`
- A função `fetchAuthConfig` é substituída por uma chamada ao novo endpoint multi-usuário
- `updateCredentials` continua funcionando (atualiza email/senha do usuário logado)

### 3.2 Login — "Lembrar dados" (`src/pages/LoginPage.jsx`)

**Comportamento atual:** salva email e senha no localStorage quando marcado.

**Novo comportamento:**
- Checkbox marcado → salva apenas o `email` no localStorage (`gestao_igreja_remembered_email`)
- Checkbox desmarcado → remove o email salvo
- Campo de senha **nunca** é pré-preenchido pelo sistema (o browser pode oferecer autocompletar por conta própria)

### 3.3 SettingsPage — Tabelas Auxiliares

- O item "Tabelas Auxiliares" no menu lateral é ocultado se `!isAdmin`
- Se um `responsavel` acessar a rota diretamente, a seção renderiza vazia ou redireciona para "Meu Perfil"

### 3.4 MembersPage — Justificativas e Chamadas

- Sem mudança de código no frontend para filtragem: o backend já devolve apenas as chamadas pertinentes ao usuário logado
- A criação de chamada não muda visualmente: o `criado_por_id` é atribuído pelo backend via token

---

## 4. Compatibilidade e Segurança

- Chamadas antigas (`criado_por_id = NULL`) ficam visíveis apenas para Elen
- A filtragem é feita no servidor (não no frontend), impedindo contorno via DevTools
- As senhas iniciais de Altair e Alexandre (`altair123`, `alexandre123`) são hashes bcrypt gerados durante a migração
- Após primeiro login, cada usuário pode trocar a própria senha na tela de Segurança

---

## 5. Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `backend/models.py` | Novo modelo `Usuario`, campo `criado_por_id` em `Chamada` |
| `backend/main.py` | Novo endpoint login, dependência `get_current_user` atualizada, filtro em GET/POST chamadas, proteção 403 em config |
| `backend/database.py` | Script de migração: criar tabela, alter chamadas, inserir usuários iniciais |
| `src/store/authStore.js` | Suporte a `papel`, getter `isAdmin`, novo fluxo de login |
| `src/pages/LoginPage.jsx` | "Lembrar dados" guarda apenas email |
| `src/pages/SettingsPage.jsx` | Ocultar "Tabelas Auxiliares" para `responsavel` |

---

## Critérios de aceitação

- [ ] Elen loga com email/senha atuais sem precisar trocar nada
- [ ] Altair e Alexandre logam com `altair@ia.com` / `alexandre@ia.com` e senhas iniciais
- [ ] Altair vê somente justificativas das chamadas que ele criou
- [ ] Alexandre vê somente justificativas das chamadas que ele criou
- [ ] Elen vê justificativas de todos (incluindo registros antigos sem `criado_por_id`)
- [ ] Altair e Alexandre não veem o item "Tabelas Auxiliares" no menu de Configurações
- [ ] Tentativa de editar Tabelas Auxiliares como `responsavel` retorna 403
- [ ] "Lembrar dados" no login guarda apenas o email, campo senha sempre vazio ao reabrir
- [ ] Nenhuma outra tela ou funcionalidade foi alterada
