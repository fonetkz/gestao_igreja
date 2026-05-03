# Design Spec: Tela de Preparação para Impressão de Hinos

**Data:** 2026-05-03  
**Status:** Aprovado pelo usuário  
**Projeto:** saas_gestao_igreja  

---

## 1. Objetivo

Criar uma tela dedicada (`/impressao`) para montar e imprimir a programação de hinos de uma reunião. O usuário arrasta hinos para um canvas A4, organiza por seções editáveis, configura o cabeçalho com imagem/logo e imprime com layout limpo (sem a UI do sistema aparecendo no papel).

---

## 2. Arquitetura

### 2.1 Nova Rota
- **Caminho:** `/impressao`
- **Componente:** `src/pages/HymnPrintPage.jsx`
- **Registro:** `App.jsx` (dentro do grupo de rotas autenticadas existente)

### 2.2 Pontos de Entrada
| Origem | Como acessa | Dados passados |
|--------|-------------|---------------|
| ProgrammingPage → aba "Nova Programação" | Botão "Preparar Impressão" (visível quando `todayProgram.length > 0`) | `navigate('/impressao', { state: { hymns: todayProgram, meta: { data, tipo, responsavel } } })` |
| HistoricoTab → item expandido | Botão "Imprimir" em cada programação | `navigate('/impressao', { state: { hymns: prog.hinos_json, meta: { data: prog.data, tipo: prog.tipo_culto, responsavel: prog.responsavel } } })` |

### 2.3 Fluxo de Dados
```
location.state.hymns (IDs + regentes)
        ↓
hymnsStore.getHymnById()   ← resolve titulo, numero, tonalidade
        ↓
sidebarHymns[]             ← lista na sidebar
        ↓
[drag & drop pelo usuário]
        ↓
canvasSections[]           ← estado local: [{ id, name, hymns[] }]
        ↓
printHTML()                ← gera HTML isolado para impressão
```

### 2.4 Estado Local (HymnPrintPage)
```js
canvasSections: [{ id, name, hymns: [{ ...hymn, showRegente, showNumber, showType }] }]
headerConfig: { imageUrl, title, subtitle, date, location }
templates: []              // carregado do localStorage
```

Nenhum estado novo no Zustand — a página é autocontida.

---

## 3. Layout

### 3.1 Estrutura Visual
```
┌─ Topbar do app (fixo, classe no-print) ───────────────────────────┐
├─ Sidebar (320px fixo) ──┬─ Main Canvas (flex-1, overflow-y-auto) ─┤
│                         │                                          │
│  [← Voltar]             │  [Toolbar: Templates | Salvar Template   │
│  ─────────────          │            | Imprimir]                   │
│                         │                                          │
│  Hinos Disponíveis      │  ┌── A4 Canvas (595px) ───────────────┐  │
│  [busca opcional]       │  │  [Cabeçalho: imagem + campos]      │  │
│                         │  │                                    │  │
│  • card hino (drag)     │  │  [Seção: Nome ✏]                   │  │
│  • card hino (drag)     │  │    card hino | card hino           │  │
│  • card hino (opacity   │  │  [+ Adicionar Seção]               │  │
│    50 se já no canvas)  │  │  [Seção: Nome ✏]                   │  │
│                         │  │    (drop zone vazia)               │  │
│                         │  └────────────────────────────────────┘  │
└─────────────────────────┴──────────────────────────────────────────┘
```

### 3.2 Design System
- Segue 100% o design Apple do projeto: `apple-card`, `btn-apple-primary`, `btn-apple-secondary`, `input-apple`
- Cores: `#007AFF` (primary), `#F5F5F7` (background light), `#1C1C1E` (background dark)
- Ícones: Lucide React exclusivamente
- Dark mode: todas as classes com variante `dark:`
- Border radius: `rounded-xl` (padrão do projeto)

---

## 4. Componentes

Todos os componentes ficam dentro de `HymnPrintPage.jsx` como funções locais (padrão do projeto).

### 4.1 `PrintSidebar`
- Header com botão `← Voltar` (`navigate(-1)`) e título "Hinos da Programação"
- Lista `sidebarHymns` resolvidos do `location.state.hymns`
- Card por hino: `GripVertical` + `#numero` em `#007AFF` + título + badge de tipo
- Hinos já presentes no canvas: `opacity-50` (podem ser arrastados novamente para outra seção)
- `draggable="true"` com `onDragStart` que serializa `{ hymnId, source: 'sidebar' }` via `dataTransfer`

### 4.2 `PrintToolbar`
- Dropdown "Templates" (lista os salvos em localStorage + opção "Novo template")
- Botão "Salvar como Template" → abre `TemplateModal`
- Botão "Imprimir" → chama `handlePrint()`

### 4.3 `PrintCanvas`
- Container com `id="printable-canvas"`, dimensões A4 (595px × 842px)
- Renderiza `PrintHeader` no topo
- Itera `canvasSections` renderizando `PrintSection` por seção
- Botão "Adicionar Seção" no final (apenas fora do modo impressão)

