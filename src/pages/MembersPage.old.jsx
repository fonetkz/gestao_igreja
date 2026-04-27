import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { UserPlus, Mail, RotateCcw, Users2, Edit2, X, ClipboardCheck, Save, CheckCircle, Bell, AlertTriangle, Calendar, Check, RefreshCw, Search, History, Trash2, ChevronDown, ChevronUp, Plus, Activity, Cake } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { Input } from '../components/ui/Input'
import Select from '../components/ui/Select'
import RadioGroup from '../components/ui/RadioGroup'
import Checkbox from '../components/ui/Checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import useMembersStore from '../store/membersStore'
import useSettingsStore from '../store/settingsStore'

const safeParseInt = (value) => {
  if (value === null || value === undefined) return 0
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? 0 : parsed
}

const safeParseJson = (jsonStr, defaultValue = []) => {
  try {
    if (!jsonStr) return defaultValue
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? parsed : defaultValue
  } catch {
    return defaultValue
  }
}

function CadastroTab() {
  const members = useMembersStore((s) => s.members)
  const addMember = useMembersStore((s) => s.addMember)
  const updateMember = useMembersStore((s) => s.updateMember)
  const removeMember = useMembersStore((s) => s.removeMember)
  const activeCount = useMembersStore((s) => s.getActiveCount)()
  const positions = useSettingsStore((s) => s.positions)
  const voiceOptions = useSettingsStore((s) => s.voices) || []
  const instrumentOptions = useSettingsStore((s) => s.instruments) || []
  const statuses = useSettingsStore((s) => s.statuses) || []

  const isVoice = (v) => voiceOptions.some(voice => voice.value === v || voice.label === v)

  const [form, setForm] = useState({ nome: '', instrumentos: [], vozes: [], cargos: [], telefone: '', data_nascimento: '', status: 'Ativo' })
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (form.instrumentos.length === 0 && form.vozes.length === 0) newErrors.music = 'Adicione pelo menos um naipe, instrumento ou voz'
    if (form.cargos.length === 0) newErrors.cargos = 'Adicione pelo menos um cargo ou função'

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    const allMusic = [...form.vozes, ...form.instrumentos].join(', ')

    const payload = {
      nome: form.nome,
      instrumento_voz: allMusic,
      secao: allMusic,
      cargo: form.cargos.join(', '),
      telefone: form.telefone,
      data_nascimento: form.data_nascimento,
      status: form.status,
    }

    if (editingMember) {
      await updateMember(editingMember.id, payload)
    } else {
      await addMember(payload)
    }

    setForm({ nome: '', instrumentos: [], vozes: [], cargos: [], telefone: '', data_nascimento: '', status: 'Ativo' })
    setEditingMember(null)
    setModalOpen(false)
    setErrors({})
  }

