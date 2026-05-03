# Hymn Print Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a página `/impressao` — tela dedicada com sidebar de hinos e canvas A4 drag-and-drop para montar e imprimir a programação de hinos com layout limpo.

**Architecture:** Nova rota `/impressao` recebe hymns + meta via `location.state` (navigate from ProgrammingPage). Todos os sub-componentes ficam inline no `HymnPrintPage.jsx` seguindo o padrão do projeto. Templates salvos em `localStorage`. Impressão via `window.open` com HTML isolado, fallback `@media print`.

**Tech Stack:** React 18, React Router v6, Zustand (read-only), Tailwind CSS, Lucide React, HTML5 Drag & Drop API nativo, localStorage.

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `src/App.jsx` | Editar | Registrar rota `/impressao` dentro do `AuthLayout` |
| `src/pages/HymnPrintPage.jsx` | Criar | Página completa: sidebar, canvas, DnD, templates, print |
| `src/pages/ProgrammingPage.jsx` | Editar | Botão "Preparar Impressão" na `ProgramacaoForm` + botão "Imprimir" no `HistoricoTab` inline |

---

## Task 1: Registrar rota `/impressao` no App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Adicionar import e rota**

Abrir `src/App.jsx`. Adicionar import na linha 8 (após `ProgrammingPage`) e a rota dentro do `<Route element={<AuthLayout />}>`:

```jsx
// Adicionar import (linha 8):
import HymnPrintPage from './pages/HymnPrintPage'

// Adicionar rota dentro do grupo AuthLayout (após a rota /programacao):
<Route path="/impressao" element={<HymnPrintPage />} />
```

O arquivo final ficará assim:

```jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './components/layout/AuthLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MembersPage from './pages/MembersPage'
import ProgrammingPage from './pages/ProgrammingPage'
import HymnPrintPage from './pages/HymnPrintPage'
import SettingsPage from './pages/SettingsPage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import Toast from './components/ui/Toast'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/membros" element={<MembersPage />} />
          <Route path="/programacao" element={<ProgrammingPage />} />
          <Route path="/impressao" element={<HymnPrintPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/conta" element={<AccountSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toast />
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Criar arquivo placeholder para não quebrar o build**

Criar `src/pages/HymnPrintPage.jsx` com conteúdo mínimo:

```jsx
import React from 'react'
export default function HymnPrintPage() {
  return <div className="p-8 text-gray-900 dark:text-white">Hymn Print Page — em construção</div>
}
```

- [ ] **Step 3: Verificar que o app compila**

```bash
npm run dev
```

Navegar para `http://localhost:5173/impressao` — deve mostrar "em construção" sem erros no console.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/pages/HymnPrintPage.jsx
git commit -m "feat: register /impressao route and add placeholder page"
```

---

## Task 2: Adicionar botões de entrada em ProgrammingPage.jsx

**Files:**
- Modify: `src/pages/ProgrammingPage.jsx`

- [ ] **Step 1: Adicionar `useNavigate` ao import**

No topo de `src/pages/ProgrammingPage.jsx`, o import do react-router-dom não existe ainda. Adicionar:

```jsx
import { useNavigate } from 'react-router-dom'
```

- [ ] **Step 2: Adicionar `useNavigate` no `ProgramacaoForm`**

Dentro do componente `ProgramacaoForm` (logo após as declarações de store), adicionar:

```jsx
const navigate = useNavigate()
```

- [ ] **Step 3: Adicionar botão "Preparar Impressão" na ProgramacaoForm**

No `ProgramacaoForm`, localizar o bloco de botões no rodapé (o `div` que contém o botão "Salvar Programação"). Adicionar o botão de impressão **antes** do botão de salvar:

```jsx
{/* Localizar este bloco (está em torno da linha 390-410 do ProgramacaoForm): */}
{todayProgram.length > 0 && (
  <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 shrink-0">
    {programacaoEditando && (
      <button
        onClick={onCancelarEdicao || onLimparEdicao}
        disabled={saving}
        className="btn-apple-secondary flex-1 py-3"
      >
        Cancelar Edição
      </button>
    )}
    {/* ADICIONAR este botão antes do botão de salvar: */}
    <button
      onClick={() => navigate('/impressao', {
        state: {
          hymns: todayProgram,
          meta: { data: serviceDate, tipo: serviceType, responsavel }
        }
      })}
      className="btn-apple-secondary flex-1 py-3 flex items-center justify-center gap-2"
    >
      <Printer size={18} />
      Preparar Impressão
    </button>
    <button onClick={handleConfirm} disabled={saving || saved} className="btn-apple-primary flex-1 py-3 flex items-center justify-center gap-2">
      {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : saved ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> {programacaoEditando ? 'Salvar Alterações' : 'Salvar Programação'}</>}
    </button>
  </div>
)}
```

Também adicionar `Printer` ao import do lucide-react no topo do arquivo (já tem outros ícones):

```jsx
import { Plus, Search, Music, Trash2, Save, Check, BookOpen, ChevronUp, ChevronDown, GripVertical, Clock, Calendar, Loader2, Edit2, AlertTriangle, X, Printer } from 'lucide-react'
```

- [ ] **Step 4: Adicionar `useNavigate` e botão "Imprimir" no `HistoricoTab`**

O componente `HistoricoTab` está definido inline na `ProgrammingPage.jsx`. Dentro da função `HistoricoTab`, adicionar `useNavigate`:

```jsx
function HistoricoTab({ onEditarProgramacao, onExcluirProgramacao }) {
  // ... stores existentes ...
  const navigate = useNavigate()   // ← ADICIONAR esta linha
  // ... resto do código ...
```

No `HistoricoTab`, localizar os botões de Editar/Excluir no item expandido (dentro do `isExpanded` block). Adicionar botão "Imprimir" ao lado de "Editar":

```jsx
{/* Localizar este div com os botões (após a listagem dos hinos no expanded): */}
<div className="flex flex-col sm:flex-row items-center gap-2 mt-4 pt-2">
  <button onClick={() => handleEditar(prog)} className="w-full sm:flex-1 py-2 text-sm font-medium text-[#007AFF] border border-dashed border-[#007AFF]/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2">
    <Edit2 size={16} /> Editar
  </button>
  {/* ADICIONAR este botão: */}
  <button
    onClick={() => navigate('/impressao', {
      state: {
        hymns: Array.isArray(prog.hinos_json) ? prog.hinos_json : [],
        meta: { data: prog.data, tipo: prog.tipo_culto || prog.contexto, responsavel: prog.responsavel }
      }
    })}
    className="w-full sm:flex-1 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border border-dashed border-purple-300/30 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors flex items-center justify-center gap-2"
  >
    <Printer size={16} /> Imprimir
  </button>
  <button onClick={() => handleExcluir(prog.id)} className="w-full sm:flex-1 py-2 text-sm font-medium text-red-500 border border-dashed border-red-300/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2">
    <Trash2 size={16} /> Excluir
  </button>
</div>
```

- [ ] **Step 5: Verificar manualmente**

```bash
npm run dev
```

1. Ir para `/programacao` → aba "Nova Programação" → adicionar pelo menos 1 hino
2. Verificar que botão "Preparar Impressão" aparece no rodapé
3. Clicar no botão → deve navegar para `/impressao`
4. Ir para aba "Histórico" → expandir uma programação → verificar botão "Imprimir" aparece

- [ ] **Step 6: Commit**

```bash
git add src/pages/ProgrammingPage.jsx
git commit -m "feat: add navigation entry points to /impressao from ProgramacaoForm and HistoricoTab"
```

---

## Task 3: HymnPrintPage — estrutura, utilitários e estado

**Files:**
- Create: `src/pages/HymnPrintPage.jsx`

- [ ] **Step 1: Substituir o placeholder pelo componente completo com estrutura e utilitários**

Substituir o conteúdo de `src/pages/HymnPrintPage.jsx` com:

```jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, GripVertical, Trash2, Printer, Save,
  ChevronDown, Plus, Church, X, Check, Hash, Tag, User
} from 'lucide-react'
import useHymnsStore from '../store/hymnsStore'
import useAuthStore from '../store/authStore'
import Topbar from '../components/layout/Topbar'

// ─── Constants ───────────────────────────────────────────────────────────────

const TEMPLATES_KEY = 'hymnprint_templates'

// ─── Utilities ───────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

function loadTemplatesLS() {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]') }
  catch { return [] }
}

function saveTemplatesLS(templates) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  if (dateStr.includes('/')) return dateStr
  try {
    const [y, m, d] = dateStr.split('T')[0].split('-')
    return `${d}/${m}/${y}`
  } catch { return dateStr }
}

const DEFAULT_SECTIONS = [
  { id: 'sec-abertura', name: 'Abertura' },
  { id: 'sec-louvor', name: 'Louvor' },
]

// ─── buildPrintHTML ───────────────────────────────────────────────────────────

