import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, GripVertical, Trash2, Printer, Save,
  ChevronDown, ChevronUp, Plus, Church, X, Check, Hash, Tag, User, LayoutTemplate,
  Minus, Music, Calendar
} from 'lucide-react'
import useHymnsStore from '../store/hymnsStore'
import useAuthStore from '../store/authStore'
import Topbar from '../components/layout/Topbar'
import useToastStore from '../store/toastStore'
import ConfirmModal from '../components/ui/ConfirmModal'

// ─── Constants ───────────────────────────────────────────────────────────────

const TEMPLATES_KEY = 'hymnprint_templates'
const LAYOUT_CACHE_KEY = 'hymnprint_last_layout'

function saveLayoutToLS(hymnsKey, headerConfig, sections) {
  try {
    const cache = JSON.parse(localStorage.getItem(LAYOUT_CACHE_KEY) || '{}')
    cache[hymnsKey] = { headerConfig, sections, savedAt: Date.now() }
    // Keep only last 20
    const keys = Object.keys(cache)
    if (keys.length > 20) {
      const oldest = keys.slice(0, keys.length - 20)
      oldest.forEach(k => delete cache[k])
    }
    localStorage.setItem(LAYOUT_CACHE_KEY, JSON.stringify(cache))
  } catch { /* localStorage full or unavailable */ }
}

function loadLayoutFromLS(hymnsKey) {
  try {
    const cache = JSON.parse(localStorage.getItem(LAYOUT_CACHE_KEY) || '{}')
    return cache[hymnsKey] || null
  } catch { return null }
}

function makeHymnsKey(hymns) {
  if (!hymns || hymns.length === 0) return 'empty'
  return hymns.map(h => `${h.id}-${h.regente || ''}-${h.soloist || ''}-${h.piano || ''}-${h.violao || ''}`).join('|')
}

const TYPE_FULL_NAMES = {
  gc: 'Grande Coral',
  cs: 'Coro da Sede',
  oh: 'Orquestra do Hinário',
  oc: 'Orquestra do Coral',
  sc: 'Solos com Coral',
  ocam: 'Orquestra de Câmara',
  cj: 'Coral Jovem',
  ccam: 'Coro de Câmara',
  cf: 'Coro Feminino',
  cij: 'Coro Infanto-Juvenil',
  cm: 'Coro Masculino',
  dm: 'Dia das Mães',
  inst: 'Instrumentais',
  ov: 'Orquestra de Violões',
  se: 'Solos Especiais',
  sn: 'Solos Normais',
  hinario: 'Hinário',
}