### 4.4 `PrintHeader`
- Campo de URL de imagem + preview do logo (ou placeholder com ícone Church do Lucide)
- Campos `contenteditable` ou `input` inline para: título principal, subtítulo, data, localização
- Estilo editável: sem borda, fundo transparente, `:focus` com anel sutil `ring-1 ring-[#007AFF]/20 rounded`

### 4.5 `PrintSection`
- Nome da seção editável inline (`input` transparente, `font-semibold uppercase tracking-widest text-xs`)
- Drop zone: `min-h-[48px]`, borda `border-2 border-dashed border-[#007AFF]/20`, ativa com `border-[#007AFF]` no dragover
- Lista os hinos da seção como `PrintHymnCard`
- Botão "Remover seção" (aparece no hover, apenas se a seção estiver vazia)

### 4.6 `PrintHymnCard`
- `draggable` para reordenação dentro da seção
- Layout: `#numero` em `#007AFF` + título + badge tipo + regente
- Botões de visibilidade no hover (`opacity-0 group-hover:opacity-100`): toggle regente, toggle número, toggle tipo
- Botão Trash2 para remover do canvas

### 4.7 `TemplateModal`
- Input para nome do template
- Salva `{ id, name, headerConfig, sections: [{ id, name }] }` no localStorage
- Chave: `hymnprint_templates`

---

## 5. Drag & Drop

Implementado com HTML5 nativo (sem bibliotecas externas — padrão do projeto).

### 5.1 Sidebar → Canvas (novo hino)
```
onDragStart (sidebar card): dataTransfer = { type: 'sidebar', hymnId }
onDragOver  (drop zone):    e.preventDefault(), setar visual ativo
onDrop      (drop zone):    adicionar hymn à section
```

### 5.2 Canvas → reordenar dentro da seção
```
onDragStart (canvas card): dataTransfer = { type: 'canvas', hymnId, sectionId, index }
onDragOver  (canvas card): live swap (como já funciona no ProgrammedHymnItem)
onDrop:     confirmar nova ordem
```

### 5.3 Canvas → mover entre seções
```
onDrop (outra seção): remover da seção original, adicionar na nova
```

---

## 6. Sistema de Templates

### 6.1 Estrutura salva no localStorage
```js
{
  id: string,        // UUID gerado no momento de salvar
  name: string,      // ex: "Reunião Normal", "Reunião de Oração"
  headerConfig: {
    imageUrl: string,
    title: string,
    subtitle: string,
  },
  sections: [
    { id: string, name: string }  // apenas nomes de seção, sem hinos
  ]
}
```

### 6.2 Template padrão
No primeiro acesso (localStorage vazio), criar automaticamente:
```js
{ name: "Padrão", headerConfig: { title: "Programação Musical", subtitle: "" }, sections: [{ name: "Abertura" }, { name: "Louvor" }] }
```

### 6.3 Aplicar template
Ao selecionar um template: resetar `canvasSections` para as seções do template (vazias) e atualizar `headerConfig`. Os hinos voltam para a sidebar.

---

## 7. Impressão Isolada

### 7.1 Estratégia principal — `window.open`
```js
function handlePrint() {
  const html = buildPrintHTML(canvasSections, headerConfig)
  const win = window.open('', '_blank', 'width=800,height=600')
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
  win.close()
}
```

`buildPrintHTML()` gera um documento HTML completo com:
- `@import` das fontes (Inter + fonte serifada para versos)
- CSS mínimo (margens A4, tipografia, sem bordas de UI)
- Apenas o cabeçalho + seções + hinos (sem Topbar, Sidebar, botões)
- Respeita as flags de visibilidade (`showRegente`, `showNumber`, `showType`) de cada hino

### 7.2 Fallback — `@media print`
Caso `window.open` seja bloqueado (popup blocker):
```css
@media print {
  body > * { visibility: hidden; }
  #printable-canvas, #printable-canvas * { visibility: visible; }
  #printable-canvas { position: absolute; left: 0; top: 0; }
  .no-print { display: none !important; }
}
```

---

## 8. Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `src/pages/HymnPrintPage.jsx` | **CRIAR** — componente principal + todos os sub-componentes |
| `src/App.jsx` | **EDITAR** — registrar rota `/impressao` |
| `src/pages/ProgrammingPage.jsx` | **EDITAR** — adicionar botão "Preparar Impressão" na ProgramacaoForm |
| `src/components/programming/ImpressaoTab.jsx` | **MANTER** — não altera (é outra funcionalidade, layout de bloco) |
| `src/components/programming/HistoricoTab.jsx` | **EDITAR** — não existe como arquivo separado; está inline na ProgrammingPage — adicionar botão "Imprimir" no item expandido do histórico |

> Nota: `HistoricoTab` está definido inline na `ProgrammingPage.jsx` (não em arquivo separado). A edição será feita diretamente na ProgrammingPage.

---

## 9. Fora de Escopo

- Import/edição de PDF
- Persistência do layout de impressão no banco de dados (backend)
- Impressão multi-página automática (A4 overflow)
- Compartilhamento de templates entre usuários
