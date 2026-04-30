# Gestão Igreja

Sistema de gestão para igrejas com funcionalidades para controle de membros, programação de hinos, finanças e muito mais.

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.9+
- **Desktop**: Electron (opcional para distribuição)
- **Estado Global**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Radix UI

## 📋 Pré-requisitos

- Node.js >= 18
- Python >= 3.9
- Git
- (Opcional) Para build do Electron: dependências do sistema conforme [electron-build](https://www.electron.build/)

## 🔧 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/saas_gestao_igreja.git
   cd saas_gestao_igreja
   ```

2. Instale as dependências do frontend:
   ```bash
   npm install
   ```

3. Instale as dependências do backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o .env com suas configurações
   ```

## 🛠️ Desenvolvimento

### Iniciar apenas o frontend (para desenvolvimento web)
```bash
npm run dev
```
Acesse http://localhost:5173

### Iniciar apenas o backend
```bash
cd backend
python main.py
# Ou
python run.py
```
API disponível em http://127.0.0.1:8000

### Iniciar ambos (modo desenvolvimento completo)
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
python main.py
```

### Iniciar como aplicação Electron (desktop)
```bash
npm run electron:dev
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Backend
API_HOST=127.0.0.1
API_PORT=8000
SECRET_KEY=sua_chave_secreta_aqui
DATABASE_URL=sqlite:///./orquestra.db

# Frontend (automaticamente injetado pelo Vite)
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

> **Importante**: Variáveis do frontend devem começar com `VITE_` para serem expostas pelo Vite.

## 📦 Scripts Disponíveis

### Frontend
- `npm run dev` - Inicia o servidor de desenvolvimento Vite
- `npm run build` - Faz build para produção
- `npm run preview` - Pré-visualiza o build de produção

### Backend
- `cd backend && python main.py` - Inicia o servidor FastAPI
- `cd backend && python run.py` - Script alternativo de inicialização
- `cd backend && python insert_data.py` - Popula dados iniciais (se necessário)

### Electron
- `npm run electron:dev` - Inicia aplicativo Electron em modo desenvolvimento
- `npm run electron:build` - Cria build do Electron (diretório)
- `npm run electron:build:exe` - Cria executável portátil do Electron

## 🏗️ Build para Produção

### Aplicação Web
```bash
npm run build
```
O output será gerado na pasta `dist/`

### Desktop (Electron)
```bash
# Build apenas os arquivos
npm run electron:build

# Build executável portátil
npm run electron:build:exe
```
Os builds ficarão disponíveis em `release/`

## 📁 Estrutura do Projeto

```
saas_gestao_igreja/
├── .env.example          # Exemplo de variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
├── package.json          # Dependências e scripts do frontend
├── vite.config.js        # Configuração do Vite
├── tailwind.config.js    # Configuração do Tailwind
├── postcss.config.js     # Configuração do PostCSS
├── index.html            # Template HTML principal
├── src/                  # Código fonte do frontend
│   ├── assets/           # Imagens, ícones, etc.
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── store/            # Estado global (Zustand)
│   ├── services/         # Serviços de API
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Funções utilitárias
│   ├── App.jsx           # Componente raiz
│   └── main.jsx          # Entry point
├── backend/              # Código fonte do backend
│   ├── main.py           # Entry point da API FastAPI
│   ├── app.py            # Launcher para desktop (PyWebView/Uvicorn)
│   ├── models.py         # Modelos do banco de dados (SQLModel/SQLAlchemy)
│   ├── database.py       # Configuração da conexão com DB
│   ├── config.py         # Configurações e variáveis de ambiente
│   ├── email_service.py  # Serviço de envio de emails
│   ├── insert_data.py    # Script para popular dados iniciais
│   └── requirements.txt  # Dependências Python
├── electron/             # Código específico do Electron
│   ├── main.js           # Processo principal do Electron
│   └── preload.js        # Script de preload para segurança
├── public/               # Arquivos estáticos públicos
│   └── vite.svg          # Logo do Vite
└── release/              # Output dos builds do Electron (gerado)
```

## 🧠 Decisões de Arquitetura

### Comunicação Frontend-Backend
- Durante desenvolvimento: Vite proxy encaminha `/api/*` para `http://127.0.0.1:8000`
- Em produção: O backend pode ser servido separadamente ou integrado via Electron
- Axios instance configurada em `src/services/api.js` com base URL automática

### Estado Global
- Zustand usado para estado global compartilhado (autenticação, configurações, etc.)
- Cada recurso tem seu próprio store em `src/store/`
- Persistência opcional via middleware do Zustand

### Estilização
- Tailwind CSS para utility-first styling
- Customização em `tailwind.config.js`
- Variáveis de cores e tipografia configuradas
- Componentes Radix UI para elementos acessíveis

## � contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para questões e suporte, abra uma issue no repositório ou entre em contato através dos canais oficiais da comunidade.

---

*Documentação gerada automaticamente. Última atualização: $(date)*