function getFullTypeName(tonalidade) {
  if (!tonalidade) return ''
  return TYPE_FULL_NAMES[tonalidade.toLowerCase()] || tonalidade
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

function toTitleCase(str) {
  if (!str) return ''
  return str
    .replace(/_/g, ' ')
    .split(/(\s+)/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function loadTemplatesLS() {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]') }
  catch { return [] }
}

function saveTemplatesLS(templates) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function toISODateString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateDisplay(dateStr) {
  if (!dateStr) {
    const today = new Date()
    return `${WEEKDAYS[today.getDay()]}, ${today.getDate()} de ${MONTHS[today.getMonth()]} de ${today.getFullYear()}`
  }
  try {
    let d
    if (dateStr.includes('/')) {
      const [p1, p2, p3] = dateStr.split('/')
      d = new Date(+p3, +p2 - 1, +p1)
    } else {
      const [y, m, day] = dateStr.split('T')[0].split('-')
      d = new Date(+y, +m - 1, +day)
    }
    if (isNaN(d.getTime())) return dateStr
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
  } catch { return dateStr }
}

const DEFAULT_SECTIONS = [
  { id: 'sec-abertura', name: 'Abertura' },
  { id: 'sec-louvor', name: 'Louvor' },
]

// ─── buildPrintHTML ───────────────────────────────────────────────────────────

function buildPrintHTML(canvasSections, headerConfig, sectionFontSize = 14, hymnFontSize = 12) {
  const sectionsHTML = canvasSections
    .map(section => {
      const hymnsHTML = section.hymns.map(hymn => `
        <div class="hymn-card">
          <div class="hymn-header">
            ${hymn.showNumber ? `<span class="hymn-num">Nº ${hymn.numero}</span>` : ''}
            <span class="hymn-title">
              ${(hymn.titulo || '').toUpperCase()}
              ${hymn.showCustomLabel !== false && hymn.customLabel ? `<span class="hymn-custom-label">${hymn.customLabel}</span>` : ''}
            </span>
          </div>
          <div class="hymn-meta">
            ${hymn.showType && hymn.tonalidade ? `<span class="hymn-key">${getFullTypeName(hymn.tonalidade)}</span>` : ''}
            ${hymn.showRegente && hymn.regente ? `<span class="hymn-regent">Reg: ${hymn.regente}</span>` : ''}
            ${hymn.showSoloist !== false && hymn.soloist ? `<span class="hymn-soloist">Solo: ${hymn.soloist}</span>` : ''}
            ${hymn.showPiano !== false && hymn.piano ? `<span class="hymn-piano">Pno: ${hymn.piano}</span>` : ''}
            ${hymn.showViolao !== false && hymn.violao ? `<span class="hymn-violao">Vlao: ${hymn.violao}</span>` : ''}
          </div>
        </div>`).join('')
      const obsHTML = section.observations
        ? `<div class="section-observations">${section.observations}</div>`
        : ''
      return `
        <div class="section">
          <div class="section-title"><span>${section.name}</span></div>
          <div class="section-hymns">${hymnsHTML}</div>
          ${obsHTML}
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
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; padding: 12mm; color: #111827; }
    .doc-header { text-align: center; padding-bottom: 16px; margin-bottom: 20px; }
    .header-logo { max-width: 200px; object-fit: contain; margin: 0 auto 10px; display: block; }
    .header-title { font-family: 'Playfair Display', Georgia, serif; font-size: 22pt; font-weight: 700; color: #1C1C1E; letter-spacing: 0.3px; margin-bottom: 6px; }
    .header-subtitle { font-family: 'Inter', sans-serif; font-size: 11pt; color: #6B7280; font-weight: 500; margin-bottom: 4px; }
    .header-meta { font-family: 'Inter', sans-serif; font-size: 10pt; color: #6B7280; margin-top: 2px; }
    .header-sep { width: 40px; height: 1px; background: #1E2A78; margin: 10px auto 0; }
    .section { margin-bottom: 20px; }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-family: 'Inter', sans-serif; font-size: ${sectionFontSize}pt;
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em;
      color: #9CA3AF; margin: 16px 0 10px;
    }
    .section-title::before, .section-title::after {
      content: ''; flex: 1; border-top: 1px solid #E5E7EB;
    }
    .section-title span { white-space: nowrap; }
    .section-observations { font-family: 'Inter', sans-serif; font-size: 8pt; color: #4B5563; font-style: italic; padding: 6px 10px; margin: 8px 0; background: #F9FAFB; border-radius: 4px; border: 1px dashed #E5E7EB; white-space: pre-line; }
    .hymn-card {
      display: flex; flex-direction: column; gap: 2px;
      background: #FAFCFF; border: 1px solid #E5E7EB;
      border-radius: 4px; padding: 10px 14px; margin-bottom: 8px;
    }
    .hymn-header {
      display: flex; align-items: baseline; gap: 8px;
    }
    .hymn-num { font-family: 'Inter', sans-serif; font-size: 10pt; font-weight: 700; color: #1E2A78; min-width: 40px; white-space: nowrap; }
    .hymn-title { font-family: 'Inter', sans-serif; font-size: ${hymnFontSize}pt; font-weight: 600; color: #1C1C1E; text-transform: uppercase; letter-spacing: 0.2px; }
    .hymn-meta {
      display: flex; flex-wrap: wrap; gap: 6px 14px; padding-left: 48px;
      font-family: 'Inter', sans-serif; font-size: 8.5pt; color: #9CA3AF;
    }
    .hymn-key { font-weight: 500; white-space: nowrap; }
    .hymn-regent { white-space: nowrap; }
    .hymn-soloist { color: #2E3E9A; font-weight: 500; white-space: nowrap; }
    .hymn-custom-label { color: #9A3412; background: #FFEDD5; padding: 1px 6px; border-radius: 3px; font-weight: 600; white-space: nowrap; }
    .hymn-piano { color: #059669; font-weight: 500; white-space: nowrap; }
    .hymn-violao { color: #D97706; font-weight: 500; white-space: nowrap; }
    @media print { @page { margin: 0; } body { padding: 10mm; } }
  </style>
</head>
<body>
  ${headerHTML}
  ${sectionsHTML}
</body>
</html>`
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function PrintSidebar({ sidebarHymns, canvasSections, onDragStart, onBack, onAddToSection }) {
  const hymnIdsInCanvas = useMemo(
    () => canvasSections.flatMap(s => s.hymns.map(h => h.id)),
    [canvasSections]
  )

  return (
    <aside className="w-80 shrink-0 fixed left-0 top-16 bottom-0 flex flex-col bg-[#FAFAFA] dark:bg-[#1C1C1E] border-r border-[#E5E7EB] dark:border-gray-500/80 z-30">
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-primary dark:text-blue-300 text-sm font-medium mb-3 hover:opacity-75 transition-opacity"
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
          const meta = [hymn.numero ? `Nº ${hymn.numero}` : null, getFullTypeName(hymn.tonalidade) || null].filter(Boolean).join(' · ')
          return (
            <div
              key={hymn.id}
              draggable
              onDragStart={e => onDragStart(e, { type: 'sidebar', hymnId: hymn.id })}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing hover:bg-primary/5 transition-colors select-none ${inCanvas ? 'opacity-40' : ''}`}
            >
              <GripVertical size={13} className="text-gray-200 dark:text-gray-600 shrink-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{hymn.titulo}</p>
                {meta && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{meta}</p>}
              </div>
              {inCanvas && <Check size={12} className="text-primary dark:text-blue-300 shrink-0" />}
              {!inCanvas && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToSection(hymn.id) }}
                  className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 text-[10px] text-primary dark:text-blue-300 font-medium px-2 py-0.5 rounded-full border border-primary/30 hover:bg-primary/5 transition-all shrink-0"
                  title="Adicionar à primeira seção"
                >
                  + Adicionar
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-500">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          {sidebarHymns.length} hino{sidebarHymns.length !== 1 ? 's' : ''} disponíve{sidebarHymns.length !== 1 ? 'is' : 'l'}
        </p>
      </div>
    </aside>
  )
}

function PrintToolbar({ templates, activeTemplateId, onSelectTemplate, onDeleteTemplate, onSaveTemplate, onSaveLayout, onPrint, sectionFontSize, onSectionFontSizeChange, hymnFontSize, onHymnFontSizeChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const activeTemplate = templates.find(t => t.id === activeTemplateId)

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E7EB] dark:border-gray-500 rounded-2xl px-4 py-2.5">
      {/* Templates dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
        >
          <LayoutTemplate size={14} className="text-gray-400" />
          <span>{activeTemplate?.name || 'Template'}</span>
          <ChevronDown size={13} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-[#2C2C2E] rounded-xl border border-gray-200 dark:border-gray-500 shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-500">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Templates</p>
              </div>
              {templates.map(t => (
                <div key={t.id} className="flex items-center justify-between group">
                  <button
                    onClick={() => { onSelectTemplate(t); setDropdownOpen(false) }}
                    className={`flex-1 text-left px-4 py-2.5 text-sm transition-colors ${
                      t.id === activeTemplateId
                        ? 'bg-primary/5 dark:bg-primary/10 text-primary dark:text-blue-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {t.name}
                  </button>
                  {templates.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteTemplate(t.id); setDropdownOpen(false) }}
                      className="px-3 py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Excluir template"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onSaveTemplate}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
      >
        <Save size={14} />
        Salvar Template
      </button>

      <button
        onClick={onSaveLayout}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary dark:text-blue-300 bg-white dark:bg-[#3A3A3C] border border-primary/30 dark:border-primary/50 rounded-lg hover:bg-primary/5 transition-all"
      >
        <Save size={14} />
        Salvar Configuração
      </button>

      {/* Section font size control */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-500 rounded-lg">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mr-1">Seções</span>
        <button
          onClick={() => onSectionFontSizeChange(Math.max(10, sectionFontSize - 1))}
          className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Minus size={10} />
        </button>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-6 text-center">{sectionFontSize}</span>
        <button
          onClick={() => onSectionFontSizeChange(Math.min(28, sectionFontSize + 1))}
          className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Plus size={10} />
        </button>
      </div>

      {/* Hymn font size control */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-500 rounded-lg">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mr-1">Hinos</span>
        <button
          onClick={() => onHymnFontSizeChange(Math.max(8, hymnFontSize - 1))}
          className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Minus size={10} />
        </button>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-6 text-center">{hymnFontSize}</span>
        <button
          onClick={() => onHymnFontSizeChange(Math.min(24, hymnFontSize + 1))}
          className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Plus size={10} />
        </button>
      </div>

      <div className="flex-1" />

      <button
        onClick={onPrint}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary-dark active:scale-95 transition-all shadow-md shadow-primary/25"
      >
        <Printer size={15} />
        Imprimir
      </button>
    </div>
  )
}

function PrintHeader({ headerConfig, onChange }) {
  const logoHeight = headerConfig.logoHeight || 64
  const datePickerRef = useRef(null)

  const parseDateFromDisplay = (displayStr) => {
    if (!displayStr) return new Date()
    try {
      const match = displayStr.match(/(\d{1,2}) de (\w+) de (\d{4})/)
      if (match) {
        const monthIdx = MONTHS.findIndex(m => m.toLowerCase() === match[2].toLowerCase())
        if (monthIdx >= 0) return new Date(+match[3], monthIdx, +match[1])
      }
      const isoMatch = displayStr.match(/(\d{4})-(\d{2})-(\d{2})/)
      if (isoMatch) return new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3])
    } catch {}
    return new Date()
  }

  const handleDatePickerChange = (e) => {
    const val = e.target.value
    if (val) onChange('date', formatDateDisplay(val))
  }

  const todayISO = toISODateString(parseDateFromDisplay(headerConfig.date))

  return (
    <div className="text-center pb-3 mb-4">
      {/* Logo / image */}
      <div className="mx-auto mb-1" style={{ height: `${logoHeight}px`, maxWidth: '200px' }}>
        {headerConfig.imageUrl ? (
          <img
            src={headerConfig.imageUrl}
            alt="Logo"
            className="w-full h-full object-contain"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <Church size={20} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Image URL + size slider */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <input
          type="text"
          placeholder="URL da imagem / logo"
          value={headerConfig.imageUrl}
          onChange={e => onChange('imageUrl', e.target.value)}
          className="text-[9px] text-center text-gray-400 dark:text-gray-500 bg-transparent border-b border-gray-100 dark:border-gray-500 focus:outline-none focus:border-primary transition-colors placeholder:text-gray-200 dark:placeholder:text-gray-600 pb-0.5 w-32"
        />
        {headerConfig.imageUrl && (
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-gray-300 uppercase tracking-wider">tam</span>
            <input
              type="range"
              min={24}
              max={120}
              value={logoHeight}
              onChange={e => onChange('logoHeight', Number(e.target.value))}
              className="w-12 accent-primary h-1"
            />
            <span className="text-[8px] text-gray-300 w-5">{logoHeight}px</span>
          </div>
        )}
      </div>

      <input
        type="text"
        value={headerConfig.title}
        onChange={e => onChange('title', e.target.value)}
        placeholder="Título principal"
        className="text-lg font-extrabold text-[#1a2b42] text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-primary/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors px-2 py-0.5"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.5px' }}
      />
      <input
        type="text"
        value={headerConfig.subtitle}
        onChange={e => onChange('subtitle', e.target.value)}
        placeholder="Subtítulo (tipo de reunião)"
        className="text-[11px] font-semibold text-gray-500 uppercase text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-primary/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-0.5 px-2 py-0.5"
        style={{ letterSpacing: '1.5px' }}
      />
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="text"
          value={headerConfig.date}
          onChange={e => onChange('date', formatDateDisplay(e.target.value))}
          placeholder="Data"
          className="text-[11px] text-gray-400 text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-primary/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors px-2 py-0.5 pr-7"
        />
        <button
          type="button"
          onClick={() => datePickerRef.current?.showPicker()}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-gray-300 hover:text-primary transition-colors"
        >
          <Calendar size={14} />
        </button>
        <input
          ref={datePickerRef}
          type="date"
          value={todayISO}
          onChange={handleDatePickerChange}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />
      </div>
      <input
        type="text"
        value={headerConfig.location}
        onChange={e => onChange('location', toTitleCase(e.target.value))}
        placeholder="Localização"
        className="text-[11px] text-gray-400 text-center bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-primary/20 hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors mt-0.5 px-2 py-0.5"
      />

      <div className="w-[40px] h-[1px] bg-primary mx-auto mt-2" />
    </div>
  )
}

function PrintHymnCard({ hymn, sectionId, index, onRemove, onToggleVisibility, onUpdateHymnField, onDragStart, onDragOver, onDragEnd, onMove, hymnCount }) {
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelDraft, setLabelDraft] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingLabel) {
      setLabelDraft(hymn.customLabel || '')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [editingLabel])

  const handleSaveLabel = () => {
    onUpdateHymnField(sectionId, hymn.id, 'customLabel', labelDraft.trim())
    setEditingLabel(false)
  }

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, { type: 'canvas', hymnId: hymn.id, sectionId, index })}
      onDragOver={e => onDragOver(e, sectionId, index)}
      onDragEnd={onDragEnd}
      className="group flex items-start gap-2 p-2.5 bg-[#FAFCFF] rounded transition-all cursor-grab active:cursor-grabbing select-none"
      style={{ borderLeft: '2px solid rgba(30,42,120,0.25)', borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}
    >
      <GripVertical size={13} className="text-gray-300 mt-0.5 shrink-0 group-hover:text-gray-400 group-focus-visible:text-gray-400" />
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          onClick={() => onMove(sectionId, index, -1)}
          disabled={index === 0}
          className="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          title="Mover para cima"
        >
          <ChevronUp size={11} />
        </button>
        <button
          onClick={() => onMove(sectionId, index, 1)}
          disabled={index === hymnCount - 1}
          className="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          title="Mover para baixo"
        >
          <ChevronDown size={11} />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {hymn.showNumber && (
            <span className="text-primary font-bold text-xs">Nº {hymn.numero}</span>
          )}
          <span className="font-semibold text-gray-900 text-xs uppercase tracking-wide">{hymn.titulo}</span>
          {hymn.showCustomLabel !== false && editingLabel ? (
            <input
              ref={inputRef}
              type="text"
              value={labelDraft}
              onChange={e => setLabelDraft(e.target.value)}
              onBlur={handleSaveLabel}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveLabel(); if (e.key === 'Escape') setEditingLabel(false) }}
              className="w-24 text-[9px] px-1.5 py-0.5 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-primary"
              placeholder="rótulo..."
            />
          ) : hymn.showCustomLabel !== false && hymn.customLabel ? (
            <span
              onClick={() => setEditingLabel(true)}
              className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-semibold cursor-pointer hover:bg-orange-200 transition-colors"
              title="Clique para editar"
            >
              {hymn.customLabel}
            </span>
          ) : hymn.showCustomLabel !== false ? (
            <button
              onClick={() => { setEditingLabel(true); setLabelDraft('') }}
              className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 text-[9px] text-orange-400 border border-dashed border-orange-300/40 px-1.5 py-0.5 rounded-full font-semibold hover:bg-orange-50 hover:text-orange-500 hover:border-orange-400 transition-all"
              title="Adicionar rótulo"
            >
              + rótulo
            </button>
          ) : null}
          {hymn.showType && hymn.tonalidade && (
            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500 font-bold tracking-tight">
              {getFullTypeName(hymn.tonalidade)}
            </span>
          )}
        </div>
        {hymn.showRegente && hymn.regente && (
          <p className="text-[10px] text-primary font-medium mt-0.5">Reg: {hymn.regente}</p>
        )}
        {hymn.showSoloist !== false && hymn.soloist && (
          <p className="text-[10px] text-primary font-medium">Solo: {hymn.soloist}</p>
        )}
        {hymn.showPiano !== false && hymn.piano && (
          <p className="text-[10px] text-emerald-600 font-medium">Pno: {hymn.piano}</p>
        )}
        {hymn.showViolao !== false && hymn.violao && (
          <p className="text-[10px] text-amber-600 font-medium">Vlao: {hymn.violao}</p>
        )}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shrink-0">
        {hymn.soloist && (
          <button
            onClick={() => onToggleVisibility(sectionId, hymn.id, 'showSoloist')}
            title="Mostrar/ocultar solista"
            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${hymn.showSoloist !== false ? 'text-primary bg-primary/5' : 'text-gray-300 hover:text-gray-500'}`}
          >
            <Music size={10} />
          </button>
        )}
        <button
          onClick={() => onToggleVisibility(sectionId, hymn.id, 'showRegente')}
          title="Mostrar/ocultar regente"
          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${hymn.showRegente ? 'text-primary bg-primary/5' : 'text-gray-300 hover:text-gray-500'}`}
        >
          <User size={10} />
        </button>
        {hymn.piano && (
          <button
            onClick={() => onToggleVisibility(sectionId, hymn.id, 'showPiano')}
            title="Mostrar/ocultar piano"
            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${hymn.showPiano !== false ? 'text-emerald-600 bg-emerald-50' : 'text-gray-300 hover:text-gray-500'}`}
          >
            <Music size={10} />
          </button>
        )}
        {hymn.violao && (
          <button
            onClick={() => onToggleVisibility(sectionId, hymn.id, 'showViolao')}
            title="Mostrar/ocultar violão"
            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${hymn.showViolao !== false ? 'text-amber-600 bg-amber-50' : 'text-gray-300 hover:text-gray-500'}`}
          >
            <Music size={10} />
          </button>
        )}
        {hymn.customLabel && (
          <button
            onClick={() => onToggleVisibility(sectionId, hymn.id, 'showCustomLabel')}
            title="Mostrar/ocultar rótulo"
            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${hymn.showCustomLabel !== false ? 'text-orange-600 bg-orange-50' : 'text-gray-300 hover:text-gray-500'}`}
          >
            <Tag size={10} />
          </button>
        )}
        <button
          onClick={() => onToggleVisibility(sectionId, hymn.id, 'showNumber')}
          title="Mostrar/ocultar número"
          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${hymn.showNumber ? 'text-primary bg-primary/5' : 'text-gray-300 hover:text-gray-500'}`}
        >
          <Hash size={10} />
        </button>
        <button
          onClick={() => onToggleVisibility(sectionId, hymn.id, 'showType')}
          title="Mostrar/ocultar tipo"
          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${hymn.showType ? 'text-primary bg-primary/5' : 'text-gray-300 hover:text-gray-500'}`}
        >
          <Tag size={10} />
        </button>
        <button
          onClick={() => onRemove(sectionId, hymn.id)}
          className="w-5 h-5 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  )
}

function PrintSection({
  section, canvasSections, dragOver, fontSize,
  onRenameSection, onUpdateSection, onRemoveSection,
  onDrop, onDragOver, onDragLeave,
  onHymnRemove, onToggleVisibility, onUpdateHymnField,
  onCardDragStart, onCardDragOver, onCardDragEnd,
  onMoveHymn
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
            className="bg-transparent border-b border-primary focus:outline-none text-center pb-0.5 min-w-0 text-gray-500 dark:text-gray-400"
            style={{ fontSize: `${fontSize}px`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1"
            style={{ fontSize: `${fontSize}px`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}
          >
            {section.name}
            <span className="text-[9px] normal-case tracking-normal font-normal text-gray-300 opacity-0 group-hover/header:opacity-100 group-focus-visible/header:opacity-100 transition-opacity">editar</span>
          </button>
        )}
        <div className="flex-1 h-px bg-gray-200" />
        {canvasSections.length > 1 && (
          <button
            onClick={() => onRemoveSection(section.id)}
            className="opacity-0 group-hover/header:opacity-100 group-focus-visible/header:opacity-100 w-5 h-5 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
          >
            <X size={11} />
          </button>
        )}
      </div>

      <div
        onDragOver={e => onDragOver(e, section.id)}
        onDragLeave={onDragLeave}
        onDrop={e => onDrop(e, section.id)}
        className={`min-h-[40px] rounded-xl border-2 border-dashed transition-all flex flex-col gap-1.5 p-1.5 ${
          isOver
            ? 'border-primary bg-primary/5'
            : 'border-gray-100 hover:border-gray-200'
        }`}
      >
        {section.hymns.map((hymn, index) => (
          <PrintHymnCard
            key={`${hymn.id}-${index}`}
            hymn={hymn}
            sectionId={section.id}
            index={index}
            hymnCount={section.hymns.length}
            onRemove={onHymnRemove}
            onToggleVisibility={onToggleVisibility}
            onUpdateHymnField={onUpdateHymnField}
            onDragStart={onCardDragStart}
            onDragOver={onCardDragOver}
            onDragEnd={onCardDragEnd}
            onMove={onMoveHymn}
          />
        ))}
        {section.hymns.length === 0 && (
          <p className="text-[10px] text-gray-300 text-center py-2 pointer-events-none select-none">
            Arraste hinos aqui
          </p>
        )}
      </div>

      {/* Observações da seção */}
      <div className="mt-1.5">
        <textarea
          value={section.observations || ''}
          onChange={e => onUpdateSection(section.id, { observations: e.target.value })}
          placeholder="Observações / avisos desta seção..."
          rows={1}
          className="w-full text-[10px] text-gray-500 bg-transparent border border-dashed border-gray-200 rounded-lg px-2 py-1 resize-none focus:outline-none focus:border-primary/30 hover:bg-gray-50 transition-colors"
        />
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
          className="input w-full mb-4"
        />
        <div className="flex gap-3">
          <Button onClick={onClose} variant="secondary" fullWidth>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            variant="primary" fullWidth className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── HymnPrintPage ────────────────────────────────────────────────────────────

export default function HymnPrintPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const hymns = useHymnsStore(s => s.hymns)
  const hymnsById = useMemo(() => {
    const map = {}
    hymns.forEach(h => { map[h.id] = h })
    return map
  }, [hymns])
  const user = useAuthStore(s => s.user)
  const saveProgramLayout = useHymnsStore(s => s.saveProgramLayout)
  const showToast = useToastStore(s => s.showToast)
  const programId = state?.programId || null
  const savedLayout = state?.layout || null
  const fromTab = state?.fromTab || 'programar'

  // Resolve sidebar hymns from location.state
const sidebarHymns = useMemo(() => {
    if (!state?.hymns) return []
    return state.hymns.map(item => {
      const id = typeof item === 'object' ? item.id : item
      const regente = typeof item === 'object' ? item.regente : ''
      const rawSolista = typeof item === 'object' ? item.solista : ''
      const soloist = Array.isArray(rawSolista) ? rawSolista.join(', ') : (rawSolista || '')
      const piano = typeof item === 'object' ? item.piano || '' : ''
      const rawViolao = typeof item === 'object' ? item.violao : ''
      const violao = Array.isArray(rawViolao) ? rawViolao.join(', ') : (rawViolao || '')
      const hymn = hymnsById[id]
      if (!hymn) return null
      return { ...hymn, regente, soloist, piano, violao }
    }).filter(Boolean)
  }, [state?.hymns, hymnsById])

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
  const [templateDeleteId, setTemplateDeleteId] = useState(null)

  // Canvas state
  const [headerConfig, setHeaderConfig] = useState(() => {
    if (savedLayout?.headerConfig) {
      return {
        imageUrl: savedLayout.headerConfig.imageUrl || '',
        title: savedLayout.headerConfig.title || toTitleCase(user?.churchName) || 'Programação Musical',
        subtitle: savedLayout.headerConfig.subtitle || toTitleCase(state?.meta?.tipo) || '',
        date: formatDateDisplay(savedLayout.headerConfig.date || state?.meta?.data || ''),
        location: savedLayout.headerConfig.location || '',
        logoHeight: savedLayout.headerConfig.logoHeight || 48,
      }
    }
    return {
      imageUrl: '',
      title: toTitleCase(user?.churchName) || 'Programação Musical',
      subtitle: toTitleCase(state?.meta?.tipo) || '',
      date: formatDateDisplay(state?.meta?.data || toISODateString(new Date())),
      location: '',
      logoHeight: 48,
    }
  })

  const [canvasSections, setCanvasSections] = useState(() => {
    if (savedLayout?.sections && savedLayout.sections.length > 0) {
      return savedLayout.sections.map(s => ({
        ...s,
        id: genId(),
        hymns: s.hymns || []
      }))
    }
    return DEFAULT_SECTIONS.map(s => ({ ...s, id: genId(), hymns: [] }))
  })

  const [sectionFontSize, setSectionFontSize] = useState(14)
  const [hymnFontSize, setHymnFontSize] = useState(12)
  const hymnsKey = useMemo(() => makeHymnsKey(sidebarHymns), [sidebarHymns])

  // Restore saved layout from server when program changes
  useEffect(() => {
    if (!sidebarHymns.length) return
    if (savedLayout) return // já foi restaurado do state inicial
    const saved = loadLayoutFromLS(hymnsKey)
    if (saved) {
      if (saved.headerConfig) setHeaderConfig(prev => ({ ...prev, ...saved.headerConfig }))
      if (saved.sections) setCanvasSections(saved.sections)
    }
  }, [hymnsKey])

  // Auto-save layout whenever headerConfig or canvasSections change (debounced)
  const saveTimer = useRef(null)
  useEffect(() => {
    if (!sidebarHymns.length) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const layout = { headerConfig, sections: canvasSections }
      saveLayoutToLS(hymnsKey, headerConfig, canvasSections)
      if (programId) {
        saveProgramLayout(programId, layout)
      }
    }, 1000)
    return () => clearTimeout(saveTimer.current)
  }, [headerConfig, canvasSections, hymnsKey, programId])

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

  const handleUpdateSection = (sectionId, updates) =>
    setCanvasSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...updates } : s))

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

  const handleUpdateHymnField = (sectionId, hymnId, field, value) =>
    setCanvasSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, hymns: s.hymns.map(h => h.id === hymnId ? { ...h, [field]: value } : h) }
        : s
    ))

  const handleMoveHymn = useCallback((sectionId, index, direction) => {
    setCanvasSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s
      const arr = [...s.hymns]
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= arr.length) return s
      const [moved] = arr.splice(index, 1)
      arr.splice(newIndex, 0, moved)
      return { ...s, hymns: arr }
    }))
  }, [])

  const handleAddToFirstSection = useCallback((hymnId) => {
    const hymn = sidebarHymns.find(h => h.id === hymnId)
    if (!hymn) return
    setCanvasSections(prev => {
      if (prev.length === 0) return prev
      const first = prev[0]
      if (first.hymns.some(h => h.id === hymn.id)) return prev
      return prev.map((s, i) => i === 0
        ? { ...s, hymns: [...s.hymns, { ...hymn, showRegente: true, showNumber: true, showType: true, showSoloist: true, customLabel: '', showCustomLabel: true }] }
        : s
      )
    })
  }, [sidebarHymns])

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
        return { ...s, hymns: [...s.hymns, { ...hymn, showRegente: true, showNumber: true, showType: true, showSoloist: true, customLabel: '', showCustomLabel: true }] }
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
      headerConfig: { imageUrl: headerConfig.imageUrl, title: headerConfig.title, subtitle: headerConfig.subtitle, date: headerConfig.date, location: headerConfig.location, logoHeight: headerConfig.logoHeight },
      sections: canvasSections.map(s => ({ id: s.id, name: s.name, observations: s.observations })),
    }
    const updated = [...templates, tpl]
    setTemplates(updated)
    saveTemplatesLS(updated)
    setActiveTemplateId(tpl.id)
    setTemplateModalOpen(false)
  }

  // Delete template
  const handleDeleteTemplate = (templateId) => {
    setTemplateDeleteId(templateId)
  }

  // Save layout to server (if programId exists)
  const handleSaveLayout = useCallback(() => {
    const layout = { headerConfig, sections: canvasSections }
    saveLayoutToLS(hymnsKey, headerConfig, canvasSections)
    if (programId) {
      saveProgramLayout(programId, layout)
      showToast('Configuração de impressão salva!', 'success')
    } else {
      showToast('Configuração salva no navegador', 'success')
    }
  }, [headerConfig, canvasSections, hymnsKey, programId, saveProgramLayout, showToast])

  // Print
  const handlePrint = () => {
    handleSaveLayout()
    const html = buildPrintHTML(canvasSections, headerConfig, sectionFontSize, hymnFontSize)
    const win = window.open('', '_blank', 'width=800,height=900')
    if (!win) { window.print(); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 250)
  }

  return (
    <div id="hymnprint-root" className="min-h-screen">
      <Topbar title="Gestão Igreja" />

      <PrintSidebar
        sidebarHymns={sidebarHymns}
        canvasSections={canvasSections}
        onDragStart={handleDragStart}
        onAddToSection={handleAddToFirstSection}
        onBack={() => navigate('/programacao', { state: { activeTab: fromTab } })}
      />

      <main className="ml-80 pt-16 min-h-screen flex flex-col">
        <div className="px-8 py-8 flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Preparação para Impressão</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {state?.meta?.tipo && <span>{toTitleCase(state.meta.tipo)}</span>}
              {state?.meta?.data && <span> • {formatDateDisplay(state.meta.data)}</span>}
            </p>
          </div>

          <PrintToolbar
            templates={templates}
            activeTemplateId={activeTemplateId}
            onSelectTemplate={handleSelectTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onSaveTemplate={() => setTemplateModalOpen(true)}
            onSaveLayout={handleSaveLayout}
            onPrint={handlePrint}
            sectionFontSize={sectionFontSize}
            onSectionFontSizeChange={setSectionFontSize}
            hymnFontSize={hymnFontSize}
            onHymnFontSizeChange={setHymnFontSize}
          />

          <div className="flex justify-center pb-10">
            <div
              id="printable-canvas"
              className="bg-white shadow-xl rounded-2xl"
              style={{ width: '680px', minHeight: '842px', padding: '32px 40px' }}
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
                    onUpdateSection={handleUpdateSection}
                    onRemoveSection={handleRemoveSection}
                    onDrop={handleSectionDrop}
                    onDragOver={handleSectionDragOver}
                    onDragLeave={handleSectionDragLeave}
                    onHymnRemove={handleHymnRemove}
                    onToggleVisibility={handleToggleVisibility}
                    onUpdateHymnField={handleUpdateHymnField}
                    onCardDragStart={handleCardDragStart}
                    onCardDragOver={handleCardDragOver}
                    onCardDragEnd={handleCardDragEnd}
                    onMoveHymn={handleMoveHymn}
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

      <ConfirmModal
        isOpen={!!templateDeleteId}
        onClose={() => setTemplateDeleteId(null)}
        onConfirm={() => {
          const updated = templates.filter(t => t.id !== templateDeleteId)
          setTemplates(updated)
          saveTemplatesLS(updated)
          if (activeTemplateId === templateDeleteId) {
            setActiveTemplateId(updated[0]?.id || null)
          }
          setTemplateDeleteId(null)
        }}
        title="Excluir Template"
        description="Este template será removido permanentemente. As seções e configurações salvas nele serão perdidas."
        confirmLabel="Sim, excluir template"
        danger
      />
    </div>
  )
}
