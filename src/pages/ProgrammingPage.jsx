import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Music, Trash2, Save, Check, BookOpen, ChevronUp, ChevronDown, GripVertical, Clock, Calendar, Loader2, Edit2, AlertTriangle, X, Printer, Users } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import useHymnsStore from '../store/hymnsStore'
import useSettingsStore from '../store/settingsStore'
import useAuthStore from '../store/authStore'
import useToastStore from '../store/toastStore'
import useMembersStore from '../store/membersStore'

// Função auxiliar para formatar a data (YYYY-MM-DD para DD/MM/YYYY)
const formatDate = (d) => {
  if (!d) return ''
  if (!d.includes('-')) return d
  return d.split('T')[0].split('-').reverse().join('/')
}

// Função auxiliar para pegar o dia da semana
const getDayOfWeek = (d) => {
  if (!d || !d.includes('-')) return ''
  const [ano, mes, dia] = d.split('T')[0].split('-')
  const date = new Date(ano, mes - 1, dia)
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  return dias[date.getDay()]
}

// ─── HymnResultItem ──────────────────────────────────────────────────────────
function HymnResultItem({ hymn, onAdd, isAdded, onEdit }) {
  const daysSince = useHymnsStore((s) => s.daysSinceLastUsed)(hymn.id)
  const hymnTypes = useSettingsStore((s) => s.hymnTypes) || []
  return (
    <div
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group text-left border
        ${isAdded
          ? 'opacity-60 bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700'
          : 'border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10'
        }`}
    >
      <button onClick={() => !isAdded && onAdd(hymn)} disabled={isAdded} className="flex-1 min-w-0 text-left">
        <p className="font-semibold text-gray-900 dark:text-white">
          <span className="text-[#007AFF]">Nº {hymn.numero}</span> — {hymn.titulo}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {daysSince !== null ? (
            <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full font-medium">
              {daysSince >= 365 ? `${Math.floor(daysSince / 365)}a atrás` : daysSince >= 30 ? `${Math.floor(daysSince / 30)}m atrás` : `${daysSince}d atrás`}
            </span>
          ) : (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full font-medium">
              Nunca utilizado
            </span>
          )}
          {hymn.tonalidade && (
            <span className="text-xs text-gray-400 dark:text-gray-500">Tipo: {hymnTypes.find(t => t.value.toLowerCase() === hymn.tonalidade?.toLowerCase())?.label || hymn.tonalidade}</span>
          )}
        </div>
      </button>
      <div className="flex items-center gap-1 ml-3">
        <button onClick={(e) => { e.stopPropagation(); onEdit(hymn); }} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={() => !isAdded && onAdd(hymn)} disabled={isAdded} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isAdded ? 'bg-gray-200 dark:bg-gray-600 text-gray-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-[#007AFF] hover:text-white'}`}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── ProgrammedHymnItem ──────────────────────────────────────────────────────
function ProgrammedHymnItem({ hymn, index, onRemove, onMove, isFirst, isLast, onUpdateRegente, onUpdateSolista, onUpdatePiano, onUpdateViolao, onDragStart, onDragOver, onDragEnd }) {
  const hymnTypes = useSettingsStore((s) => s.hymnTypes) || []
  const members = useMembersStore((s) => s.members) || []
  const conductors = members.filter(m => m.status === 'Ativo' && m.cargo && m.cargo.toLowerCase().includes('regente'))
  const activeMembers = members.filter(m => m.status === 'Ativo')
  const pianoMembers = members.filter(m => m.status === 'Ativo' && m.instrumento_voz && m.instrumento_voz.toLowerCase().includes('piano'))
  const normalizeStr = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const violaoMembers = members.filter(m => m.status === 'Ativo' && m.instrumento_voz && normalizeStr(m.instrumento_voz).toLowerCase().includes('violao'))

  const [showRegenteSelect, setShowRegenteSelect] = useState(false)
  const [showSolistaSelect, setShowSolistaSelect] = useState(false)
  const [showPianoSelect, setShowPianoSelect] = useState(false)
  const [showViolaoSelect, setShowViolaoSelect] = useState(false)

  const solistas = Array.isArray(hymn.solista) ? hymn.solista : (hymn.solista ? [hymn.solista] : [])

  const handleAddSolista = (nome) => {
    if (!nome) return
    const updated = [...solistas, nome]
    onUpdateSolista(hymn.id, updated)
    setShowSolistaSelect(false)
  }

  const handleRemoveSolista = (idx) => {
    const updated = solistas.filter((_, i) => i !== idx)
    onUpdateSolista(hymn.id, updated.length > 0 ? updated : '')
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className="flex items-center gap-3 p-4 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex flex-col items-center gap-0.5">
        <button type="button" disabled={isFirst} onClick={() => onMove(index, -1)} className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-30 cursor-pointer">
          <ChevronUp size={16} />
        </button>
        <GripVertical size={14} className="text-gray-300 dark:text-gray-600" />
        <button type="button" disabled={isLast} onClick={() => onMove(index, 1)} className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-30 cursor-pointer">
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[#007AFF] font-bold">Nº {hymn.numero}</span>
          <span className="font-semibold text-gray-900 dark:text-white truncate">{hymn.titulo}</span>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          {hymn.tonalidade && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Tipo: {hymnTypes.find(t => t.value.toLowerCase() === hymn.tonalidade?.toLowerCase())?.label || hymn.tonalidade}</span>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {/* Regente */}
            {hymn.regente ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <Users size={12} className="text-gray-500" />
                Regente: {hymn.regente}
                <button
                  onClick={() => onUpdateRegente(hymn.id, '')}
                  className="ml-0.5 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ) : showRegenteSelect ? (
              <div className="flex items-center gap-1">
                <Select
                  className="min-w-[160px]"
                  size="sm"
                  options={[
                    { value: '', label: 'Selecionar regente...' },
                    ...conductors.map(c => ({ value: c.nome, label: c.nome })),
                    ...(hymn.regente && !conductors.find(c => c.nome === hymn.regente) ? [{ value: hymn.regente, label: `${hymn.regente} (Inativo)` }] : [])
                  ]}
                  value=""
                  onChange={(val) => {
                    if (val) {
                      onUpdateRegente(hymn.id, val)
                    }
                    setShowRegenteSelect(false)
                  }}
                />
                <button onClick={() => setShowRegenteSelect(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRegenteSelect(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#007AFF] border border-dashed border-[#007AFF]/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
              >
                <Plus size={12} />
                Regente
              </button>
            )}

            {/* Solistas */}
            {solistas.map((nome, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Music size={12} className="text-purple-500" />
                Solista: {nome}
                <button
                  onClick={() => handleRemoveSolista(idx)}
                  className="ml-0.5 p-0.5 rounded hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {showSolistaSelect ? (
              <div className="flex items-center gap-1">
                <Select
                  className="min-w-[160px]"
                  size="sm"
                  options={[
                    { value: '', label: 'Selecionar solista...' },
                    ...activeMembers
                      .filter(m => !solistas.includes(m.nome))
                      .map(m => ({ value: m.nome, label: m.nome }))
                  ]}
                  value=""
                  onChange={(val) => handleAddSolista(val)}
                />
                <button onClick={() => setShowSolistaSelect(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSolistaSelect(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 border border-dashed border-purple-300/30 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
              >
                <Plus size={12} />
                Solista
              </button>
            )}

            {/* Piano */}
            {hymn.piano ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Music size={12} className="text-emerald-500" />
                Piano: {hymn.piano}
                <button
                  onClick={() => onUpdatePiano(hymn.id, '')}
                  className="ml-0.5 p-0.5 rounded hover:bg-emerald-200 dark:hover:bg-emerald-800/50 text-emerald-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ) : showPianoSelect ? (
              <div className="flex items-center gap-1">
                <Select
                  className="min-w-[160px]"
                  size="sm"
                  options={[
                    { value: '', label: 'Selecionar pianista...' },
                    ...pianoMembers
                      .filter(m => m.nome !== hymn.piano)
                      .map(m => ({ value: m.nome, label: m.nome }))
                  ]}
                  value=""
                  onChange={(val) => {
                    if (val) onUpdatePiano(hymn.id, val)
                    setShowPianoSelect(false)
                  }}
                />
                <button onClick={() => setShowPianoSelect(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPianoSelect(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-600 border border-dashed border-emerald-300/30 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
              >
                <Plus size={12} />
                Piano
              </button>
            )}

            {/* Violão */}
            {hymn.violao ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Music size={12} className="text-amber-500" />
                Violão: {hymn.violao}
                <button
                  onClick={() => onUpdateViolao(hymn.id, '')}
                  className="ml-0.5 p-0.5 rounded hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ) : showViolaoSelect ? (
              <div className="flex items-center gap-1">
                <Select
                  className="min-w-[160px]"
                  size="sm"
                  options={[
                    { value: '', label: 'Selecionar violonista...' },
                    ...violaoMembers
                      .filter(m => m.nome !== hymn.violao)
                      .map(m => ({ value: m.nome, label: m.nome }))
                  ]}
                  value=""
                  onChange={(val) => {
                    if (val) onUpdateViolao(hymn.id, val)
                    setShowViolaoSelect(false)
                  }}
                />
                <button onClick={() => setShowViolaoSelect(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowViolaoSelect(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-600 border border-dashed border-amber-300/30 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
              >
                <Plus size={12} />
                Violão
              </button>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(hymn.id)}
        className="p-2 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

// ─── HymnModal ───────────────────────────────────────────────────────────────
function HymnModal({ isOpen, onClose, onSave, editingHymn }) {
  const hymnTypes = useSettingsStore((s) => s.hymnTypes) || []
  const [form, setForm] = useState({ numero: '', titulo: '', tonalidade: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingHymn) {
      setForm({
        numero: editingHymn.numero || '',
        titulo: editingHymn.titulo || '',
        tonalidade: editingHymn.tonalidade || ''
      })
    } else {
      setForm({ numero: '', titulo: '', tonalidade: '' })
    }
    setErrors({})
  }, [editingHymn, isOpen])

  const handleSave = () => {
    console.log('HymnModal: Saving form:', form)
    const newErrors = {}
    if (!form.numero.trim()) newErrors.numero = 'Número obrigatório'
    if (!form.titulo.trim()) newErrors.titulo = 'Título obrigatório'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    console.log('HymnModal: Calling onSave with:', { ...form, numero: form.numero.toUpperCase(), titulo: form.titulo.toUpperCase() }, editingHymn?.id)
    onSave({
      ...form,
      numero: form.numero.toUpperCase(),
      titulo: form.titulo.toUpperCase()
    }, editingHymn?.id)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingHymn ? "Editar Hino" : "Cadastrar Novo Hino"} size="md">
      <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-4">
        <div>
          <label className="label-uppercase mb-2 block">Número</label>
          <input type="text" inputMode="numeric" pattern="[0-9]*" value={form.numero} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setForm(f => ({ ...f, numero: v })) }} placeholder="Ex: 001" className={`input-apple uppercase ${errors.numero ? 'ring-2 ring-red-400' : ''}`} />
          {errors.numero && <span className="text-xs text-red-500 mt-1 block">{errors.numero}</span>}
        </div>
        <div>
          <label className="label-uppercase mb-2 block">Título</label>
          <input type="text" value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Nome do hino" className={`input-apple uppercase ${errors.titulo ? 'ring-2 ring-red-400' : ''}`} />
          {errors.titulo && <span className="text-xs text-red-500 mt-1 block">{errors.titulo}</span>}
        </div>
        <div>
          <label className="label-uppercase mb-2 block">Tipo de Hino</label>
<Select
              options={[
              { value: '', label: 'Selecione o tipo...' },
              ...hymnTypes,
              ...(form.tonalidade && !hymnTypes.find(t => t.value.toLowerCase() === form.tonalidade.toLowerCase()) ? [{ value: form.tonalidade.toLowerCase(), label: `${form.tonalidade} (Legado)` }] : [])
            ]}
            value={form.tonalidade?.toLowerCase()}
            onChange={(val) => setForm(f => ({ ...f, tonalidade: val }))}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-apple-secondary flex-1">Cancelar</button>
          <button type="submit" className="btn-apple-primary flex-1">{editingHymn ? "Salvar Alterações" : "Salvar Hino"}</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── HistoricoTab ─────────────────────────────────────────────────────────────
function HistoricoTab({ onEditarProgramacao, onExcluirProgramacao }) {
  const navigate = useNavigate()
  const programHistory = useHymnsStore((s) => s.programHistory)
  const fetchProgramHistory = useHymnsStore((s) => s.fetchProgramHistory)
  const getHymnById = useHymnsStore((s) => s.getHymnById)

  const meetingTypes = useSettingsStore((s) => s.meetingTypes) || []
  const hymnTypes = useSettingsStore((s) => s.hymnTypes) || []
  const members = useMembersStore((s) => s.members) || []
  const conductors = members.filter(m => m.status === 'Ativo' && m.cargo && m.cargo.toLowerCase().includes('regente'))

  const [expanded, setExpanded] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [filterTipoReuniao, setFilterTipoReuniao] = useState('')
  const [filterTipoHino, setFilterTipoHino] = useState('')
  const [filterRegente, setFilterRegente] = useState('')

  useEffect(() => { fetchProgramHistory() }, [])

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const handleExcluir = (progId) => {
    if (onExcluirProgramacao) {
      onExcluirProgramacao(progId)
    }
  }

  const handleEditar = (prog) => {
    const hinos = Array.isArray(prog.hinos_json) ? prog.hinos_json : []
    const programacaoeditavel = {
      id: prog.id,
      data: prog.data,
      tipo: prog.tipo_culto || prog.contexto,
      responsavel: prog.responsavel,
      hinos: hinos
    }
    if (onEditarProgramacao) {
      onEditarProgramacao(programacaoeditavel)
    }
  }

  if (programHistory.length === 0) {
    return (
      <div className="apple-card p-8">
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-gray-300 dark:text-gray-500" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Nenhuma programação salva</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">As programações confirmadas aparecerão aqui.</p>
        </div>
      </div>
    )
  }

  const filteredHistory = programHistory.filter(prog => {
    const term = searchTerm.toLowerCase()
    const hinos = Array.isArray(prog.hinos_json) ? prog.hinos_json : []

    const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const termNorm = normalize(term || '').toLowerCase()

    const matchesTerm = !term ||
      normalize(prog.tipo_culto || prog.contexto || '').toLowerCase().includes(termNorm) ||
      normalize(prog.responsavel || '').toLowerCase().includes(termNorm) ||
      hinos.some(hymnItem => {
        const id = typeof hymnItem === 'object' ? hymnItem.id : hymnItem
        const hymn = getHymnById(id)
        return hymn && (normalize(hymn.titulo || '').toLowerCase().includes(termNorm) || (String(hymn.numero) || '').toLowerCase().includes(term))
      })
    const matchesDate = !searchDate || prog.data === searchDate
    const matchesTipoReuniao = !filterTipoReuniao || (prog.tipo_culto || prog.contexto) === filterTipoReuniao

    const matchesTipoHino = !filterTipoHino || hinos.some(hymnItem => {
      const id = typeof hymnItem === 'object' ? hymnItem.id : hymnItem
      const hymn = getHymnById(id)
      return hymn && hymn.tonalidade?.toLowerCase() === filterTipoHino?.toLowerCase()
    })

    const matchesRegente = !filterRegente || hinos.some(hymnItem => {
      const regente = typeof hymnItem === 'object' ? hymnItem.regente : ''
      return regente === filterRegente
    })

    return matchesTerm && matchesDate && matchesTipoReuniao && matchesTipoHino && matchesRegente
  })

  return (
    <div className="space-y-4">
      {(() => {
        const hasActiveFilters = searchTerm || searchDate || filterTipoReuniao || filterTipoHino || filterRegente
        const activeCount = [searchTerm, searchDate, filterTipoReuniao, filterTipoHino, filterRegente].filter(Boolean).length
        const clearFilters = () => { setSearchTerm(''); setSearchDate(''); setFilterTipoReuniao(''); setFilterTipoHino(''); setFilterRegente('') }
        return (
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Search size={14} />
                Filtros
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                    {activeCount}
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X size={13} />
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Data</label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="input-apple w-full"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Buscar</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      placeholder="Hino, número ou título..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-apple pl-8 text-sm w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tipo de Reunião</label>
                  <Select
                    options={[{ value: '', label: 'Todos' }, ...meetingTypes]}
                    value={filterTipoReuniao}
                    onChange={(val) => setFilterTipoReuniao(val)}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tipo de Hino</label>
                  <Select
                    options={[{ value: '', label: 'Todos' }, ...hymnTypes]}
                    value={filterTipoHino}
                    onChange={(val) => setFilterTipoHino(val)}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Regente</label>
                  <Select
                    options={[{ value: '', label: 'Todos' }, ...conductors.map(c => ({ value: c.nome, label: c.nome }))]}
                    value={filterRegente}
                    onChange={(val) => setFilterRegente(val)}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {filteredHistory.length === 0 ? (
        <div className="apple-card p-8 text-center text-gray-500 dark:text-gray-400">
          Nenhuma programação encontrada.
        </div>
      ) : (
        filteredHistory.map((prog) => {
          const hinos = Array.isArray(prog.hinos_json) ? prog.hinos_json : []
          const isExpanded = expanded[prog.id]
          return (
            <div key={prog.id} className="apple-card p-5">
              <button onClick={() => toggleExpand(prog.id)} className="w-full text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#007AFF]" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(prog.data)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">({getDayOfWeek(prog.data)})</span>
                      </span>
                      <span className="badge-info">{meetingTypes.find(m => m.value === (prog.tipo_culto || prog.contexto))?.label || prog.tipo_culto || prog.contexto}</span>
                    </div>
                    {prog.responsavel && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Responsável: {prog.responsavel}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      {hinos.length} {hinos.length === 1 ? 'hino' : 'hinos'}
                    </span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  {hinos.map((hymnId, idx) => {
                    const isObj = typeof hymnId === 'object';
                    const id = isObj ? hymnId.id : hymnId;
                    const regente = isObj ? hymnId.regente : '';
                    const solista = isObj ? hymnId.solista : '';
                    const piano = isObj ? hymnId.piano || '' : '';
                    const violao = isObj ? hymnId.violao || '' : '';
                    const hymn = getHymnById(id)
                    if (!hymn) return null
                    const tipoLabel = hymnTypes.find(t => t.value.toLowerCase() === hymn.tonalidade?.toLowerCase())?.label || hymn.tonalidade
                    return (
                      <div key={`${prog.id}-${id}-${idx}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-[#007AFF] font-semibold text-sm">Nº {hymn.numero}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{hymn.titulo}</span>
                        {tipoLabel && <span className="text-xs text-gray-400 dark:text-gray-500">Tipo: {tipoLabel}</span>}
                        {regente && <span className="text-xs text-gray-400 dark:text-gray-500 border-l border-gray-300 dark:border-gray-600 pl-2">Regente: {regente}</span>}
                        {(() => {
                          const solistas = Array.isArray(solista) ? solista : (solista ? [solista] : []);
                          if (solistas.length === 0) return null;
                          return <span className="text-xs text-gray-400 dark:text-gray-500 border-l border-gray-300 dark:border-gray-600 pl-2">Solista: {solistas.join(', ')}</span>;
                        })()}
                        {piano && <span className="text-xs text-emerald-600 dark:text-emerald-400 border-l border-gray-300 dark:border-gray-600 pl-2">Piano: {piano}</span>}
                        {violao && <span className="text-xs text-amber-600 dark:text-amber-400 border-l border-gray-300 dark:border-gray-600 pl-2">Violão: {violao}</span>}
                      </div>
                    )
                  })}
                  <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 pt-2">
                    <button onClick={() => handleEditar(prog)} className="w-full sm:flex-1 py-2 text-sm font-medium text-[#007AFF] border border-dashed border-[#007AFF]/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2">
                      <Edit2 size={16} /> Editar
                    </button>
                    <button
                      onClick={() => navigate('/impressao', {
                        state: {
                          programId: prog.id,
                          hymns: Array.isArray(prog.hinos_json) ? prog.hinos_json : [],
                          meta: { data: prog.data, tipo: prog.tipo_culto || prog.contexto, responsavel: prog.responsavel },
                          layout: prog.layout_json,
                          fromTab: 'historico'
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
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── ProgramacaoForm ─────────────────────────────────────────────────────────
function ProgramacaoForm({ programacaoEditando, onLimparEdicao, onCancelarEdicao }) {
  const navigate = useNavigate()
  const hymns = useHymnsStore((s) => s.hymns)
  const todayProgram = useHymnsStore((s) => s.todayProgram)
  const addToTodayProgram = useHymnsStore((s) => s.addToTodayProgram)
  const removeFromTodayProgram = useHymnsStore((s) => s.removeFromTodayProgram)
  const reorderTodayProgram = useHymnsStore((s) => s.reorderTodayProgram)
  const confirmTodayProgram = useHymnsStore((s) => s.confirmTodayProgram)
  const updateProgramacao = useHymnsStore((s) => s.updateProgramacao)
  const updateHymn = useHymnsStore((s) => s.updateHymn)
  const addHymn = useHymnsStore((s) => s.addHymn)
  const searchHymns = useHymnsStore((s) => s.searchHymns)
  const setTodayProgram = useHymnsStore((s) => s.setTodayProgram)
  const updateTodayProgramItem = useHymnsStore((s) => s.updateTodayProgramItem)
  const meetingTypes = useSettingsStore((s) => s.meetingTypes)
  const showToast = useToastStore((s) => s.showToast)

  const [searchTerm, setSearchTerm] = useState('')
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0])
  const [serviceType, setServiceType] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [hymnModalOpen, setHymnModalOpen] = useState(false)
  const [editingHymn, setEditingHymn] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})
  const [draggedIdx, setDraggedIdx] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [selectedTipo, setSelectedTipo] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!serviceType) newErrors.serviceType = true
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    const user = useAuthStore.getState().user
    const userName = user?.name || ''
    if (programacaoEditando) {
      setServiceDate(programacaoEditando.data || new Date().toISOString().split('T')[0])
      setServiceType(programacaoEditando.tipo || '')
      setResponsavel(programacaoEditando.responsavel || userName)
    } else if (!serviceType) {
      setResponsavel(userName)
    }
  }, [programacaoEditando])

  // Resetar página quando filtros mudarem
  useEffect(() => { setPage(1) }, [searchTerm, selectedTipo])

  // Mapa de hinos por ID para busca O(1)
  const hymnsById = useMemo(() => {
    const map = {}
    hymns.forEach(h => { map[h.id] = h })
    return map
  }, [hymns])

  // Contagem de hinos por tipo (para exibir nas opções do select)
  const tiposComContagem = useMemo(() => {
    const counts = {}
    hymns.forEach(h => { if (h.tonalidade) counts[h.tonalidade] = (counts[h.tonalidade] || 0) + 1 })
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))
  }, [hymns])

  const PAGE_SIZE = 30
  const [page, setPage] = useState(1)
  const allFiltered = useMemo(() => {
    const byText = searchHymns(searchTerm)
    if (!selectedTipo) return byText
    return byText.filter(h => h.tonalidade === selectedTipo)
  }, [searchHymns, searchTerm, selectedTipo])
  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE)
  const filteredHymns = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return allFiltered.slice(start, start + PAGE_SIZE)
  }, [allFiltered, page])
  const programHymns = useMemo(() => todayProgram.map(item => {
    if (typeof item === 'object' && item.type === 'custom') return item;
    const id = typeof item === 'object' ? item.id : item;
    const regente = typeof item === 'object' ? item.regente || '' : '';
    const rawSolista = typeof item === 'object' ? item.solista : '';
    const solista = Array.isArray(rawSolista) ? rawSolista : (rawSolista ? [rawSolista] : []);
    const piano = typeof item === 'object' ? item.piano || '' : '';
    const violao = typeof item === 'object' ? item.violao || '' : '';
    const h = hymnsById[id]
    return h ? { ...h, regente, solista, piano, violao } : null;
  }).filter(Boolean), [todayProgram, hymnsById])

  const handleAddHymn = (hymn) => addToTodayProgram(hymn.id)
  const handleRemove = (id) => removeFromTodayProgram(id)
  const handleUpdateRegente = (id, regente) => updateTodayProgramItem(id, { regente })
  const handleUpdateSolista = (id, solista) => updateTodayProgramItem(id, { solista })
  const handleUpdatePiano = (id, piano) => updateTodayProgramItem(id, { piano })
  const handleUpdateViolao = (id, violao) => updateTodayProgramItem(id, { violao })
  const handleMove = (idx, dir) => {
    const arr = [...todayProgram]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= arr.length) return
      ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
    reorderTodayProgram(arr)
  }

  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    // Necessário para compatibilidade com navegadores mais antigos (ex: Firefox)
    if (e.dataTransfer.setData) e.dataTransfer.setData('text/plain', idx)

    // Pequeno delay visual para clarear o item original sendo arrastado e criar o efeito de 'fantasma'
    setTimeout(() => {
      if (e.target && e.target.classList) e.target.classList.add('opacity-40', 'border-blue-400')
    }, 0)
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault() // Permite que o item seja solto
    if (draggedIdx === null || draggedIdx === idx) return

    // Reordena a matriz ao vivo para criar uma experiência mágica e responsiva
    const newProgram = [...todayProgram]
    const draggedItem = newProgram[draggedIdx]
    newProgram.splice(draggedIdx, 1)
    newProgram.splice(idx, 0, draggedItem)

    reorderTodayProgram(newProgram)
    setDraggedIdx(idx)
  }

  const handleDragEnd = (e) => {
    setDraggedIdx(null)
    if (e.target && e.target.classList) e.target.classList.remove('opacity-40', 'border-blue-400')
  }

  const handleSaveHymn = async (form, id) => {
    try {
      if (id) {
        await updateHymn(id, form)
        showToast('Hino atualizado com sucesso!')
      } else {
        const newHymn = await addHymn(form)
        if (newHymn) addToTodayProgram(newHymn.id)
        showToast('Hino cadastrado com sucesso!')
      }
      setHymnModalOpen(false)
      setEditingHymn(null)
    } catch (error) {
      console.error("Erro ao salvar hino", error)
    }
  }

  const openEditHymn = (hymn) => {
    setEditingHymn(hymn)
    setHymnModalOpen(true)
  }

  const handleConfirm = async () => {
    if (todayProgram.length === 0) return
    if (!validate()) {
      showToast('Por favor, selecione o Tipo de Reunião para continuar.', 'error')
      return
    }
    setSaving(true)
    try {
      const programToSave = todayProgram.map(item => {
        const id = typeof item === 'object' ? item.id : item;
        const regente = typeof item === 'object' ? item.regente || '' : '';
        const rawSolista = typeof item === 'object' ? item.solista : '';
        const solista = Array.isArray(rawSolista) ? rawSolista : (rawSolista ? [rawSolista] : []);
        const piano = typeof item === 'object' ? item.piano || '' : '';
        const violao = typeof item === 'object' ? item.violao || '' : '';
        return { id, regente, solista, piano, violao };
      });

      if (programacaoEditando?.id) {
        await updateProgramacao(programacaoEditando.id, serviceDate, serviceType, responsavel, programToSave)
      } else {
        await confirmTodayProgram(serviceDate, serviceType, responsavel, programToSave)
      }
      setSaved(true)
      if (onLimparEdicao) onLimparEdicao()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="apple-card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Data</label>
              <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className="input-apple w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tipo de Reunião</label>
              <Select
                options={[{ value: '', label: 'Selecionar...' }, ...meetingTypes]}
                value={serviceType}
                onChange={(val) => setServiceType(val)}
                className={`${errors.serviceType ? 'ring-2 ring-red-400' : ''}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Responsável</label>
              <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do responsável" className="input-apple w-full" />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left — Acervo */}
          <div className="md:col-span-5 space-y-4">
            <div className="apple-card p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Music size={18} className="text-[#007AFF]" /> Acervo de Hinos
                </h3>
                <span className="badge-info">{allFiltered.length} {allFiltered.length === 1 ? 'Hino' : 'Hinos'}</span>
              </div>
              <div className="flex gap-2 mb-3 shrink-0">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por número ou título..." className="input-apple pl-10 w-full" />
                </div>
                <div className="w-40 shrink-0">
                  <Select
                    options={[{ value: '', label: 'Todos os tipos' }, ...tiposComContagem.map(([tipo]) => ({ value: tipo, label: tipo.toUpperCase() }))]}
                    value={selectedTipo}
                    onChange={(val) => setSelectedTipo(val)}
                    sortOptions={false}
                  />
                </div>
              </div>
              <button onClick={() => { setEditingHymn(null); setHymnModalOpen(true); }} className="w-full mb-3 text-sm font-medium text-[#007AFF] hover:text-[#0062CC] flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed border-[#007AFF]/30 hover:border-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors shrink-0">
                <Plus size={16} /> Novo Hino
              </button>
              <div className="space-y-1 flex-1 max-h-[480px] overflow-y-auto pr-1">
                {filteredHymns.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Nenhum hino encontrado</p>
                ) : (
                  <>
                    {filteredHymns.map((hymn) => (
                      <HymnResultItem key={hymn.id} hymn={hymn} onAdd={handleAddHymn} isAdded={todayProgram.some(item => typeof item === 'object' ? item.id === hymn.id : item === hymn.id)} onEdit={openEditHymn} />
                    ))}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2 pb-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-xs text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:text-gray-700">Anterior</button>
                        <span className="text-xs text-gray-400">{page}/{totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-xs text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:text-gray-700">Proximo</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right — Ordem do Culto */}
          <div className="md:col-span-7">
            <div className="apple-card p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Music size={18} className="text-purple-500" /> Ordem dos Hinos da Reunião
                </h3>
                <div className="flex items-center gap-2">
                  <span className="badge-info">{todayProgram.length} {todayProgram.length === 1 ? 'Hino' : 'Hinos'}</span>
                  {todayProgram.length > 0 && (
                    <button
                      onClick={() => setConfirmClear(true)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Limpar programação"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {todayProgram.length === 0 ? (
                <div className="empty-state flex-1 flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <Music size={32} className="text-gray-300 dark:text-gray-500" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Nenhum hino adicionado</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Busque hinos ao lado para começar</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-2">
                  {programHymns.map((hymn, idx) => hymn && (
                    <ProgrammedHymnItem key={hymn.id} hymn={hymn} index={idx} total={todayProgram.length} onRemove={handleRemove} onMove={handleMove} isFirst={idx === 0} isLast={idx === todayProgram.length - 1} onUpdateRegente={handleUpdateRegente} onUpdateSolista={handleUpdateSolista} onUpdatePiano={handleUpdatePiano} onUpdateViolao={handleUpdateViolao} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} />
                  ))}
                </div>
              )}

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
                  <button
                    onClick={() => {
                      const hymnsWithDetails = todayProgram.map(item => {
                        const id = typeof item === 'object' ? item.id : item
                        const regente = typeof item === 'object' ? item.regente || '' : ''
                        const rawSolista = typeof item === 'object' ? item.solista : ''
                        const solista = Array.isArray(rawSolista) ? rawSolista : (rawSolista ? [rawSolista] : [])
                        const piano = typeof item === 'object' ? item.piano || '' : ''
                        const violao = typeof item === 'object' ? item.violao || '' : ''
                        return { id, regente, solista, piano, violao }
                      })
                      navigate('/impressao', {
                        state: {
                          programId: programacaoEditando?.id || null,
                          hymns: hymnsWithDetails,
                          meta: { data: serviceDate, tipo: serviceType, responsavel },
                          fromTab: 'programar'
                        }
                      })
                    }}
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
            </div>
          </div>
        </div>
      </div>

      <HymnModal isOpen={hymnModalOpen} onClose={() => setHymnModalOpen(false)} onSave={handleSaveHymn} editingHymn={editingHymn} />

      {confirmClear && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmClear(false)} />
          <div className="relative bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Limpar programação</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Tem certeza que deseja remover todos os <strong className="text-gray-900 dark:text-white">{todayProgram.length} hinos</strong> da ordem? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setTodayProgram([]); setConfirmClear(false) }}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30"
              >
                Sim, limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProgrammingPage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'programar')
  const [programacaoEditando, setProgramacaoEditando] = useState(null)
  const [programToDelete, setProgramToDelete] = useState(null)

  const fetchHymns = useHymnsStore((s) => s.fetchHymns)
  const fetchProgramHistory = useHymnsStore((s) => s.fetchProgramHistory)
  const setTodayProgram = useHymnsStore((s) => s.setTodayProgram)
  const deleteProgramacao = useHymnsStore((s) => s.deleteProgramacao)
  const showToast = useToastStore((s) => s.showToast)

  useEffect(() => {
    fetchHymns()
    fetchProgramHistory()
  }, [])

  const handleEditarProgramacao = (prog) => {
    setTodayProgram(prog.hinos)
    setProgramacaoEditando(prog)
    setActiveTab('programar')
  }

  const handleCancelarEdicao = () => {
    setProgramacaoEditando(null)
    setTodayProgram([])
    setActiveTab('historico')
  }

  const handleExcluirProgramacao = (progId) => {
    const prog = useHymnsStore.getState().programHistory.find(p => p.id === progId)
    setProgramToDelete(prog || { id: progId, data: 'selecionada' })
  }

  const confirmarExclusao = async () => {
    if (!programToDelete) return
    try {
      await deleteProgramacao(programToDelete.id)
      setProgramToDelete(null)
      showToast('Programação excluída com sucesso!')
    } catch (err) {
      console.error('Erro ao excluir:', err)
      alert('Erro ao excluir: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'programar' && !programacaoEditando) {
      setTodayProgram([])
    }
  }

  const tabs = [
    { id: 'programar', label: 'Nova Programação', icon: Music },
    { id: 'historico', label: 'Histórico', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen pb-12 bg-[#F5F5F7] dark:bg-[#1C1C1E]">
      <Topbar title="Gestão Igreja" />
      <div className="px-8 max-w-7xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Programação</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Monte e gerencie a ordem da reunião.</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        <div className="animate-fade-in">
          {activeTab === 'programar' && <ProgramacaoForm programacaoEditando={programacaoEditando} onLimparEdicao={() => setProgramacaoEditando(null)} onCancelarEdicao={handleCancelarEdicao} />}
          {activeTab === 'historico' && <HistoricoTab onEditarProgramacao={handleEditarProgramacao} onExcluirProgramacao={handleExcluirProgramacao} />}
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {programToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setProgramToDelete(null)}
          ></div>

          <div className="relative bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Confirmar Exclusão
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir a programação do dia <strong className="text-gray-900 dark:text-white">{formatDate(programToDelete.data)}</strong>? Esta ação não pode ser desfeita e irá recalcular as datas de apresentação dos hinos vinculados.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setProgramToDelete(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}