const handleEditClick = (member) => {
    setEditingMember(member)
    const allMusic = member.instrumento_voz ? member.instrumento_voz.split(', ') : (member.secao ? member.secao.split(', ') : [])
    setForm({
      nome: member.nome || '',
      vozes: allMusic.filter(i => isVoice(i)),
      instrumentos: allMusic.filter(i => !isVoice(i)),
      cargos: member.cargo ? member.cargo.split(', ') : [],
      telefone: member.telefone || '',
      data_nascimento: member.data_nascimento || '',
      status: member.status || 'Ativo'
    })
    setModalOpen(true)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({ nome: '', instrumentos: [], vozes: [], cargos: [], telefone: '', data_nascimento: '', status: 'Ativo' })
    setErrors({})
    setShowForm(false)
  }


  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.slice(0, 11)
    if (val.length <= 2) {
      val = val
    } else if (val.length <= 7) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`
    } else {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
    }
    setForm(f => ({ ...f, telefone: val }))
  }

  const filtered = members.filter(m => {
    if (statusFilter !== 'Todos' && m.status !== statusFilter) return false
    if (birthMonthFilter) {
      if (!m.data_nascimento) return false
      const [, month] = m.data_nascimento.split('-')
      if (month !== birthMonthFilter) return false
    }
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (m.nome || '').toLowerCase().includes(term) || (m.instrumento_voz || '').toLowerCase().includes(term) || (m.secao || '').toLowerCase().includes(term) || (m.cargo || '').toLowerCase().includes(term)
  })

  const sortedMembers = [...filtered].sort((a, b) => {
    if (a.status === 'Desativado' && b.status !== 'Desativado') return 1
    if (a.status !== 'Desativado' && b.status === 'Desativado') return -1
    return b.id - a.id
  })
  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage)
  const paginatedMembers = sortedMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const today = new Date()
  const dateStr = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(today)
  const activos = members.filter(m => m.status === 'Ativo').length
  const inativos = members.filter(m => m.status !== 'Ativo').length
  const birthdayCount = members.filter(m => { if (!m.data_nascimento) return false; const month = m.data_nascimento.split('-')[1]; return month === String(new Date().getMonth() + 1).padStart(2, '0'); }).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Membros da Orquestra</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Acompanhe dados cadastrais, frequências e status.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={Plus}>Adicionar Membro</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Membros Ativos</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{activos}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <Users2 size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Inativos</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{inativos}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
            <Users2 size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Aniversariantes do Mês</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{birthdayCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input placeholder="Buscar músico, naipe ou instrumento..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10" />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Select options={[{ value: '', label: 'Status: Todos' }, ...statuses]} value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} className="w-full sm:w-40" />
          </div>
        </div>
        <div className="overflow-x-auto">
           {paginatedMembers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users2 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum membro encontrado</p>
            </div>
          ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="px-4 py-3 label-uppercase">Músico</th>
                <th className="px-4 py-3 label-uppercase">Voz / Instrumento</th>
                <th className="px-4 py-3 label-uppercase">Cargo / Função</th>
                <th className="px-4 py-3 label-uppercase">Nascimento</th>
                <th className="px-4 py-3 label-uppercase">Status</th>
                <th className="px-4 py-3 label-uppercase text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Avatar name={member.nome} initials={member.iniciais} size="md" />
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{member.nome}</p>
                        {member.telefone && <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{member.telefone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {member.secao && member.secao.split(', ').map(s => <span key={s} className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold ${isVoice(s) ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'}`}>{s}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {member.cargo && member.cargo.split(', ').map(c => <span key={c} className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[11px] font-bold text-blue-700 dark:text-blue-400">{c}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {member.data_nascimento ? new Intl.DateTimeFormat('pt-BR').format(new Date(member.data_nascimento)) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${member.status === 'Ativo' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleEditClick(member)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</Button>
              <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próxima</Button>
            </div>
          </div>
)}
        </div>
      </div>
    </div>
  )
}
// placeholder
function ChamadaTab() {
  const members = useMembersStore((s) => s.members)
  const saveAttendance = useMembersStore((s) => s.saveAttendance)
  const attendanceContexts = useSettingsStore((s) => s.attendanceContexts) || []
  const activeMembers = members.filter(m => m.status === 'Ativo')

  const [dataChamada, setDataChamada] = useState(new Date().toISOString().split('T')[0])
  const [contexto, setContexto] = useState(attendanceContexts[0]?.value || 'Ensaio Geral')
  const [presencas, setPresencas] = useState({})
  const [justificativas, setJustificativas] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const voices = useSettingsStore(s => s.voices) || []

  const handleToggle = (id) => setPresencas(prev => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const registros = activeMembers.map(m => ({ membro_id: m.id, presente: presencas[m.id] === undefined ? true : presencas[m.id], justificativa: presencas[m.id] === false ? (justificativas[m.id] || '') : '' }))
      await saveAttendance(dataChamada, contexto, registros)
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setPresencas({}); setJustificativas({}) }, 3000)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filtered = activeMembers.filter(m => m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || (m.secao || '').toLowerCase().includes(searchTerm.toLowerCase()))
  const sortedMembersForCall = [...filtered].sort((a, b) => a.nome.localeCompare(b.nome))
  const isVoice = (v) => voices.some(voice => voice.value === v || voice.label === v)

  const isPresent = (id) => presencas[id] === undefined ? true : presencas[id]
  const presentesCount = activeMembers.filter(m => isPresent(m.id)).length
  const faltasCount = activeMembers.length - presentesCount

  return (
    <div className="animate-fade-in space-y-6">
      <Card padding="large">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Data da Chamada" type="date" value={dataChamada} onChange={(e) => setDataChamada(e.target.value)} />
            <Select label="Contexto / Reunião" options={attendanceContexts} value={contexto} onChange={setContexto} />
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Button size="lg" icon={success ? CheckCircle : Save} onClick={handleSubmit} variant={success ? 'neutral' : 'primary'} loading={loading} className="w-full md:w-auto">{success ? 'Chamada Registrada!' : 'Salvar Chamada'}</Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              <span className="text-emerald-600 dark:text-emerald-400">{presentesCount} Presentes</span>
              <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
              <span className="text-red-600 dark:text-red-400">{faltasCount} Faltas</span>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <Input placeholder="Buscar músico..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          {sortedMembersForCall.map(m => {
            const present = isPresent(m.id)
            return (
              <div key={m.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${present ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10' : 'border-red-200 bg-white dark:border-red-900/30 dark:bg-red-900/10 shadow-sm'}`}>
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handleToggle(m.id)}>
                  <Avatar name={m.nome} initials={m.iniciais} size="md" />
                  <div className="flex flex-col">
                    <p className={`text-base font-bold ${present ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{m.nome}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {m.secao && m.secao.split(', ').map(s => <span key={s} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${isVoice(s) ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'}`}>{s}</span>)}
                      {m.cargo && m.cargo.split(', ').map(c => <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-[10px] font-bold tracking-wide uppercase text-blue-700 dark:text-blue-400">{c}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 sm:mt-0">
                  {!present && (
                    <div className="w-full sm:w-64 animate-fade-in" onClick={e => e.stopPropagation()}>
                      <input type="text" placeholder="Motivo da falta (opcional)..." value={justificativas[m.id] || ''} onChange={(e) => setJustificativas(prev => ({ ...prev, [m.id]: e.target.value }))} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800/50 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 text-slate-900 dark:text-white placeholder:text-red-300 transition-all" />
                    </div>
                  )}
                  <div className="cursor-pointer shrink-0" onClick={() => handleToggle(m.id)}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${present ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-100' : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent scale-95 hover:scale-100'}`}>
                      <CheckCircle size={18} className={present ? 'opacity-100' : 'opacity-0'} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export default function MembersPage() {
  const members = useMembersStore((s) => s.members)
  const hasAlerts = members.some(m => m.faltas_mes_atual >= 2)
  const attendance = useMembersStore((s) => s.attendance || [])
  const updateCall = useMembersStore((s) => s.updateCall)
  const deleteCall = useMembersStore((s) => s.deleteCall)
  const updateMember = useMembersStore((s) => s.updateMember)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [expandedCalls, setExpandedCalls] = useState({})
  const [expandedSearch, setExpandedSearch] = useState({})
  const [editingJustification, setEditingJustification] = useState(null)
  const [justificationText, setJustificationText] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const [draftCall, setDraftCall] = useState(null)
  const [alertsMonth, setAlertsMonth] = useState(new Date().toISOString().slice(0, 7))
  const [expandedAlert, setExpandedAlert] = useState(null)
  const [alertJustText, setAlertJustText] = useState('')
  const [editingAlertJust, setEditingAlertJust] = useState(null)
  const voices = useSettingsStore(s => s.voices) || []

  const toggleExpand = (id) => {
    if (expandedCalls[id]) {
      setExpandedCalls(prev => ({ ...prev, [id]: false }))
      if (draftCall?.id === id) setDraftCall(null)
      setEditingJustification(null)
    } else {
      const call = attendance.find(c => c.id === id)
      if (call) {
        setDraftCall({ id, registros: JSON.parse(JSON.stringify(call.registros_json || [])) })
      }
      setExpandedCalls(prev => ({ ...prev, [id]: true }))
    }
  }
  const getMemberName = (id) => { const m = members.find(x => String(x.id) === String(id)); return m?.nome || `ID: ${id}` }
  const formatDate = (d) => d ? d.split('T')[0].split('-').reverse().join('/') : ''

  const recentCalls = [...attendance]
    .filter(c => {
      const matchesContext = !historySearch || (c.contexto || '').toLowerCase().includes(historySearch.toLowerCase())
      const matchesDate = !searchDate || c.data === searchDate
      return matchesContext && matchesDate
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data))

  const totalPages = Math.ceil(recentCalls.length / itemsPerPage)
  const paginatedCalls = recentCalls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Lógica dinâmica para gerar membros problemáticos baseados no mês selecionado
  const currentMonthCalls = attendance.filter(c => c.data && c.data.startsWith(alertsMonth))
  const memberAbsences = {}

  currentMonthCalls.forEach(call => {
    const regs = Array.isArray(call.registros_json) ? call.registros_json : []
    regs.forEach(r => {
      if (!r.presente) {
        if (!memberAbsences[r.membro_id]) memberAbsences[r.membro_id] = []
        memberAbsences[r.membro_id].push({ call, justificativa: r.justificativa })
      }
    })
  })

  const dynamicProblematic = Object.entries(memberAbsences)
    .filter(([mId, absences]) => absences.length >= 2)
    .map(([mId, absences]) => {
      const m = members.find(x => String(x.id) === String(mId))
      return {
        id: mId,
        nome: m?.nome || 'Membro Excluído',
        secao: m?.secao || '',
        cargo: m?.cargo || '',
        iniciais: m?.iniciais || '',
        faltas_mes_atual: absences.length,
        absences: absences.sort((a, b) => new Date(b.call.data) - new Date(a.call.data))
      }
    })
    .sort((a, b) => b.faltas_mes_atual - a.faltas_mes_atual)

  const filteredAlerts = !searchTerm.trim() ? dynamicProblematic : dynamicProblematic.filter(m => (m.nome || '').toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSaveAlertJustification = async (chamadaId, membroId) => {
    const call = attendance.find(c => c.id === chamadaId)
    if (!call) return
    const updated = call.registros_json.map(r => String(r.membro_id) === String(membroId) ? { ...r, justificativa: alertJustText } : r)
    await updateCall(chamadaId, updated)
    setEditingAlertJust(null)
  }

  const handleAbonarFalta = async (chamadaId, membroId) => {
    const call = attendance.find(c => c.id === chamadaId)
    if (!call) return
    const updated = call.registros_json.map(r => String(r.membro_id) === String(membroId) ? { ...r, presente: true } : r)
    await updateCall(chamadaId, updated)

    const currentMonthPrefix = new Date().toISOString().slice(0, 7)
    if (call.data.startsWith(currentMonthPrefix)) {
      const member = members.find(m => String(m.id) === String(membroId))
      if (member) await updateMember(member.id, { faltas_mes_atual: Math.max(0, (Number(member.faltas_mes_atual) || 0) - 1) })
    }
  }

  const handleEditJustification = (chamadaId, membroId, currentJustification) => {
    setEditingJustification(`${chamadaId}-${membroId}`)
    setJustificationText(currentJustification || '')
  }

  const handleTogglePresence = (chamadaId, membroId) => {
    if (!draftCall || draftCall.id !== chamadaId) return
    const updated = draftCall.registros.map(r => {
      if (String(r.membro_id) === String(membroId)) {
        return { ...r, presente: !r.presente }
      }
      return r
    })
    setDraftCall({ ...draftCall, registros: updated })
  }

  const handleSaveJustification = (chamadaId, membroId) => {
    if (!draftCall || draftCall.id !== chamadaId) return
    const updated = draftCall.registros.map(r => {
      if (String(r.membro_id) === String(membroId)) {
        return { ...r, justificativa: justificationText }
      }
      return r
    })
    setDraftCall({ ...draftCall, registros: updated })
    setEditingJustification(null)
  }

  const handleSaveList = async (chamadaId) => {
    if (!draftCall || draftCall.id !== chamadaId) return
    const originalCall = attendance.find(c => c.id === chamadaId)
    if (!originalCall) return

    for (const draftReg of draftCall.registros) {
      const origReg = originalCall.registros_json.find(r => String(r.membro_id) === String(draftReg.membro_id))
      if (origReg && origReg.presente !== draftReg.presente) {
        const member = members.find(m => String(m.id) === String(draftReg.membro_id))
        if (member) {
          const currentFaltas = Number(member.faltas_mes_atual) || 0
          const newFaltas = origReg.presente && !draftReg.presente ? currentFaltas + 1 : Math.max(0, currentFaltas - 1)
          await updateMember(member.id, { faltas_mes_atual: newFaltas })
        }
      }
    }

    await updateCall(chamadaId, draftCall.registros)
    setExpandedCalls(prev => ({ ...prev, [chamadaId]: false }))
    setDraftCall(null)
    setEditingJustification(null)
  }

  const handleCancelJustification = () => {
    setEditingJustification(null)
    setJustificationText('')
  }

  return (
    <div className="min-h-screen pb-12">
      <Topbar title="Choir Deck" />
      <div className="px-8 max-w-7xl mx-auto mt-12">
        <PageHeader label="Diretório" title="Gestão de Membros" subtitle="Acompanhe dados cadastrais, frequências e status da sua orquestra." />
        <Tabs defaultValue="cadastro" className="animate-slide-up">
          <TabsList>
            <TabsTrigger value="cadastro" icon={UserPlus}>Cadastro</TabsTrigger>
            <TabsTrigger value="chamada" icon={Users2}>Chamada</TabsTrigger>
            <TabsTrigger value="historico" icon={History}>Histórico</TabsTrigger>
            <TabsTrigger value="alertas" icon={Bell} badge={hasAlerts}>Alertas</TabsTrigger>
          </TabsList>
          <TabsContent value="cadastro"><CadastroTab /></TabsContent>
          <TabsContent value="chamada"><ChamadaTab /></TabsContent>
          <TabsContent value="historico">
            <div className="animate-fade-in space-y-6">
              <Card padding="none" className="overflow-hidden shadow-md rounded-2xl">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-t-2xl px-4 pt-4 pb-2 flex gap-4 items-end">
                  <div className="flex-1">
                    <Input placeholder="Buscar por contexto..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
                  </div>
                  <div className="w-40">
                    <Input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} />
                  </div>
                </div>
                {recentCalls.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <History size={40} className="mx-auto mb-3 opacity-50" />
                    <p>Nenhum histórico de chamada encontrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800">
                          <th className="px-4 py-3 label-uppercase">Data</th>
                          <th className="px-4 py-3 label-uppercase">Contexto</th>
                          <th className="px-4 py-3 label-uppercase text-center">Presentes</th>
                          <th className="px-4 py-3 label-uppercase text-center">Faltas</th>
                          <th className="px-4 py-3 label-uppercase text-center">Presença</th>
                          <th className="px-4 py-3 label-uppercase w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {paginatedCalls.map(c => {
                          const regs = Array.isArray(c.registros_json) ? c.registros_json : []
                          const pres = regs.filter(r => r.presente).length
                          const falt = regs.filter(r => !r.presente).length
                          const total = pres + falt
                          const pct = total > 0 ? Math.round((pres / total) * 100) : 0
                          const isExpanded = expandedCalls[c.id]
                          const displayRegs = (isExpanded && draftCall?.id === c.id) ? draftCall.registros : regs
                          const hasChanges = isExpanded && draftCall?.id === c.id && JSON.stringify(draftCall.registros) !== JSON.stringify(regs)
                          return (
                            <React.Fragment key={c.id}>
                              <tr className="hover:bg-slate-50/50 cursor-pointer border-b border-slate-200 dark:border-slate-700" onClick={() => toggleExpand(c.id)}>
                                <td className="px-4 py-3 font-semibold">{formatDate(c.data)}</td>
                                <td className="px-4 py-3 text-sm">{c.contexto}</td>
                                <td className="px-4 py-3 text-center"><span className="font-bold text-emerald-600 dark:text-emerald-400">{pres}</span></td>
                                <td className="px-4 py-3 text-center"><span className={`font-bold ${falt > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>{falt}</span></td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-sm font-semibold ${pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {pct}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <div onClick={e => e.stopPropagation()}>
                                    <button onClick={() => { setItemToDelete(c.id); setShowDeleteModal(true) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={6} className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <div className="mb-3">
                                      <Input
                                        placeholder="Buscar membro..."
                                        value={expandedSearch[c.id] || ''}
                                        onChange={e => setExpandedSearch(prev => ({ ...prev, [c.id]: e.target.value }))}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Presentes ({pres})</p>
                                        <div className="space-y-1">
                                          {[...displayRegs].filter(r => r.presente && (!expandedSearch[c.id] || getMemberName(r.membro_id).toLowerCase().includes(expandedSearch[c.id].toLowerCase()))).sort((a, b) => getMemberName(a.membro_id).localeCompare(getMemberName(b.membro_id))).map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10 h-[58px]">
                                              <div className="flex items-center gap-3">
                                                <Avatar name={getMemberName(r.membro_id)} size="sm" />
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{getMemberName(r.membro_id)}</span>
                                              </div>
                                              <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleTogglePresence(c.id, r.membro_id) }}>
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 bg-emerald-500 border-emerald-500 text-white">
                                                  <CheckCircle size={14} strokeWidth={3} />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-red-600 uppercase mb-2">Faltas ({falt})</p>
                                        <div className="space-y-1">
                                          {[...displayRegs].filter(r => !r.presente && (!expandedSearch[c.id] || getMemberName(r.membro_id).toLowerCase().includes(expandedSearch[c.id].toLowerCase()))).sort((a, b) => getMemberName(a.membro_id).localeCompare(getMemberName(b.membro_id))).map((r, i) => (
                                            <div key={i} className="flex flex-col p-3 rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10 h-[120px]">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                  <Avatar name={getMemberName(r.membro_id)} size="sm" />
                                                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{getMemberName(r.membro_id)}</span>
                                                </div>
                                                <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleTogglePresence(c.id, r.membro_id) }}>
                                                  <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 bg-transparent border-red-300 dark:border-red-600 text-transparent">
                                                    <CheckCircle size={14} className="opacity-0" strokeWidth={3} />
                                                  </div>
                                                </div>
                                              </div>
                                              {editingJustification === `${c.id}-${r.membro_id}` ? (
                                                <div className="mt-auto pt-2 border-t border-red-200/50 dark:border-red-900/30 flex items-center gap-2">
                                                  <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder="Motivo da falta..."
                                                    value={justificationText}
                                                    onChange={(e) => setJustificationText(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveJustification(c.id, r.membro_id) }}
                                                    className="w-full px-3 py-1 text-sm bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg focus:outline-none focus:border-red-400 text-slate-900 dark:text-white"
                                                  />
                                                  <button onClick={() => handleSaveJustification(c.id, r.membro_id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"><Check size={18} /></button>
                                                  <button onClick={handleCancelJustification} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><X size={18} /></button>
                                                </div>
                                              ) : (
                                                <div
                                                  className="mt-auto pt-2 border-t border-red-200/50 dark:border-red-900/30 cursor-pointer group flex items-center h-[32px]"
                                                  onClick={() => handleEditJustification(c.id, r.membro_id, r.justificativa)}
                                                >
                                                  {r.justificativa ? (
                                                    <p className="w-full text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between">
                                                      <span className="truncate pr-2"><span className="font-semibold text-slate-500">Motivo:</span> {r.justificativa}</span>
                                                      <Edit2 size={14} className="shrink-0 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </p>
                                                  ) : (
                                                    <p className="w-full text-sm text-red-400 italic flex items-center justify-between">
                                                      Adicionar justificativa...
                                                      <Edit2 size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </p>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                      <Button variant="ghost" onClick={() => toggleExpand(c.id)}>Cancelar</Button>
                                      <Button icon={Save} onClick={() => handleSaveList(c.id)} disabled={!hasChanges}>Salvar Alterações</Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm text-slate-500">Página {currentPage} de {totalPages}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</Button>
                          <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próxima</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="alertas">
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card padding="medium" className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800/50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-red-600" />
                    <div><span className="text-2xl font-bold text-red-700">{dynamicProblematic.filter(m => m.faltas_mes_atual >= 3).length}</span><p className="text-xs font-semibold text-red-600">Críticos</p></div>
                  </div>
                </Card>
                <Card padding="medium" className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-amber-600" />
                    <div><span className="text-2xl font-bold text-amber-700">{dynamicProblematic.filter(m => m.faltas_mes_atual === 2).length}</span><p className="text-xs font-semibold text-amber-600">Atenção</p></div>
                  </div>
                </Card>
                <Card padding="medium" className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800/50">
                  <div className="flex items-center gap-3">
                    <Users2 size={20} className="text-blue-600" />
                    <div><span className="text-2xl font-bold text-blue-700">{dynamicProblematic.length}</span><p className="text-xs font-semibold text-blue-600">Total</p></div>
                  </div>
                </Card>
              </div>
              <Card padding="none" className="overflow-hidden shadow-md rounded-2xl">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-t-2xl px-4 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input placeholder="Buscar membro..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="w-full sm:w-48">
                    <Input type="month" value={alertsMonth} onChange={e => setAlertsMonth(e.target.value)} />
                  </div>
                </div>
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400" />
                    <p>Nenhum membro em alerta neste mês!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800">
                          <th className="px-4 py-3 label-uppercase">Membro</th>
                          <th className="px-4 py-3 label-uppercase">Seção</th>
                          <th className="px-4 py-3 label-uppercase text-center">Faltas</th>
                          <th className="px-4 py-3 label-uppercase text-center">Detalhes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredAlerts.map(m => {
                          const isVoice = (v) => voices.some(voice => voice.value === v || voice.label === v)
                          return (
                            <React.Fragment key={m.id}>
                              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group border-b border-slate-200 dark:border-slate-700" onClick={() => setExpandedAlert(expandedAlert === m.id ? null : m.id)}>
                                <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={m.nome} initials={m.iniciais} size="sm" /><span className="font-semibold text-slate-900 dark:text-white">{m.nome}</span></div></td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {m.secao && m.secao.split(', ').map(s => <span key={s} className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold ${isVoice(s) ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'}`}>{s}</span>)}
                                    {m.cargo && m.cargo.split(', ').map(c => <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[11px] font-bold text-blue-700 dark:text-blue-400">{c}</span>)}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center"><Badge className={m.faltas_mes_atual >= 3 ? 'badge-danger' : 'badge-warning'}>{m.faltas_mes_atual}</Badge></td>
                                <td className="px-4 py-3 text-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                  {expandedAlert === m.id ? <ChevronUp size={20} className="mx-auto" /> : <ChevronDown size={20} className="mx-auto" />}
                                </td>
                              </tr>
                              {expandedAlert === m.id && (
                                <tr>
                                  <td colSpan={4} className="p-0 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
                                    <div className="p-4 sm:pl-12 space-y-3 shadow-inner">
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Histórico de Ausências no Mês</p>
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        {m.absences.map(abs => (
                                          <div key={abs.call.id} className="flex flex-col p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3 mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex flex-col items-center justify-center border border-red-100 dark:border-red-800/50 shrink-0">
                                                <span className="text-[10px] font-bold uppercase leading-none mt-1">{formatDate(abs.call.data).substring(3, 5)}</span>
                                                <span className="text-sm font-black leading-none">{formatDate(abs.call.data).substring(0, 2)}</span>
                                              </div>
                                              <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{abs.call.contexto}</p>
                                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{formatDate(abs.call.data)}</p>
                                              </div>
                                            </div>
                                            <div className="flex-1">
                                              {editingAlertJust === `${abs.call.id}-${m.id}` ? (
                                                <div className="flex items-center gap-2">
                                                  <input type="text" autoFocus placeholder="Motivo da falta..." value={alertJustText} onChange={(e) => setAlertJustText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAlertJustification(abs.call.id, m.id) }} className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-400 text-slate-900 dark:text-white" />
                                                  <button onClick={() => handleSaveAlertJustification(abs.call.id, m.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"><Check size={18} /></button>
                                                  <button onClick={() => setEditingAlertJust(null)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><X size={18} /></button>
                                                </div>
                                              ) : (
                                                <div className="flex items-center justify-between gap-2 group/just">
                                                  {abs.justificativa ? (
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 truncate flex-1" title={abs.justificativa}><span className="font-semibold text-slate-500">Motivo:</span> {abs.justificativa}</p>
                                                  ) : (
                                                    <p className="text-sm text-red-400 italic flex-1">Sem justificativa registrada.</p>
                                                  )}
                                                  <div className="flex items-center gap-1 opacity-0 group-hover/just:opacity-100 transition-opacity shrink-0">
                                                    <button onClick={() => { setEditingAlertJust(`${abs.call.id}-${m.id}`); setAlertJustText(abs.justificativa || '') }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar Motivo"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleAbonarFalta(abs.call.id, m.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Abonar Falta (Marcar como Presente)"><CheckCircle size={16} /></button>
                                                  </div>
                                                </div>
)}
      </div>

      <Modal isOpen={modalOpen || editingMember} onClose={() => { setModalOpen(false); setEditingMember(null); setForm({ nome: '', instrumentos: [], vozes: [], cargos: [], telefone: '', data_nascimento: '', status: 'Ativo' }); setErrors({}); }} title={editingMember ? 'Editar Membro' : 'Novo Membro'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Nome Completo" placeholder="ex: Elena Rossi" value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} error={errors.nome} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Voz do Coral</label>
              <Select options={[{ value: '', label: 'Adicionar voz...' }, ...voiceOptions]} value="" onChange={(v) => v && !form.vozes.includes(v) && setForm(f => ({ ...f, vozes: [...f.vozes, v] }))} />
              {form.vozes.length > 0 && <div className="flex flex-wrap gap-1">{form.vozes.map(v => <span key={v} className="px-2 py-1 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400 rounded text-xs font-bold">{v} <button type="button" onClick={() => setForm(f => ({ ...f, vozes: f.vozes.filter(x => x !== v) }))} className="ml-1">×</button></span>)}</div>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Instrumento</label>
              <Select options={[{ value: '', label: 'Adicionar...' }, ...instrumentOptions]} value="" onChange={(v) => v && !form.instrumentos.includes(v) && setForm(f => ({ ...f, instrumentos: [...f.instrumentos, v] }))} />
              {form.instrumentos.length > 0 && <div className="flex flex-wrap gap-1">{form.instrumentos.map(i => <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded text-xs font-bold">{i} <button type="button" onClick={() => setForm(f => ({ ...f, instrumentos: f.instrumentos.filter(x => x !== i) }))} className="ml-1">×</button></span>)}</div>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cargo / Função</label>
              <Select options={[{ value: '', label: 'Adicionar...' }, ...positions]} value="" onChange={(v) => v && !form.cargos.includes(v) && setForm(f => ({ ...f, cargos: [...f.cargos, v] }))} />
              {form.cargos.length > 0 && <div className="flex flex-wrap gap-1">{form.cargos.map(c => <span key={c} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded text-xs font-bold">{c} <button type="button" onClick={() => setForm(f => ({ ...f, cargos: f.cargos.filter(x => x !== c) }))} className="ml-1">×</button></span>)}</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Data de Nascimento" type="date" value={form.data_nascimento} onChange={(e) => setForm(f => ({ ...f, data_nascimento: e.target.value }))} />
            <Input label="Telefone" placeholder="(11) 90000-0000" value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} />
          </div>
          <RadioGroup options={statuses} value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">{editingMember ? 'Atualizar' : 'Salvar'}</Button>
            <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditingMember(null); }}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
                }}>Excluir</Button>
              </div>
            </div>
          </Modal>,
          document.body
        )
      }
    </div >
  )
}