function buildPrintHTML(canvasSections, headerConfig) {
  const sectionsHTML = canvasSections
    .filter(s => s.hymns.length > 0)
    .map(section => {
      const hymnsHTML = section.hymns.map(hymn => `
        <div class="hymn-row">
          ${hymn.showNumber ? `<span class="hymn-num">#${hymn.numero}</span>` : ''}
          <span class="hymn-title">${hymn.titulo || ''}</span>
          ${hymn.showType && hymn.tonalidade ? `<span class="hymn-badge">${hymn.tonalidade}</span>` : ''}
          ${hymn.showRegente && hymn.regente ? `<span class="hymn-regent">Reg: ${hymn.regente}</span>` : ''}
        </div>`).join('')
      return `
        <div class="section">
          <h3 class="section-title">${section.name}</h3>
          <div class="section-hymns">${hymnsHTML}</div>
        </div>`
    }).join('')

  const headerHTML = `
    <div class="doc-header">
      ${headerConfig.imageUrl ? `<img src="${headerConfig.imageUrl}" class="header-logo" alt="Logo" />` : ''}
      <h1 class="header-title">${headerConfig.title || ''}</h1>
      ${headerConfig.subtitle ? `<p class="header-subtitle">${headerConfig.subtitle}</p>` : ''}
      ${headerConfig.date ? `<p class="header-date">${headerConfig.date}</p>` : ''}
      ${headerConfig.location ? `<p class="header-location">${headerConfig.location}</p>` : ''}
    </div>`

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <title>Programação de Hinos</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; padding: 15mm; color: #111827; }
    .doc-header { text-align: center; padding-bottom: 16px; margin-bottom: 24px; border-bottom: 2px solid #1a2b42; }
    .header-logo { max-height: 80px; max-width: 200px; object-fit: contain; margin: 0 auto 12px; display: block; }
    .header-title { font-size: 20px; font-weight: 800; color: #1a2b42; letter-spacing: 0.5px; margin-bottom: 4px; }
    .header-subtitle { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2px; }
    .header-date, .header-location { font-size: 11px; color: #64748b; margin-top: 2px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #374860; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
    .hymn-row { display: flex; align-items: baseline; gap: 8px; padding: 5px 0; border-bottom: 1px solid #f8fafc; }
    .hymn-num { font-size: 11px; font-weight: 700; color: #007AFF; min-width: 40px; }
    .hymn-title { font-size: 13px; font-weight: 600; color: #0f172a; flex: 1; }
    .hymn-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
    .hymn-regent { font-size: 10px; color: #94a3b8; white-space: nowrap; }
    @media print { @page { margin: 0; } body { padding: 15mm; } }
  </style>
</head>
<body>
  ${headerHTML}
  ${sectionsHTML}
</body>
</html>`
}

// ─── Placeholder para os sub-componentes (Tasks 4-7) ─────────────────────────

function PrintSidebar() { return <aside className="w-80 shrink-0 fixed left-0 top-16 bottom-0 bg-[#F5F5F7] dark:bg-[#1C1C1E] border-r border-gray-200 dark:border-gray-700 z-30 p-4"><p className="text-xs text-gray-400">Sidebar</p></aside> }
function PrintToolbar() { return <div className="mb-6 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /> }
function PrintHeader() { return <div className="h-32 bg-gray-50 dark:bg-gray-800/30 rounded-xl mb-4 animate-pulse" /> }
function PrintSection() { return <div className="h-20 bg-gray-50 dark:bg-gray-800/30 rounded-xl mb-2 animate-pulse" /> }
function TemplateModal() { return null }

// ─── HymnPrintPage ────────────────────────────────────────────────────────────

export default function HymnPrintPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const getHymnById = useHymnsStore(s => s.getHymnById)
  const hymns = useHymnsStore(s => s.hymns)
  const user = useAuthStore(s => s.user)

  // Resolve sidebar hymns from location.state
  const sidebarHymns = useMemo(() => {
    if (!state?.hymns) return []
    return state.hymns.map(item => {
      const id = typeof item === 'object' ? item.id : item
      const regente = typeof item === 'object' ? item.regente : ''
      const hymn = getHymnById(id)
      if (!hymn) return null
      return { ...hymn, regente }
    }).filter(Boolean)
  }, [state?.hymns, hymns])

  // Templates
  const [templates, setTemplates] = useState(() => {
    const stored = loadTemplatesLS()
    if (stored.length === 0) {
      const def = {
        id: 'default',
        name: 'Padrão',
        headerConfig: { imageUrl: '', title: 'Programação Musical', subtitle: '' },
        sections: DEFAULT_SECTIONS,
      }
      saveTemplatesLS([def])
      return [def]
    }
    return stored
  })
  const [activeTemplateId, setActiveTemplateId] = useState(() => templates[0]?.id)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)

  // Canvas state
  const [headerConfig, setHeaderConfig] = useState({
    imageUrl: '',
    title: user?.churchName || 'Programação Musical',
    subtitle: state?.meta?.tipo || '',
    date: formatDateDisplay(state?.meta?.data || ''),
    location: '',
  })

  const [canvasSections, setCanvasSections] = useState(() =>
    DEFAULT_SECTIONS.map(s => ({ ...s, id: genId(), hymns: [] }))
  )

  // DnD ref
  const dragItem = useRef(null)
  const [dragOver, setDragOver] = useState(null)

  // Print @media fallback
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'hymnprint-media'
    style.textContent = `
      @media print {
        body > *:not(#hymnprint-root) { visibility: hidden !important; }
        #printable-canvas, #printable-canvas * { visibility: visible !important; }
        #printable-canvas { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; box-shadow: none !important; border: none !important; }
      }
    `
    document.head.appendChild(style)
    return () => document.getElementById('hymnprint-media')?.remove()
  }, [])

  const handleHeaderChange = (field, value) =>
    setHeaderConfig(prev => ({ ...prev, [field]: value }))

  const handleAddSection = () =>
    setCanvasSections(prev => [...prev, { id: genId(), name: 'Nova Seção', hymns: [] }])

  const handleRemoveSection = (sectionId) =>
    setCanvasSections(prev => prev.filter(s => s.id !== sectionId))

  const handleRenameSection = (sectionId, name) =>
    setCanvasSections(prev => prev.map(s => s.id === sectionId ? { ...s, name } : s))

  const handleHymnRemove = (sectionId, hymnId) =>
    setCanvasSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, hymns: s.hymns.filter(h => h.id !== hymnId) } : s
    ))

  const handleToggleVisibility = (sectionId, hymnId, field) =>
    setCanvasSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, hymns: s.hymns.map(h => h.id === hymnId ? { ...h, [field]: !h[field] } : h) }
        : s
    ))

  // DnD handlers (wired in Task 5)
  const dragItem_ = dragItem
  const handleDragStart = useCallback((e, item) => {
    dragItem_.current = item
    e.dataTransfer.effectAllowed = item.type === 'sidebar' ? 'copy' : 'move'
    if (item.type === 'canvas') setTimeout(() => e.target.classList.add('opacity-40'), 0)
  }, [])

  const handleSectionDragOver = useCallback((e, sectionId) => {
    e.preventDefault()
    setDragOver(sectionId)
  }, [])

  const handleSectionDragLeave = useCallback(() => setDragOver(null), [])

  const handleSectionDrop = useCallback((e, targetSectionId) => {
    e.preventDefault()
    setDragOver(null)
    const item = dragItem_.current
    if (!item) return
    if (item.type === 'sidebar') {
      const hymn = sidebarHymns.find(h => h.id === item.hymnId)
      if (!hymn) return
      setCanvasSections(prev => prev.map(s =>
        s.id === targetSectionId
          ? { ...s, hymns: [...s.hymns, { ...hymn, showRegente: true, showNumber: true, showType: true }] }
          : s
      ))
    } else if (item.type === 'canvas' && item.sectionId !== targetSectionId) {
      setCanvasSections(prev => {
        const src = prev.find(s => s.id === item.sectionId)
        const moving = src?.hymns[item.index]
        if (!moving) return prev
        return prev.map(s => {
          if (s.id === item.sectionId) return { ...s, hymns: s.hymns.filter((_, i) => i !== item.index) }
          if (s.id === targetSectionId) return { ...s, hymns: [...s.hymns, moving] }
          return s
        })
      })
    }
    dragItem_.current = null
  }, [sidebarHymns])

  const handleCardDragStart = useCallback((e, item) => {
    dragItem_.current = item
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => e.target.classList.add('opacity-40'), 0)
  }, [])

  const handleCardDragOver = useCallback((e, sectionId, index) => {
    e.preventDefault()
    const item = dragItem_.current
    if (!item || item.type !== 'canvas' || item.sectionId !== sectionId || item.index === index) return
    setCanvasSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s
      const arr = [...s.hymns]
      const [moved] = arr.splice(item.index, 1)
      arr.splice(index, 0, moved)
      return { ...s, hymns: arr }
    }))
    dragItem_.current = { ...item, index }
  }, [])

  const handleCardDragEnd = useCallback((e) => {
    e.target.classList.remove('opacity-40')
    dragItem_.current = null
    setDragOver(null)
  }, [])

  // Templates
  const handleSelectTemplate = (template) => {
    setActiveTemplateId(template.id)
    setHeaderConfig(prev => ({ ...prev, ...template.headerConfig }))
    setCanvasSections(template.sections.map(s => ({ ...s, id: genId(), hymns: [] })))
  }

  const handleSaveTemplate = (name) => {
    const tpl = {
      id: genId(),
      name,
      headerConfig: { imageUrl: headerConfig.imageUrl, title: headerConfig.title, subtitle: headerConfig.subtitle },
      sections: canvasSections.map(s => ({ id: s.id, name: s.name })),
    }
    const updated = [...templates, tpl]
    setTemplates(updated)
    saveTemplatesLS(updated)
    setActiveTemplateId(tpl.id)
    setTemplateModalOpen(false)
  }

  // Print
  const handlePrint = () => {
    const html = buildPrintHTML(canvasSections, headerConfig)
    const win = window.open('', '_blank', 'width=800,height=900')
    if (!win) { window.print(); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 250)
  }

  return (
    <div id="hymnprint-root" className="min-h-screen bg-[#F5F5F7] dark:bg-[#1C1C1E]">
      <Topbar title="Gestão Igreja" />

      <PrintSidebar
        sidebarHymns={sidebarHymns}
        canvasSections={canvasSections}
        onDragStart={handleDragStart}
        onBack={() => navigate(-1)}
      />

      <main className="ml-80 pt-16 min-h-screen flex flex-col">
        <div className="px-8 py-8 flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Preparação para Impressão</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {state?.meta?.tipo && <span>{state.meta.tipo}</span>}
              {state?.meta?.data && <span> • {formatDateDisplay(state.meta.data)}</span>}
            </p>
          </div>

          <PrintToolbar
            templates={templates}
            activeTemplateId={activeTemplateId}
            onSelectTemplate={handleSelectTemplate}
            onSaveTemplate={() => setTemplateModalOpen(true)}
            onPrint={handlePrint}
          />

          <div className="flex justify-center pb-10">
            <div
              id="printable-canvas"
              className="bg-white dark:bg-white shadow-2xl shadow-gray-900/10 border border-gray-200"
              style={{ width: '595px', minHeight: '842px', padding: '48px 52px' }}
            >
              <PrintHeader headerConfig={headerConfig} onChange={handleHeaderChange} />

              <div className="space-y-3">
                {canvasSections.map(section => (
                  <PrintSection
                    key={section.id}
                    section={section}
                    canvasSections={canvasSections}
                    dragOver={dragOver}
                    onRenameSection={handleRenameSection}
                    onRemoveSection={handleRemoveSection}
                    onDrop={handleSectionDrop}
                    onDragOver={handleSectionDragOver}
                    onDragLeave={handleSectionDragLeave}
                    onHymnRemove={handleHymnRemove}
                    onToggleVisibility={handleToggleVisibility}
                    onCardDragStart={handleCardDragStart}
                    onCardDragOver={handleCardDragOver}
                    onCardDragEnd={handleCardDragEnd}
                  />
                ))}
              </div>

              <button
                onClick={handleAddSection}
                className="w-full mt-4 py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-300 hover:text-gray-500 hover:border-gray-300 hover:bg-gray-50/50 transition-all flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest"
              >
                <Plus size={14} />
                Adicionar Seção
              </button>
            </div>
          </div>
        </div>
      </main>

      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npm run dev
```

Navegar para `/impressao` — deve mostrar a estrutura básica (sidebar placeholder, toolbar placeholder, canvas branco).

- [ ] **Step 3: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: add HymnPrintPage skeleton with state, DnD handlers and print logic"
```

---

## Task 4: Implementar PrintSidebar

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — substituir a função `PrintSidebar` placeholder

- [ ] **Step 1: Substituir o placeholder `PrintSidebar`**

Localizar `function PrintSidebar() { return <aside...` e substituir pela implementação completa:

```jsx
function PrintSidebar({ sidebarHymns, canvasSections, onDragStart, onBack }) {
  const hymnIdsInCanvas = canvasSections.flatMap(s => s.hymns.map(h => h.id))

  return (
    <aside className="w-80 shrink-0 fixed left-0 top-16 bottom-0 flex flex-col bg-[#F5F5F7] dark:bg-[#1C1C1E] border-r border-gray-200/80 dark:border-gray-700/80 z-30">
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#007AFF] text-sm font-medium mb-3 hover:opacity-75 transition-opacity"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Hinos da Programação</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Arraste para as seções do canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {sidebarHymns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Church size={24} className="text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Nenhum hino na programação.
              <br />Volte e adicione hinos primeiro.
            </p>
          </div>
        )}
        {sidebarHymns.map(hymn => {
          const inCanvas = hymnIdsInCanvas.includes(hymn.id)
          return (
            <div
              key={hymn.id}
              draggable
              onDragStart={e => onDragStart(e, { type: 'sidebar', hymnId: hymn.id })}
              className={`group flex items-center gap-2.5 p-3 bg-white dark:bg-[#2C2C2E] rounded-xl border border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#007AFF]/30 transition-all select-none ${inCanvas ? 'opacity-50' : ''}`}
            >
              <GripVertical size={14} className="text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  <span className="text-[#007AFF]">#{hymn.numero}</span>
                  {' '}{hymn.titulo}
                </p>
                {hymn.tonalidade && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{hymn.tonalidade}</p>
                )}
              </div>
              {inCanvas && (
                <Check size={12} className="text-[#007AFF] shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          {sidebarHymns.length} hino{sidebarHymns.length !== 1 ? 's' : ''} disponíve{sidebarHymns.length !== 1 ? 'is' : 'l'}
        </p>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verificar manualmente**

Navegar para `/impressao` via botão da ProgrammingPage. A sidebar deve mostrar os hinos da programação atual com cards arrastáveis.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: implement PrintSidebar with hymn list and drag handles"
```

---

## Task 5: Implementar PrintHeader, PrintSection e PrintHymnCard

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — substituir os placeholders `PrintHeader`, `PrintSection`

- [ ] **Step 1: Substituir o placeholder `PrintHeader`**

```jsx
function PrintHeader({ headerConfig, onChange }) {
  return (
    <div className="text-center pb-5 mb-6" style={{ borderBottom: '2px solid #1a2b42' }}>
      <div className="relative w-32 h-16 mx-auto mb-3 group">
        {headerConfig.imageUrl ? (
          <img
            src={headerConfig.imageUrl}
            alt="Logo"
            className="w-full h-full object-contain"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <Church size={24} className="text-gray-300" />
          </div>
        )}
      </div>

      <div className="mb-2">
        <input
          type="text"
          placeholder="URL da imagem / logo"
          value={headerConfig.imageUrl}
          onChange={e => onChange('imageUrl', e.target.value)}
          className="w-full max-w-xs text-[10px] text-center text-gray-400 bg-transparent border-b border-gray-100 focus:outline-none focus:border-[#007AFF] transition-colors placeholder:text-gray-200 pb-0.5"
        />
      </div>

      <input
        type="text"
        value={headerConfig.title}
        onChange={e => onChange('title', e.target.value)}
        placeholder="Título principal"
        className="text-xl font-extrabold text-[#1a2b42] text-center bg-transparent w-full focus:outline-none hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors px-2 py-0.5"
        style={{ letterSpacing: '0.5px' }}
      />
      <input
        type="text"
        value={headerConfig.subtitle}
        onChange={e => onChange('subtitle', e.target.value)}
        placeholder="Subtítulo (tipo de reunião)"
        className="text-xs font-semibold text-gray-500 uppercase text-center bg-transparent w-full focus:outline-none hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-1 px-2 py-0.5"
        style={{ letterSpacing: '2px' }}
      />
      <input
        type="text"
        value={headerConfig.date}
        onChange={e => onChange('date', e.target.value)}
        placeholder="Data"
        className="text-xs text-gray-400 text-center bg-transparent w-full focus:outline-none hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-0.5 px-2 py-0.5"
      />
      <input
        type="text"
        value={headerConfig.location}
        onChange={e => onChange('location', e.target.value)}
        placeholder="Localização"
        className="text-xs text-gray-400 text-center bg-transparent w-full focus:outline-none hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-0.5 px-2 py-0.5"
      />
    </div>
  )
}
```

- [ ] **Step 2: Adicionar `PrintHymnCard` (nova função — inserir antes de `PrintSection`)**

```jsx
function PrintHymnCard({ hymn, sectionId, index, onRemove, onToggleVisibility, onDragStart, onDragOver, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, { type: 'canvas', hymnId: hymn.id, sectionId, index })}
      onDragOver={e => onDragOver(e, sectionId, index)}
      onDragEnd={onDragEnd}
      className="group flex items-start gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm hover:border-[#007AFF]/20 transition-all cursor-grab active:cursor-grabbing select-none"
    >
      <GripVertical size={13} className="text-gray-300 mt-0.5 shrink-0 group-hover:text-gray-400" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {hymn.showNumber && (
            <span className="text-[#007AFF] font-bold text-xs">#{hymn.numero}</span>
          )}
          <span className="font-semibold text-gray-900 text-xs">{hymn.titulo}</span>
          {hymn.showType && hymn.tonalidade && (
            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500 font-bold uppercase tracking-tight">
              {hymn.tonalidade}
            </span>
          )}
        </div>
        {hymn.showRegente && hymn.regente && (
          <p className="text-[10px] text-[#007AFF] font-medium mt-0.5">Reg: {hymn.regente}</p>
        )}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onToggleVisibility(sectionId, hymn.id, 'showRegente')}
          title="Mostrar/ocultar regente"
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${hymn.showRegente ? 'text-[#007AFF] bg-blue-50' : 'text-gray-300 hover:text-gray-500'}`}
        >
          <User size={11} />
        </button>
        <button
          onClick={() => onToggleVisibility(sectionId, hymn.id, 'showNumber')}
          title="Mostrar/ocultar número"
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${hymn.showNumber ? 'text-[#007AFF] bg-blue-50' : 'text-gray-300 hover:text-gray-500'}`}
        >
          <Hash size={11} />
        </button>
        <button
          onClick={() => onToggleVisibility(sectionId, hymn.id, 'showType')}
          title="Mostrar/ocultar tipo"
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${hymn.showType ? 'text-[#007AFF] bg-blue-50' : 'text-gray-300 hover:text-gray-500'}`}
        >
          <Tag size={11} />
        </button>
        <button
          onClick={() => onRemove(sectionId, hymn.id)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Substituir o placeholder `PrintSection`**

```jsx
function PrintSection({
  section, canvasSections, dragOver,
  onRenameSection, onRemoveSection,
  onDrop, onDragOver, onDragLeave,
  onHymnRemove, onToggleVisibility,
  onCardDragStart, onCardDragOver, onCardDragEnd
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(section.name)
  const inputRef = useRef(null)
  const isOver = dragOver === section.id

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = () => {
    const trimmed = name.trim()
    if (trimmed) onRenameSection(section.id, trimmed)
    else setName(section.name)
    setEditing(false)
  }

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1.5 group/header">
        <div className="w-1 h-3.5 bg-[#007AFF]/40 rounded-full shrink-0" />
        {editing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') { setName(section.name); setEditing(false) }
            }}
            className="text-[11px] font-bold uppercase tracking-widest text-gray-700 bg-transparent border-b border-[#007AFF] focus:outline-none w-40 pb-0.5"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-[#007AFF] transition-colors flex items-center gap-1.5"
          >
            {section.name}
            <span className="text-[9px] normal-case tracking-normal font-normal text-gray-300 opacity-0 group-hover/header:opacity-100 transition-opacity">editar</span>
          </button>
        )}
        {section.hymns.length === 0 && canvasSections.length > 1 && (
          <button
            onClick={() => onRemoveSection(section.id)}
            className="ml-auto opacity-0 group-hover/header:opacity-100 w-5 h-5 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
          >
            <X size={11} />
          </button>
        )}
      </div>

      <div
        onDragOver={e => onDragOver(e, section.id)}
        onDragLeave={onDragLeave}
        onDrop={e => onDrop(e, section.id)}
        className={`min-h-[52px] rounded-xl border-2 border-dashed transition-all flex flex-col gap-1.5 p-1.5 ${
          isOver
            ? 'border-[#007AFF] bg-blue-50/60'
            : 'border-gray-100 hover:border-gray-200'
        }`}
      >
        {section.hymns.length === 0 && (
          <p className="text-[10px] text-gray-300 text-center py-2.5 pointer-events-none select-none">
            Arraste hinos aqui
          </p>
        )}
        {section.hymns.map((hymn, index) => (
          <PrintHymnCard
            key={`${hymn.id}-${index}`}
            hymn={hymn}
            sectionId={section.id}
            index={index}
            onRemove={onHymnRemove}
            onToggleVisibility={onToggleVisibility}
            onDragStart={onCardDragStart}
            onDragOver={onCardDragOver}
            onDragEnd={onCardDragEnd}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar manualmente**

1. Navegar para `/impressao` com hinos na programação
2. Canvas deve mostrar cabeçalho editável (clicar nos campos e editar)
3. Seções "Abertura" e "Louvor" devem aparecer com drop zones
4. Clicar no nome da seção → deve abrir input inline para edição

- [ ] **Step 5: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: implement PrintHeader, PrintSection and PrintHymnCard components"
```

---

## Task 6: Implementar PrintToolbar e TemplateModal

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` — substituir placeholders `PrintToolbar` e `TemplateModal`

- [ ] **Step 1: Substituir o placeholder `TemplateModal`**

```jsx
function TemplateModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('')
  if (!isOpen) return null

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim())
    setName('')
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Salvar como Template</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Salva a estrutura de seções e cabeçalho (sem hinos) para reutilizar depois.
        </p>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          placeholder="Ex: Reunião Normal, Reunião de Oração..."
          className="input-apple w-full mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-apple-secondary flex-1">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn-apple-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Substituir o placeholder `PrintToolbar`**

```jsx
function PrintToolbar({ templates, activeTemplateId, onSelectTemplate, onSaveTemplate, onPrint }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const activeTemplate = templates.find(t => t.id === activeTemplateId)

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Templates dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm"
        >
          <LayoutTemplate size={14} className="text-gray-400" />
          <span>{activeTemplate?.name || 'Template'}</span>
          <ChevronDown size={13} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-[#2C2C2E] rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Templates</p>
              </div>
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => { onSelectTemplate(t); setDropdownOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                    t.id === activeTemplateId
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-[#007AFF] font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {t.name}
                  {t.id === activeTemplateId && <Check size={13} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onSaveTemplate}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm"
      >
        <Save size={14} />
        Salvar Template
      </button>

      <div className="flex-1" />

      <button
        onClick={onPrint}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#007AFF] text-white rounded-xl hover:bg-[#0062CC] active:scale-95 transition-all shadow-md shadow-[#007AFF]/25"
      >
        <Printer size={15} />
        Imprimir
      </button>
    </div>
  )
}
```

Também adicionar `LayoutTemplate` ao import do Lucide no topo do arquivo:

```jsx
import {
  ArrowLeft, GripVertical, Trash2, Printer, Save,
  ChevronDown, Plus, Church, X, Check, Hash, Tag, User, LayoutTemplate
} from 'lucide-react'
```

- [ ] **Step 3: Verificar manualmente**

1. Abrir `/impressao`
2. Toolbar deve mostrar dropdown de templates (apenas "Padrão" inicialmente)
3. Clicar "Salvar Template" → modal abre, digitar nome, confirmar → template aparece no dropdown
4. Selecionar template → seções do canvas resetam para as do template

- [ ] **Step 4: Commit**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "feat: implement PrintToolbar with templates dropdown and TemplateModal"
```

---

## Task 7: Verificar Drag & Drop e funcionalidade completa

O DnD já está implementado no `HymnPrintPage` (Task 3). Esta task garante que tudo funciona corretamente de ponta a ponta.

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` (apenas se forem encontrados bugs)

- [ ] **Step 1: Testar drag da sidebar para o canvas**

1. Ir para `/programacao`, adicionar 3 hinos à programação
2. Clicar "Preparar Impressão"
3. Arrastar um hino da sidebar para a drop zone "Abertura"
4. **Esperado:** Hino aparece como card na seção "Abertura", ícone de check aparece no item da sidebar

- [ ] **Step 2: Testar reordenação dentro de uma seção**

1. Arrastar 2+ hinos para a mesma seção
2. Arrastar um card de hino para cima/baixo dentro da seção
3. **Esperado:** Ordem muda em tempo real enquanto arrasta (live swap)

- [ ] **Step 3: Testar mover hino entre seções**

1. Arrastar um card de hino de "Abertura" para a drop zone "Louvor"
2. **Esperado:** Hino sai de "Abertura" e aparece em "Louvor"

- [ ] **Step 4: Testar controles de visibilidade**

1. Passar o mouse sobre um card de hino
2. Clicar nos ícones de User/Hash/Tag
3. **Esperado:** Cada campo (regente, número, tipo) some/aparece no card

- [ ] **Step 5: Testar remoção**

1. Passar o mouse sobre um card → clicar Trash2 → hino removido da seção
2. Seção vazia com `canvasSections.length > 1` → botão X aparece no header da seção → clicar → seção removida

- [ ] **Step 6: Testar adição de seção**

1. Clicar "Adicionar Seção" no final do canvas
2. **Esperado:** Nova seção "Nova Seção" aparece com drop zone
3. Clicar no nome → input inline → digitar novo nome → Enter → nome atualizado

- [ ] **Step 7: Commit (se houver ajustes)**

```bash
git add src/pages/HymnPrintPage.jsx
git commit -m "fix: adjust DnD behavior after manual testing"
```

---

## Task 8: Verificar impressão e commit final

**Files:**
- Modify: `src/pages/HymnPrintPage.jsx` (apenas se necessário)

- [ ] **Step 1: Testar impressão via window.open**

1. Montar uma programação completa no canvas (cabeçalho preenchido, 2+ seções com hinos)
2. Clicar "Imprimir"
3. **Esperado:** Nova janela abre com HTML limpo (sem Topbar, sidebar, botões) e diálogo de impressão do sistema abre automaticamente
4. Verificar que as flags de visibilidade são respeitadas (hino sem regente não mostra "Reg:")

- [ ] **Step 2: Testar fallback @media print**

Em um navegador com popup blocker ativado (ou desabilitar `window.open` temporariamente), clicar Imprimir.
**Esperado:** `window.print()` é chamado e apenas o `#printable-canvas` fica visível na impressão (o `@media print` CSS adicionado via `useEffect` garante isso).

- [ ] **Step 3: Testar entrada pelo Histórico**

1. Ir para `/programacao` → aba "Histórico"
2. Expandir uma programação salva
3. Clicar "Imprimir"
4. **Esperado:** Navega para `/impressao` com os hinos daquela programação na sidebar, meta (data, tipo) no subtítulo da página

- [ ] **Step 4: Commit final**

```bash
git add src/pages/HymnPrintPage.jsx src/pages/ProgrammingPage.jsx src/App.jsx
git commit -m "feat: complete hymn print preparation page with DnD, templates and isolated print"
```

---

## Self-Review

**Spec coverage checklist:**
- [x] Rota `/impressao` → Task 1
- [x] Botão "Preparar Impressão" em ProgramacaoForm → Task 2
- [x] Botão "Imprimir" no HistoricoTab → Task 2
- [x] Sidebar com hinos da programação + drag handles → Task 4
- [x] Canvas A4 (595×842px) → Task 3 (HymnPrintPage render)
- [x] PrintHeader com logo/URL + campos editáveis → Task 5
- [x] PrintSection com nome editável inline + drop zone → Task 5
- [x] PrintHymnCard com visibility toggles → Task 5
- [x] Drag sidebar→seção → Task 3 (handleSectionDrop) + Task 7 (verificação)
- [x] Reordenar dentro de seção → Task 3 (handleCardDragOver) + Task 7
- [x] Mover entre seções → Task 3 (handleSectionDrop) + Task 7
- [x] Adicionar/remover seção → Task 3 (handleAddSection/handleRemoveSection)
- [x] Templates em localStorage → Task 6 (PrintToolbar + TemplateModal)
- [x] Template padrão no primeiro acesso → Task 3 (useState initializer)
- [x] Selecionar template reseta seções → Task 3 (handleSelectTemplate)
- [x] Impressão via window.open com HTML isolado → Task 3 (buildPrintHTML + handlePrint)
- [x] Fallback @media print → Task 3 (useEffect com style tag)
- [x] Botão "← Voltar" → Task 4 (PrintSidebar)
- [x] Design Apple (dark mode, #007AFF, rounded-xl, etc.) → todas as tasks
- [x] Hinos com opacity-50 quando já no canvas → Task 4
- [x] Ícone Check na sidebar para hinos no canvas → Task 4
