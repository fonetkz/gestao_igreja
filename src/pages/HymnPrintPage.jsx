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

  // DnD handlers
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
