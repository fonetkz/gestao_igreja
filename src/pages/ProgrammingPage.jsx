import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Music, Trash2, Save, Check, BookOpen, ChevronUp, ChevronDown, GripVertical, Clock, Calendar, Loader2, Edit2 } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import Modal from '../components/ui/Modal'
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

// ─── HymnResultItem ──────────────────────────────────────────────────────────
function HymnResultItem({ hymn, onAdd, isAdded, onEdit }) {
  const daysSince = useHymnsStore((s) => s.daysSinceLastUsed)(hymn.id)
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
          <span className="text-[#007AFF]">#{hymn.numero}</span> — {hymn.titulo}
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
            <span className="text-xs text-gray-400 dark:text-gray-500">Tipo: {hymn.tonalidade}</span>
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
function ProgrammedHymnItem({ hymn, index, onRemove, onMove, isFirst, isLast, onUpdateRegente }) {
  const members = useMembersStore((s) => s.members) || []
  const conductors = members.filter(m => m.status === 'Ativo' && m.cargo && m.cargo.toLowerCase().includes('regente'))

  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex flex-col items-center gap-0.5">
        <button disabled={isFirst} onClick={() => onMove(index, -1)} className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-30">
          <ChevronUp size={16} />
        </button>
        <GripVertical size={14} className="text-gray-300 dark:text-gray-600" />
        <button disabled={isLast} onClick={() => onMove(index, 1)} className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-30">
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[#007AFF] font-bold">#{hymn.numero}</span>
          <span className="font-semibold text-gray-900 dark:text-white truncate">{hymn.titulo}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {hymn.tonalidade && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tipo: {hymn.tonalidade}</p>}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Regente:</span>
            <select
              value={hymn.regente || ''}
              onChange={(e) => onUpdateRegente(hymn.id, e.target.value)}
              className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-400"
            >
              <option value="">Nenhum</option>
              {conductors.map(c => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
              {/* Mantém visível o regente salvo caso ele tenha sido inativado ou seu cargo tenha mudado */}
              {hymn.regente && !conductors.find(c => c.nome === hymn.regente) && (
                <option value={hymn.regente}>{hymn.regente} (Inativo/Legado)</option>
              )}
            </select>
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.numero.trim()) newErrors.numero = 'Número obrigatório'
    if (!form.titulo.trim()) newErrors.titulo = 'Título obrigatório'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    onSave(form, editingHymn?.id)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingHymn ? "Editar Hino" : "Cadastrar Novo Hino"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-uppercase mb-2 block">Número</label>
          <input type="text" value={form.numero} onChange={(e) => setForm(f => ({ ...f, numero: e.target.value }))} placeholder="Ex: 001" className={`input-apple ${errors.numero ? 'ring-2 ring-red-400' : ''}`} />
          {errors.numero && <span className="text-xs text-red-500 mt-1 block">{errors.numero}</span>}
        </div>
        <div>
          <label className="label-uppercase mb-2 block">Título</label>
          <input type="text" value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Nome do hino" className={`input-apple ${errors.titulo ? 'ring-2 ring-red-400' : ''}`} />
          {errors.titulo && <span className="text-xs text-red-500 mt-1 block">{errors.titulo}</span>}
        </div>
        <div>
          <label className="label-uppercase mb-2 block">Tipo de Hino</label>
          <select value={form.tonalidade} onChange={(e) => setForm(f => ({ ...f, tonalidade: e.target.value }))} className="select-apple w-full">
            <option value="">Selecione o tipo...</option>
            {hymnTypes.map(t => (
              <option key={t.id} value={t.label}>{t.label}</option>
            ))}
            {/* Fallback caso existam dados antigos de tonalidade que não estão na lista de tipos */}
            {form.tonalidade && !hymnTypes.find(t => t.label === form.tonalidade) && (
              <option value={form.tonalidade}>{form.tonalidade} (Legado)</option>
            )}
          </select>
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

    const matchesTerm = !term || (prog.tipo_culto || prog.contexto || '').toLowerCase().includes(term) || (prog.responsavel || '').toLowerCase().includes(term)
    const matchesDate = !searchDate || prog.data === searchDate
    const matchesTipoReuniao = !filterTipoReuniao || (prog.tipo_culto || prog.contexto) === filterTipoReuniao

    const matchesTipoHino = !filterTipoHino || hinos.some(hymnItem => {
      const id = typeof hymnItem === 'object' ? hymnItem.id : hymnItem
      const hymn = getHymnById(id)
      return hymn && hymn.tonalidade === filterTipoHino
    })

    const matchesRegente = !filterRegente || hinos.some(hymnItem => {
      const regente = typeof hymnItem === 'object' ? hymnItem.regente : ''
      return regente === filterRegente
    })

    return matchesTerm && matchesDate && matchesTipoReuniao && matchesTipoHino && matchesRegente
  })

  return (
    <div className="space-y-4">
      <div className="apple-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por responsável ou termo livre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
          <div className="w-full sm:w-44">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={filterTipoReuniao}
            onChange={(e) => setFilterTipoReuniao(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
          >
            <option value="">Tipo de Reunião (Todos)</option>
            {meetingTypes.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
          </select>
          <select
            value={filterTipoHino}
            onChange={(e) => setFilterTipoHino(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
          >
            <option value="">Tipo de Hino (Todos)</option>
            {hymnTypes.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
          </select>
          <select
            value={filterRegente}
            onChange={(e) => setFilterRegente(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
          >
            <option value="">Regente (Todos)</option>
            {conductors.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
          </select>
        </div>
      </div>

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
                      <span className="font-semibold text-gray-900 dark:text-white">{formatDate(prog.data)}</span>
                      <span className="badge-info">{prog.tipo_culto || prog.contexto}</span>
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
                    const hymn = getHymnById(id)
                    if (!hymn) return null
                    return (
                      <div key={hymnId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-[#007AFF] font-semibold text-sm">#{hymn.numero}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{hymn.titulo}</span>
                        {hymn.tonalidade && <span className="text-xs text-gray-400 dark:text-gray-500">Tipo: {hymn.tonalidade}</span>}
                        {regente && <span className="text-xs text-gray-400 dark:text-gray-500 border-l border-gray-300 dark:border-gray-600 pl-2 truncate">Regente: {regente}</span>}
                      </div>
                    )
                  })}
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => handleEditar(prog)} className="flex-1 mt-3 py-2 text-sm font-medium text-[#007AFF] border border-dashed border-[#007AFF]/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => handleExcluir(prog.id)} className="flex-1 mt-3 ml-2 py-2 text-sm font-medium text-red-500 border border-dashed border-red-300/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      Excluir
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

  // Estado local para armazenar os regentes selecionados (apenas para exibição na tela)
  const [regentes, setRegentes] = useState({})

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

  const filteredHymns = useMemo(() => searchHymns(searchTerm), [hymns, searchTerm])
  const programHymns = useMemo(() => todayProgram.map(id => {
    const h = hymns.find(h => h.id === id);
    return h ? { ...h, regente: regentes[id] || '' } : null;
  }).filter(Boolean), [todayProgram, hymns, regentes])

  const handleAddHymn = (hymn) => addToTodayProgram(hymn.id)
  const handleRemove = (id) => removeFromTodayProgram(id)
  const handleUpdateRegente = (id, regente) => setRegentes(prev => ({ ...prev, [id]: regente }))
  const handleMove = (idx, dir) => {
    const arr = [...todayProgram]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= arr.length) return
      ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
    reorderTodayProgram(arr)
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
    if (todayProgram.length === 0 || !validate()) return
    setSaving(true)
    try {
      if (programacaoEditando?.id) {
        await updateProgramacao(programacaoEditando.id, serviceDate, serviceType, responsavel)
      } else {
        await confirmTodayProgram(serviceDate, serviceType, responsavel)
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
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <label className="label-uppercase">Data</label>
              <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} className="input-apple w-auto" style={{ colorScheme: 'light' }} />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <label className="label-uppercase">Tipo de Culto</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={`select-apple flex-1 ${errors.serviceType ? 'border-red-400 ring-2 ring-red-400' : ''}`}>
                <option value="">Selecionar...</option>
                {meetingTypes.map((t) => <option key={t.id} value={t.label}>{t.label}</option>)}
              </select>
              {errors.serviceType && <span className="text-xs text-red-500 mt-1">Selecione o tipo de reunião</span>}
            </div>
            <div className="flex items-center gap-2">
              <label className="label-uppercase">Responsável</label>
              <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do responsável" className="input-apple w-48" />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left — Acervo */}
          <div className="md:col-span-5 space-y-4">
            <div className="apple-card p-4 flex flex-col h-full">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 shrink-0">
                <Music size={18} className="text-[#007AFF]" /> Acervo de Hinos
              </h3>
              <div className="relative mb-3 shrink-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por número ou título..." className="input-apple pl-9" />
              </div>
              <button onClick={() => { setEditingHymn(null); setHymnModalOpen(true); }} className="w-full mb-3 text-sm font-medium text-[#007AFF] hover:text-[#0062CC] flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed border-[#007AFF]/30 hover:border-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors shrink-0">
                <Plus size={16} /> Novo Hino
              </button>
              <div className="space-y-1 flex-1 max-h-[480px] overflow-y-auto pr-1">
                {filteredHymns.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Nenhum hino encontrado</p>
                ) : (
                  filteredHymns.map((hymn) => (
                    <HymnResultItem key={hymn.id} hymn={hymn} onAdd={handleAddHymn} isAdded={todayProgram.includes(hymn.id)} onEdit={openEditHymn} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right — Ordem do Culto */}
          <div className="md:col-span-7">
            <div className="apple-card p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Music size={18} className="text-purple-500" /> Ordem do Culto
                </h3>
                <span className="badge-info">{todayProgram.length} {todayProgram.length === 1 ? 'Hino' : 'Hinos'}</span>
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
                    <ProgrammedHymnItem key={hymn.id} hymn={hymn} index={idx} total={todayProgram.length} onRemove={handleRemove} onMove={handleMove} isFirst={idx === 0} isLast={idx === todayProgram.length - 1} onUpdateRegente={handleUpdateRegente} />
                  ))}
                </div>
              )}

              {todayProgram.length > 0 && (
                <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-700 flex gap-3 shrink-0">
                  {programacaoEditando && (
                    <button
                      onClick={onCancelarEdicao || onLimparEdicao}
                      disabled={saving}
                      className="btn-apple-secondary flex-1 py-3"
                    >
                      Cancelar Edição
                    </button>
                  )}
                  <button onClick={handleConfirm} disabled={saving || saved} className="btn-apple-primary flex-1 py-3">
                    {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : saved ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> {programacaoEditando ? 'Salvar Alterações' : 'Salvar Programação'}</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <HymnModal isOpen={hymnModalOpen} onClose={() => setHymnModalOpen(false)} onSave={handleSaveHymn} editingHymn={editingHymn} />
    </>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProgrammingPage() {
  const [activeTab, setActiveTab] = useState('programar')
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
        <div className="flex items-center justify-between mb-6">
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