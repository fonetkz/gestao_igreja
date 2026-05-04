import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, GripVertical, Trash2, Printer, Save,
  ChevronDown, Plus, Church, X, Check, Hash, Tag, User, LayoutTemplate,
  Minus
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

function buildPrintHTML(canvasSections, headerConfig, sectionFontSize = 11) {
  const sectionsHTML = canvasSections
    .filter(s => s.hymns.length > 0)
    .map(section => {
      const hymnsHTML = section.hymns.map(hymn => `
        <div class="hymn-card">
          ${hymn.showNumber ? `<span class="hymn-num">Nº ${hymn.numero}</span>` : ''}
          <span class="hymn-title">${(hymn.titulo || '').toUpperCase()}</span>
          ${hymn.showType && hymn.tonalidade ? `<span class="hymn-key">${hymn.tonalidade}</span>` : ''}
          ${hymn.showRegente && hymn.regente ? `<span class="hymn-regent">Reg: ${hymn.regente}</span>` : ''}
        </div>`).join('')
      return `
        <div class="section">
          <div class="section-title"><span>${section.name}</span></div>
          <div class="section-hymns">${hymnsHTML}</div>
        </div>`
    }).join('')

  const logoH = headerConfig.logoHeight || 64
  const headerHTML = `
    <div class="doc-header">
      ${headerConfig.imageUrl ? `<img src="${headerConfig.imageUrl}" class="header-logo" style="max-height:${logoH}px" alt="Logo" />` : ''}
      <h1 class="header-title">${headerConfig.title || ''}</h1>
      ${headerConfig.subtitle ? `<p class="header-subtitle">${headerConfig.subtitle}</p>` : ''}
      ${headerConfig.date ? `<p class="header-meta">${headerConfig.date}</p>` : ''}
      ${headerConfig.location ? `<p class="header-meta">${headerConfig.location}</p>` : ''}
      <div class="header-sep"></div>
    </div>`

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <title>Programação de Hinos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; padding: 15mm; color: #111827; }
    .doc-header { text-align: center; padding-bottom: 20px; margin-bottom: 24px; }
    .header-logo { max-width: 280px; object-fit: contain; margin: 0 auto 12px; display: block; }
    .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #1C1C1E; letter-spacing: 0.3px; margin-bottom: 4px; }
    .header-subtitle { font-family: 'Inter', sans-serif; font-size: 11px; color: #6B7280; font-weight: 500; margin-bottom: 2px; }
    .header-meta { font-family: 'Inter', sans-serif; font-size: 10px; color: #6B7280; margin-top: 2px; }
    .header-sep { width: 60px; height: 1.5px; background: #007AFF; margin: 10px auto 0; }
    .section { margin-bottom: 20px; }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-family: 'Inter', sans-serif; font-size: ${sectionFontSize}px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em;
      color: #9CA3AF; margin: 14px 0 8px;
    }
    .section-title::before, .section-title::after {
      content: ''; flex: 1; border-top: 1px solid #E5E7EB;
    }
    .section-title span { white-space: nowrap; }
    .hymn-card {
      display: flex; align-items: center; gap: 8px;
      background: #FAFCFF; border-left: 2px solid rgba(0,122,255,0.25);
      border-radius: 4px; padding: 5px 8px; margin-bottom: 4px;
    }
    .hymn-num { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 700; color: #007AFF; min-width: 40px; white-space: nowrap; }
    .hymn-title { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; color: #1C1C1E; flex: 1; text-transform: uppercase; letter-spacing: 0.3px; }
    .hymn-key { font-family: 'Inter', sans-serif; font-size: 8px; color: #9CA3AF; font-weight: 500; white-space: nowrap; }
    .hymn-regent { font-family: 'Inter', sans-serif; font-size: 8px; color: #9CA3AF; white-space: nowrap; }
    @media print { @page { margin: 0; } body { padding: 15mm; } }
  </style>
</head>
<body>
  ${headerHTML}
  ${sectionsHTML}
</body>
</html>`
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function PrintSidebar({ sidebarHymns, canvasSections, onDragStart, onBack }) {
  const hymnIdsInCanvas = useMemo(
    () => canvasSections.flatMap(s => s.hymns.map(h => h.id)),
    [canvasSections]
  )

  return (
    <aside className="w-80 shrink-0 fixed left-0 top-16 bottom-0 flex flex-col bg-[#FAFAFA] dark:bg-[#1C1C1E] border-r border-[#E5E7EB] dark:border-gray-700/80 z-30">
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
          const meta = [hymn.numero ? `Nº ${hymn.numero}` : null, hymn.tonalidade || null].filter(Boolean).join(' · ')
          return (
            <div
              key={hymn.id}
              draggable
              onDragStart={e => onDragStart(e, { type: 'sidebar', hymnId: hymn.id })}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing hover:bg-[#F0F4FF] dark:hover:bg-blue-900/20 transition-colors select-none ${inCanvas ? 'opacity-40' : ''}`}
            >
              <GripVertical size={13} className="text-gray-200 dark:text-gray-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{hymn.titulo}</p>
                {meta && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{meta}</p>}
              </div>
              {inCanvas && <Check size={12} className="text-[#007AFF] shrink-0" />}
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

function PrintToolbar({ templates, activeTemplateId, onSelectTemplate, onSaveTemplate, onPrint, sectionFontSize, onSectionFontSizeChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const activeTemplate = templates.find(t => t.id === activeTemplateId)

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E7EB] dark:border-gray-700 rounded-2xl px-4 py-2.5">
      {/* Templates dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
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
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
      >
        <Save size={14} />
        Salvar Template
      </button>

      {/* Section font size control */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 rounded-lg">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mr-1">Seções</span>
        <button
          onClick={() => onSectionFontSizeChange(Math.max(8, sectionFontSize - 1))}
          className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Minus size={10} />
        </button>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-6 text-center">{sectionFontSize}</span>
        <button
          onClick={() => onSectionFontSizeChange(Math.min(20, sectionFontSize + 1))}
          className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Plus size={10} />
        </button>
      </div>

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

function PrintHeader({ headerConfig, onChange }) {
  const logoHeight = headerConfig.logoHeight || 64

  return (
    <div className="text-center pb-5 mb-6">
      {/* Logo / image */}
      <div className="mx-auto mb-1" style={{ height: `${logoHeight}px`, maxWidth: '280px' }}>
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

      {/* Image URL + size slider */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <input
          type="text"
          placeholder="URL da imagem / logo"
          value={headerConfig.imageUrl}
          onChange={e => onChange('imageUrl', e.target.value)}
          className="text-[10px] text-center text-gray-400 bg-transparent border-b border-gray-100 focus:outline-none focus:border-[#007AFF] transition-colors placeholder:text-gray-200 pb-0.5 w-40"
        />
        {headerConfig.imageUrl && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-300 uppercase tracking-wider">tam</span>
            <input
              type="range"
              min={32}
              max={160}
              value={logoHeight}
              onChange={e => onChange('logoHeight', Number(e.target.value))}
              className="w-16 accent-[#007AFF] h-1"
            />
            <span className="text-[9px] text-gray-300 w-6">{logoHeight}px</span>
          </div>
        )}
      </div>

      <input
        type="text"
        value={headerConfig.title}
        onChange={e => onChange('title', e.target.value)}
        placeholder="Título principal"
        className="text-xl font-extrabold text-[#1a2b42] text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-[#007AFF]/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors px-2 py-0.5"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.5px' }}
      />
      <input
        type="text"
        value={headerConfig.subtitle}
        onChange={e => onChange('subtitle', e.target.value)}
        placeholder="Subtítulo (tipo de reunião)"
        className="text-xs font-semibold text-gray-500 uppercase text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-[#007AFF]/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-1 px-2 py-0.5"
        style={{ letterSpacing: '2px' }}
      />
      <input
        type="text"
        value={headerConfig.date}
        onChange={e => onChange('date', e.target.value)}
        placeholder="Data"
        className="text-xs text-gray-400 text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-[#007AFF]/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-0.5 px-2 py-0.5"
      />
      <input
        type="text"
        value={headerConfig.location}
        onChange={e => onChange('location', e.target.value)}
        placeholder="Localização"
        className="text-xs text-gray-400 text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-[#007AFF]/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-0.5 px-2 py-0.5"
      />
      <div className="w-[60px] h-[1.5px] bg-[#007AFF] mx-auto mt-3" />
    </div>
  )
}

function PrintHymnCard({ hymn, sectionId, index, onRemove, onToggleVisibility, onDragStart, onDragOver, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, { type: 'canvas', hymnId: hymn.id, sectionId, index })}
      onDragOver={e => onDragOver(e, sectionId, index)}
      onDragEnd={onDragEnd}
      className="group flex items-start gap-2 p-2.5 bg-[#FAFCFF] rounded transition-all cursor-grab active:cursor-grabbing select-none"
      style={{ borderLeft: '2px solid rgba(0,122,255,0.25)', borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}
    >
      <GripVertical size={13} className="text-gray-300 mt-0.5 shrink-0 group-hover:text-gray-400" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {hymn.showNumber && (
            <span className="text-[#007AFF] font-bold text-xs">Nº {hymn.numero}</span>
          )}
          <span className="font-semibold text-gray-900 text-xs uppercase tracking-wide">{hymn.titulo}</span>
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

function PrintSection({
  section, canvasSections, dragOver, fontSize,
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
      <div className="flex items-center gap-2 mb-1.5 group/header relative">
        <div className="flex-1 h-px bg-gray-200" />
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
            className="bg-transparent border-b border-[#007AFF] focus:outline-none text-center pb-0.5 min-w-0"
            style={{ fontSize: `${fontSize}px`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="hover:text-[#007AFF] transition-colors whitespace-nowrap flex items-center gap-1"
            style={{ fontSize: `${fontSize}px`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}
          >
            {section.name}
            <span className="text-[9px] normal-case tracking-normal font-normal text-gray-300 opacity-0 group-hover/header:opacity-100 transition-opacity">editar</span>
          </button>
        )}
        <div className="flex-1 h-px bg-gray-200" />
        {canvasSections.length > 1 && (
          <button
            onClick={() => onRemoveSection(section.id)}
            className="opacity-0 group-hover/header:opacity-100 w-5 h-5 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
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

// ─── HymnPrintPage ────────────────────────────────────────────────────────────

export default function HymnPrintPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const getHymnById = useHymnsStore(s => s.getHymnById)
  const hymns = useHymnsStore(s => s.hymns)
  const user = useAuthStore(s => s.user)

  // Load Playfair Display font for the canvas preview
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
    return () => link.remove()
  }, [])

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
    logoHeight: 64,
  })

  const [canvasSections, setCanvasSections] = useState(() =>
    DEFAULT_SECTIONS.map(s => ({ ...s, id: genId(), hymns: [] }))
  )

  const [sectionFontSize, setSectionFontSize] = useState(11)

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
      setCanvasSections(prev => prev.map(s => {
        if (s.id !== targetSectionId) return s
        if (s.hymns.some(h => h.id === hymn.id)) return s
        return { ...s, hymns: [...s.hymns, { ...hymn, showRegente: true, showNumber: true, showType: true }] }
      }))
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
    const html = buildPrintHTML(canvasSections, headerConfig, sectionFontSize)
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
            sectionFontSize={sectionFontSize}
            onSectionFontSizeChange={setSectionFontSize}
          />

          <div className="flex justify-center pb-10">
            <div
              id="printable-canvas"
              className="bg-white shadow-xl rounded-2xl"
              style={{ width: '680px', minHeight: '842px', padding: '48px 56px' }}
            >
              <PrintHeader headerConfig={headerConfig} onChange={handleHeaderChange} />

              <div className="space-y-3">
                {canvasSections.map(section => (
                  <PrintSection
                    key={section.id}
                    section={section}
                    canvasSections={canvasSections}
                    dragOver={dragOver}
                    fontSize={sectionFontSize}
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
