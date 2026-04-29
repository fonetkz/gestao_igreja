import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Edit2, Plus, ClipboardList, History, Bell, Users2, MessageSquare, Check, X, Cake, CheckCircle, BellRing, Clock, XCircle, Music, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import useMembersStore from '../store/membersStore'
import useSettingsStore from '../store/settingsStore'
import useToastStore from '../store/toastStore'

function Badge({ children, variant = 'default' }) {
  const variants = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    yellow: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>{children}</span>
}

function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500']
  const colorIndex = name?.charCodeAt(0) % colors.length
  return <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white ${colors[colorIndex]}`}>{initials}</div>
}

function Modal({ isOpen, onClose, title, children, size = 'lg' }) {
  if (!isOpen) return null
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 dark:bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#2C2C2E] rounded-3xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#1C1C1E]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><X size={20} /></button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

const mockMembers = [
  { id: 1, nome: 'Gustavo Henrique', telefone: '(17) 99123-4567', data_nascimento: '15/04/1990', secao: 'Tenor', instrumento_voz: 'Violino', cargo: 'Músico', status: 'Ativo' },
  { id: 2, nome: 'Aline Souza', telefone: '(17) 99234-5678', data_nascimento: '22/08/1995', secao: 'Soprano', instrumento_voz: 'Flauta', cargo: 'Músico', status: 'Ativo' },
  { id: 3, nome: 'Carlos Eduardo', telefone: '(17) 99345-6789', data_nascimento: '03/12/1988', secao: 'Baixo', instrumento_voz: 'Trompete', cargo: 'Músico', status: 'Licença' },
  { id: 4, nome: 'Mariana Santos', telefone: '(17) 99456-7890', data_nascimento: '10/04/1992', secao: 'Contralto', instrumento_voz: 'Clarinete', cargo: 'Regente', status: 'Ativo' },
  { id: 5, nome: 'Pedro Oliveira', telefone: '(17) 99567-8901', data_nascimento: '05/11/1985', secao: 'Tenor', instrumento_voz: 'Violão', cargo: 'Músico', status: 'Ativo' },
  { id: 6, nome: 'Ana Paula', telefone: '(17) 99678-9012', data_nascimento: '30/06/1998', secao: 'Soprano', instrumento_voz: '', cargo: 'Coordenadora', status: 'Ativo' },
  { id: 7, nome: 'Roberto Alves', telefone: '(17) 99789-0123', data_nascimento: '18/01/1993', secao: '', instrumento_voz: 'Piano', cargo: 'Músico', status: 'Ativo' },
  { id: 8, nome: 'Juliana Costa', telefone: '(17) 99890-1234', data_nascimento: '25/09/1990', secao: 'Contralto', instrumento_voz: 'Violoncelo', cargo: 'Músico', status: 'Inativo' },
]

const mockHistorico = [
  { id: 1, data: '19/04/2026', tipo: 'Culto de Celebração', presentes: 42, ausentes: 6, registros: [{ membro_id: 1, presente: true }, { membro_id: 2, presente: true }, { membro_id: 3, presente: false, justificativa: 'Viajem' }, { membro_id: 4, presente: true }] },
  { id: 2, data: '12/04/2026', tipo: 'Ensaio Geral', presentes: 38, ausentes: 10, registros: [{ membro_id: 1, presente: false, justificativa: '' }, { membro_id: 2, presente: true }, { membro_id: 3, presente: false, justificativa: 'Problema de saúde' }, { membro_id: 4, presente: true }] },
  { id: 3, data: '05/04/2026', tipo: 'Culto Dominical', presentes: 45, ausentes: 3, registros: [] },
]

const formatarDataNascimento = (data) => {
  if (!data) return '—'
  let dia, mes, ano;
  if (data.includes('-')) {
    [ano, mes, dia] = data.split('T')[0].split('-')
  } else {
    [dia, mes, ano] = data.split('/')
  }
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${dia} ${meses[parseInt(mes, 10) - 1]} ${ano}`
}

const isAniversarioMes = (data) => {
  if (!data) return false
  let mes;
  if (data.includes('-')) {
    mes = data.split('-')[1]
  } else {
    mes = data.split('/')[1]
  }
  const mesAtual = new Date().getMonth() + 1
  return parseInt(mes, 10) === mesAtual
}

const formatarTelefone = (phone) => {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

export default function MembersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' })
  const [activeTab, setActiveTab] = useState(searchParams.get('view') || 'lista')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [editingChamada, setEditingChamada] = useState(null)
  const [justifyingAlert, setJustifyingAlert] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [vozFilter, setVozFilter] = useState('')
  const [instrumentoFilter, setInstrumentoFilter] = useState('')
  const [funcaoFilter, setFuncaoFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [historicoFilter, setHistoricoFilter] = useState('')
  const [historicoDateFilter, setHistoricoDateFilter] = useState('')
  const [historicoNameFilter, setHistoricoNameFilter] = useState('')
  const [alertSearch, setAlertSearch] = useState('')
  const [alertSubTab, setAlertSubTab] = useState('pendentes')
  const [alertMonth, setAlertMonth] = useState(new Date().toISOString().slice(0, 7))

  const storeMembers = useMembersStore((s) => s.members) || []
  const storeAttendance = useMembersStore((s) => s.attendance) || []
  const addMember = useMembersStore((s) => s.addMember)
  const updateMember = useMembersStore((s) => s.updateMember)
  const removeMember = useMembersStore((s) => s.removeMember)
  const deleteCall = useMembersStore((s) => s.deleteCall)
  const updateAttendance = useMembersStore((s) => s.updateAttendance)

  const voices = useSettingsStore((s) => s.voices) || []
  const instruments = useSettingsStore((s) => s.instruments) || []
  const positions = useSettingsStore((s) => s.positions) || []
  const statuses = useSettingsStore((s) => s.statuses) || []
  const attendanceContexts = useSettingsStore((s) => s.attendanceContexts) || []

  useEffect(() => {
    const view = searchParams.get('view')
    if (view && view !== activeTab) {
      setActiveTab(view)
    }
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (searchParams.has('view')) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('view')
      setSearchParams(newParams)
    }
  }

  const filteredMembers = storeMembers.filter(member => {
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      const searchDigits = searchText.replace(/\D/g, '')
      const matchNome = member.nome.toLowerCase().includes(searchLower)
      const matchTelefone = member.telefone && searchDigits && member.telefone.replace(/\D/g, '').includes(searchDigits)
      if (!matchNome && !matchTelefone) return false
    }
    if (vozFilter && member.secao !== vozFilter) return false
    if (instrumentoFilter && !member.instrumento_voz?.includes(instrumentoFilter)) return false
    if (funcaoFilter && !member.cargo?.includes(funcaoFilter)) return false
    if (statusFilter && member.status !== statusFilter) return false
    return true
  }).sort((a, b) => {
    if (!sortConfig.key) return 0
    const aVal = a[sortConfig.key] || ''
    const bVal = b[sortConfig.key] || ''
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const getMemberAbsences = (memberId) => {
    const absences = []
    storeAttendance.forEach(call => {
      let isThisMonth = false
      if (call.data) {
        if (call.data.includes('-') && call.data.startsWith(alertMonth)) isThisMonth = true
        else if (call.data.includes('/')) {
          const [d, m, y] = call.data.split('/')
          if (`${y}-${m}` === alertMonth) isThisMonth = true
        }
      }
      if (isThisMonth) {
        const regs = call.registros_json || call.registros || []
        const reg = regs.find(r => String(r.membro_id) === String(memberId))
        if (reg && !reg.presente) {
          absences.push({ call, justificativa: reg.justificativa })
        }
      }
    })
    return absences
  }

  const membersWithAbsencesData = storeMembers.map(m => {
    const absences = getMemberAbsences(m.id)
    const unjustified = absences.filter(a => !a.justificativa || a.justificativa.trim() === '')
    const justified = absences.filter(a => a.justificativa && a.justificativa.trim() !== '')
    return { ...m, unjustified_absences: unjustified.length, justified_absences: justified.length, all_absences: absences, unjustified_list: unjustified, justified_list: justified }
  })
  const pendingAlerts = membersWithAbsencesData.filter(m => m.unjustified_absences >= 2 && (!alertSearch || m.nome.toLowerCase().includes(alertSearch.toLowerCase())))
  const justifiedAlerts = membersWithAbsencesData.filter(m => m.justified_absences > 0 && (!alertSearch || m.nome.toLowerCase().includes(alertSearch.toLowerCase())))
  const hasPendingAlerts = membersWithAbsencesData.some(m => m.unjustified_absences >= 2)

  const handleSaveEdicaoChamada = async (chamadaId, novosRegistros, novoContexto) => {
    try {
      await updateAttendance(chamadaId, { registros_json: novosRegistros, contexto: novoContexto })
      setEditingChamada(null)
    } catch (err) {
      console.error('Erro ao salvar edição:', err)
    }
  }

  const getStatusVariant = (status) => {
    if (status === 'Ativo') return 'green'
    if (status === 'Licença') return 'yellow'
    if (status === 'Inativo') return 'red'
    return 'default'
  }

  const handleSaveJustificativa = async (alertaId, justificativasObj) => {
    try {
      for (const [chamadaId, motivo] of Object.entries(justificativasObj)) {
        if (motivo === undefined) continue;
        const call = storeAttendance.find(c => String(c.id) === String(chamadaId))
        if (!call) continue;
        const regs = call.registros_json || call.registros || []
        const existingReg = regs.find(r => String(r.membro_id) === String(alertaId));
        if (existingReg && (existingReg.justificativa || '') === motivo) continue;

        const newRegs = regs.map(r => String(r.membro_id) === String(alertaId) ? { ...r, justificativa: motivo } : r)
        await updateAttendance(call.id, { registros_json: newRegs, contexto: call.contexto || call.tipo })
      }
      setJustifyingAlert(null)
    } catch (err) {
      console.error('Erro ao salvar justificativas:', err)
      alert('Ocorreu um erro ao salvar as justificativas.')
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const stats = {
    total: storeMembers.length,
    ativos: storeMembers.filter(m => m.status === 'Ativo').length,
    licenca: storeMembers.filter(m => m.status === 'Licença').length,
    inativos: storeMembers.filter(m => m.status === 'Inativo').length,
    orquestra: storeMembers.filter(m => m.instrumento_voz && m.instrumento_voz !== '').length,
    aniversariantes: storeMembers.filter(m => isAniversarioMes(m.data_nascimento)).length
  }

  return (
    <div className="min-h-screen pb-12 bg-[#F5F5F7] dark:bg-[#1C1C1E]">
      <Topbar title="Gestão Igreja" />
      <div className="px-8 max-w-7xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Integrantes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie o corpo musical e coralistas.</p>
          </div>
          {activeTab === 'lista' && (
            <button onClick={() => setShowDrawer(true)} className="btn-apple-primary">
              <Plus size={18} /> Novo Integrante
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          <button onClick={() => handleTabChange('lista')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'lista' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <Users2 size={16} className="inline mr-2" />Lista
          </button>
          <button onClick={() => handleTabChange('chamada')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chamada' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <ClipboardList size={16} className="inline mr-2" />Chamada
          </button>
          <button onClick={() => handleTabChange('historico')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'historico' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <History size={16} className="inline mr-2" />Histórico
          </button>
          <button onClick={() => handleTabChange('alertas')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'alertas' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <div className="relative flex items-center justify-center mr-2">
              <Bell size={16} />
              {hasPendingAlerts && (
                <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ${activeTab === 'alertas' ? 'ring-white dark:ring-[#2C2C2E]' : 'ring-gray-100 dark:ring-gray-800'}`} />
              )}
            </div>
            Alertas
          </button>
        </div>

        {activeTab === 'lista' && (
          <div className="space-y-4">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="metric-card animate-slide-up group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110">
                    <Users2 size={24} strokeWidth={2} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Total</p>
              </div>
              <div className="metric-card animate-slide-up group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 transition-transform duration-300 group-hover:scale-110">
                    <CheckCircle size={24} strokeWidth={2} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.ativos}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Ativos</p>
              </div>
              <div className="metric-card animate-slide-up group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:scale-110">
                    <Clock size={24} strokeWidth={2} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.licenca}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Licença</p>
              </div>
              <div className="metric-card animate-slide-up group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 transition-transform duration-300 group-hover:scale-110">
                    <XCircle size={24} strokeWidth={2} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.inativos}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Inativos</p>
              </div>
              <div className="metric-card animate-slide-up group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-transform duration-300 group-hover:scale-110">
                    <Music size={24} strokeWidth={2} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.orquestra}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Orquestra</p>
              </div>
              <div className="metric-card animate-slide-up group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 transition-transform duration-300 group-hover:scale-110">
                    <Cake size={24} strokeWidth={2} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.aniversariantes}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Aniversários</p>
              </div>
            </div>

            {/* Filtros Justificados */}
            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Buscar..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="input-apple pl-9" />
                </div>
                <select value={vozFilter} onChange={(e) => setVozFilter(e.target.value)} className="select-apple">
                  <option value="">Todas as vozes</option>
                  {voices.map(v => <option key={v.id} value={v.label}>{v.label}</option>)}
                </select>
                <select value={instrumentoFilter} onChange={(e) => setInstrumentoFilter(e.target.value)} className="select-apple">
                  <option value="">Todos os instrum.</option>
                  {instruments.map(v => <option key={v.id} value={v.label}>{v.label}</option>)}
                </select>
                <select value={funcaoFilter} onChange={(e) => setFuncaoFilter(e.target.value)} className="select-apple">
                  <option value="">Todas as funções</option>
                  {positions.map(v => <option key={v.id} value={v.label}>{v.label}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-apple">
                  <option value="">Todos os status</option>
                  {statuses.map(v => <option key={v.id} value={v.label}>{v.label}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#1C1C1E] border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('nome')}>
                      <div className="flex items-center gap-1">Integrante {sortConfig.key === 'nome' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3">
                      Contato
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('data_nascimento')}>
                      <div className="flex items-center gap-1">Nascimento {sortConfig.key === 'data_nascimento' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('secao')}>
                      <div className="flex items-center gap-1">Voz {sortConfig.key === 'secao' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('instrumento_voz')}>
                      <div className="flex items-center gap-1">Instrumento {sortConfig.key === 'instrumento_voz' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('cargo')}>
                      <div className="flex items-center gap-1">Função {sortConfig.key === 'cargo' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Search size={40} className="text-gray-300 mb-3" />
                          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Nenhum integrante encontrado</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tente ajustar os filtros ou o termo de busca.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={member.nome} size="sm" /><div className="flex items-center gap-1.5"><span className="font-medium text-gray-900 dark:text-white">{member.nome}</span>{isAniversarioMes(member.data_nascimento) && <Cake size={14} className="text-amber-400" title="Aniversariante do Mês" />}</div></div></td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatarTelefone(member.telefone)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatarDataNascimento(member.data_nascimento)}</td>
                        <td className="px-4 py-3">{member.secao ? <Badge variant="blue">{member.secao}</Badge> : <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-3">
                          {member.instrumento_voz && member.instrumento_voz.split(', ').filter(i => i !== member.secao).join(', ') ? <Badge variant="purple">{member.instrumento_voz.split(', ').filter(i => i !== member.secao).join(', ')}</Badge> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3">{member.cargo ? <Badge variant="default">{member.cargo}</Badge> : <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-3"><Badge variant={getStatusVariant(member.status)}>{member.status}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => {
                            setEditingMember({
                              ...member,
                              instrumentos: member.instrumento_voz ? member.instrumento_voz.split(', ').filter(i => i !== member.secao) : [],
                              cargos: member.cargo ? member.cargo.split(', ') : []
                            });
                            setShowDrawer(true);
                          }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500"><Edit2 size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chamada' && <ChamadaTab members={storeMembers.filter(m => m.status === 'Ativo')} />}

        {activeTab === 'historico' && (
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Chamadas</h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={historicoNameFilter}
                    onChange={(e) => setHistoricoNameFilter(e.target.value)}
                    className="input-apple pl-10 w-48"
                  />
                </div>
                <select
                  value={historicoFilter}
                  onChange={(e) => setHistoricoFilter(e.target.value)}
                  className="select-apple"
                >
                  <option value="">Todos os contextos</option>
                  {attendanceContexts.map(ctx => (
                    <option key={ctx.id} value={ctx.label}>{ctx.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={historicoDateFilter}
                  onChange={(e) => setHistoricoDateFilter(e.target.value)}
                  className="input-apple"
                />
              </div>
            </div>
            <div className="space-y-3">
              {storeAttendance
                .filter(item => {
                  if (historicoFilter && !item.contexto?.toLowerCase().includes(historicoFilter.toLowerCase())) return false
                  if (historicoDateFilter) {
                    const itemDate = item.data ? item.data.split('T')[0] : item.data
                    if (itemDate !== historicoDateFilter) return false
                  }
                  if (historicoNameFilter) {
                    const registros = item.registros_json || []
                    const hasName = registros.some(r => {
                      const member = storeMembers.find(m => m.id === r.membro_id)
                      return member?.nome?.toLowerCase().includes(historicoNameFilter.toLowerCase())
                    })
                    if (!hasName) return false
                  }
                  return true
                })
                .length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History size={40} className="text-gray-300 mb-3" />
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Nenhum histórico encontrado</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">As chamadas salvas aparecerão aqui.</p>
                </div>
              ) : (
                storeAttendance
                  .filter(item => {
                    if (historicoFilter && !item.contexto?.toLowerCase().includes(historicoFilter.toLowerCase())) return false
                    if (historicoDateFilter) {
                      const itemDate = item.data ? item.data.split('T')[0] : item.data
                      if (itemDate !== historicoDateFilter) return false
                    }
                    if (historicoNameFilter) {
                      const registros = item.registros_json || []
                      const hasName = registros.some(r => {
                        const member = storeMembers.find(m => m.id === r.membro_id)
                        return member?.nome?.toLowerCase().includes(historicoNameFilter.toLowerCase())
                      })
                      if (!hasName) return false
                    }
                    return true
                  })
                  .map(item => {
                    const registros = item.registros_json || []
                    const presentes = registros.filter(r => r.presente).length
                    const ausentes = registros.filter(r => !r.presente).length

                    let dataFormatada = '—'
                    if (item.data) {
                      const dataStr = item.data.includes('/') ? item.data.split('/').reverse().join('-') : item.data
                      const dateObj = new Date(`${dataStr}T12:00:00`)
                      if (!isNaN(dateObj.getTime())) {
                        const rawDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                        dataFormatada = rawDate.charAt(0).toUpperCase() + rawDate.slice(1)
                      } else {
                        dataFormatada = item.data
                      }
                    }

                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#3A3A3C] rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{dataFormatada}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.contexto}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xl font-bold text-green-600">{presentes}</p>
                            <p className="text-xs text-gray-500">Presentes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-red-500">{ausentes}</p>
                            <p className="text-xs text-gray-500">Ausentes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{registros.length > 0 ? Math.round((presentes / registros.length) * 100) : 0}%</p>
                            <p className="text-xs text-gray-500">Presença</p>
                          </div>
                          <button onClick={() => setEditingChamada(item)} className="ml-4 p-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Editar">
                            <Edit2 size={18} />
                          </button>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        )}

        {activeTab === 'alertas' && (
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alertas de Frequência</h3>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="month"
                  value={alertMonth}
                  onChange={(e) => setAlertMonth(e.target.value)}
                  className="input-apple w-48"
                />
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button onClick={() => setAlertSubTab('pendentes')} className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${alertSubTab === 'pendentes' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                    <div className="relative flex items-center justify-center mr-1.5">
                      <BellRing size={14} />
                      {hasPendingAlerts && <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ${alertSubTab === 'pendentes' ? 'ring-white dark:ring-[#2C2C2E]' : 'ring-gray-100 dark:ring-gray-800'}`} />}
                    </div>
                    Pendentes
                  </button>
                  <button onClick={() => setAlertSubTab('justificadas')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${alertSubTab === 'justificadas' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Justificadas</button>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={alertSearch}
                  onChange={(e) => setAlertSearch(e.target.value)}
                  className="input-apple pl-10 w-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              {alertSubTab === 'pendentes' ? (
                pendingAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <BellRing className="w-16 h-16 text-gray-300 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Tudo tranquilo por aqui!</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">Nenhum integrante com 2+ faltas não justificadas no mês selecionado.</p>
                  </div>
                ) : (
                  pendingAlerts.map(member => (
                    <div key={member.id} className="flex items-start justify-between p-4 rounded-xl border bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30">
                      <div className="flex items-start gap-4">
                        <Avatar name={member.nome} size="md" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{member.nome}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.secao || member.cargo} - {member.unjustified_absences} faltas não justificadas</p>
                        </div>
                      </div>
                      <button onClick={() => { setJustifyingAlert({ member, mode: 'pendentes' }); }} className="bg-white dark:bg-[#2C2C2E] text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        Justificar
                      </button>
                    </div>
                  ))
                )
              ) : (
                justifiedAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Nenhuma justificativa</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">Nenhuma falta foi justificada no mês selecionado.</p>
                  </div>
                ) : (
                  justifiedAlerts.map(member => (
                    <div key={member.id} className="flex items-start justify-between p-4 rounded-xl border bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30">
                      <div className="flex items-start gap-4">
                        <Avatar name={member.nome} size="md" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{member.nome}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{member.secao || member.cargo} - {member.justified_absences} {member.justified_absences === 1 ? 'falta justificada' : 'faltas justificadas'}</p>
                          <div className="space-y-1.5">
                            {member.justified_list.map((falta, i) => (
                              <div key={i} className="text-xs text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-[#3A3A3C]/60 px-2 py-1.5 rounded-lg border border-green-200/60 dark:border-green-700/30">
                                <span className="font-semibold text-green-700 mr-1">
                                  {falta.call.data ? (falta.call.data.includes('-') ? falta.call.data.split('-').reverse().join('/') : falta.call.data) : ''}:
                                </span>
                                {falta.justificativa}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => { setJustifyingAlert({ member, mode: 'justificadas' }); }} className="bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                        Editar
                      </button>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showDrawer} onClose={() => { setShowDrawer(false); setEditingMember(null); }} title={editingMember ? 'Editar Integrante' : 'Novo Integrante'} size="lg">
        <MemberForm
          key={editingMember ? editingMember.id : 'new'}
          member={editingMember}
          onSave={async (data) => {
            try {
              const payload = {
                nome: data.nome,
                telefone: data.telefone ? data.telefone.replace(/\D/g, '') : '',
                data_nascimento: data.data_nascimento,
                secao: data.secao,
                instrumento_voz: (data.instrumentos || []).join(', '),
                cargo: (data.cargos || []).join(', '),
                status: data.status
              }
              if (editingMember && editingMember.id) {
                await updateMember(editingMember.id, payload)
              } else {
                await addMember(payload)
              }
              setShowDrawer(false)
              setEditingMember(null)
            } catch (err) {
              console.error('Erro ao salvar integrante:', err)
            }
          }}
          onCancel={() => { setShowDrawer(false); setEditingMember(null); }}
          onDelete={async (id) => {
            if (window.confirm('Tem certeza que deseja excluir este integrante? O histórico dele nas chamadas passadas será preservado de forma segura.')) {
              try {
                await removeMember(id)
                setShowDrawer(false)
                setEditingMember(null)
              } catch (err) {
                console.error('Erro ao excluir integrante:', err)
                alert('Ocorreu um erro ao excluir o integrante.')
              }
            }
          }}
        />
      </Modal>

      <Modal isOpen={!!justifyingAlert} onClose={() => setJustifyingAlert(null)} title={justifyingAlert?.mode === 'justificadas' ? `Editar Justificativas - ${justifyingAlert?.member?.nome}` : `Justificar Faltas - ${justifyingAlert?.member?.nome}`} size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {justifyingAlert?.mode === 'justificadas' ? 'Edite os motivos das ausências ou deixe em branco para remover a justificativa.' : 'Preencha o motivo para cada ausência pendente.'}
          </p>
          <JustificativasList alert={justifyingAlert} onSave={handleSaveJustificativa} onCancel={() => setJustifyingAlert(null)} />
        </div>
      </Modal>

      {editingChamada && (
        <EdicaoDrawer
          chamada={editingChamada}
          members={storeMembers.filter(m => m.status === 'Ativo')}
          onSave={handleSaveEdicaoChamada}
          onDelete={deleteCall}
          onClose={() => setEditingChamada(null)}
        />
      )}
    </div>
  )
}

function ChamadaTab({ members, isEditing = false, chamada = null, onSaveEdit = null, onCancelEdit = null }) {
  const attendanceContexts = useSettingsStore((s) => s.attendanceContexts) || []
  const saveAttendance = useMembersStore((s) => s.saveAttendance)
  const showToast = useToastStore((s) => s.showToast)

  const [dataChamada, setDataChamada] = useState(chamada?.data ? chamada.data.split('/').reverse().join('-') : new Date().toISOString().split('T')[0])
  const [contextoChamada, setContextoChamada] = useState(chamada?.tipo || (attendanceContexts[0]?.label || 'Ensaio Geral'))
  const [presencas, setPresencas] = useState(() => {
    if (chamada?.registros) {
      const map = {}
      chamada.registros.forEach(r => { map[r.membro_id] = r.presente })
      return map
    }
    return {}
  })
  const [justificativas, setJustificativas] = useState(() => {
    if (chamada?.registros) {
      const map = {}
      chamada.registros.forEach(r => { map[r.membro_id] = r.justificativa || '' })
      return map
    }
    return {}
  })
  const [searchChamada, setSearchChamada] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const filteredMembers = members
    .filter(m => !searchChamada || m.nome.toLowerCase().includes(searchChamada.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  const total = filteredMembers.length
  const presentes = filteredMembers.filter(m => presencas[m.id] !== false && presencas[m.id] !== undefined).length || (total > 0 && Object.keys(presencas).length === 0 ? total : filteredMembers.filter(m => presencas[m.id] !== false).length)
  const ausentes = filteredMembers.filter(m => presencas[m.id] === false).length

  const togglePresenca = (id) => setPresencas(p => ({ ...p, [id]: p[id] === false ? true : false }))

  const updateJustificativa = (id, text) => setJustificativas(prev => ({ ...prev, [id]: text }))

  const handleSave = async () => {
    const registros = members.map(m => ({
      membro_id: m.id,
      presente: presencas[m.id] !== false,
      justificativa: justificativas[m.id] || ''
    }))

    if (onSaveEdit) {
      onSaveEdit(chamada.id, registros)
    } else {
      setLoading(true)
      try {
        console.log('Salvando chamada:', { dataChamada, contextoChamada, registros })
        await saveAttendance(dataChamada, contextoChamada, registros)
        showToast('Chamada salva com sucesso!', 'success')
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setPresencas({})
          setJustificativas({})
        }, 3000)
      } catch (err) {
        console.error('Erro ao salvar chamada:', err)
        showToast(err.message || 'Erro ao salvar chamada', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Data</label>
            <input type="date" value={dataChamada} onChange={(e) => setDataChamada(e.target.value)} className="input-apple w-auto" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Contexto</label>
            <select value={contextoChamada} onChange={(e) => setContextoChamada(e.target.value)} className="select-apple w-auto">
              {attendanceContexts.map(ctx => (
                <option key={ctx.id} value={ctx.label}>{ctx.label}</option>
              ))}
              {attendanceContexts.length === 0 && (
                <option value="Ensaio Geral">Ensaio Geral</option>
              )}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Buscar</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar integrante..." value={searchChamada} onChange={(e) => setSearchChamada(e.target.value)} className="input-apple pl-10 w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredMembers.map(member => {
            const presente = presencas[member.id] !== false
            const showJustificativa = presencas[member.id] === false
            return (
              <div key={member.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.nome} size="sm" />
                    <div>
                      <p className="font-medium">{member.nome}</p>
                      <p className="text-xs text-gray-500">{member.secao || member.instrumento_voz || 'Músico'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePresenca(member.id)} className={`w-10 h-10 rounded-full font-semibold text-sm transition-all ${presente ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'}`}>P</button>
                    <button onClick={() => togglePresenca(member.id)} className={`w-10 h-10 rounded-full font-semibold text-sm transition-all ${!presente ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'}`}>F</button>
                  </div>
                </div>
                {showJustificativa && (
                  <div className="mt-3 pl-11 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar motivo da falta (opcional)"
                      value={justificativas[member.id] || ''}
                      onChange={(e) => updateJustificativa(member.id, e.target.value)}
                      className="input-apple text-sm flex-1"
                    />
                    <button
                      onClick={() => updateJustificativa(member.id, '')}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shrink-0"
                      title="Apagar Justificativa"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center w-full">
          <div className="flex gap-6">
            <span className="font-bold text-gray-900 dark:text-white">{presentes} Presentes</span>
            <span className="font-bold text-gray-900 dark:text-white">{ausentes} Ausentes</span>
          </div>
          {isEditing ? (
            <div className="flex gap-3">
              <button onClick={onCancelEdit} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
              <button onClick={handleSave} className="bg-[#007AFF] text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600">Salvar Alterações</button>
            </div>
          ) : (
            <button onClick={handleSave} disabled={loading} className="bg-[#007AFF] text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-all">
              {loading ? 'Salvando...' : success ? 'Salvo com sucesso!' : 'Salvar Chamada'}
            </button>
          )}
        </div>
      </div>
      <div className="h-20" />
    </div>
  )
}

function EdicaoChamadaForm({ chamada, members, onSave, onCancel }) {
  const membrosOrdenados = [...members].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  const [registros, setRegistros] = useState(() => {
    if (!chamada?.registros || chamada.registros.length === 0) {
      return membrosOrdenados.map(m => ({ membro_id: m.id, presente: true, justificativa: '' }))
    }
    return membrosOrdenados.map(m => {
      const existente = chamada.registros.find(r => r.membro_id === m.id)
      return existente || { membro_id: m.id, presente: true, justificativa: '' }
    })
  })

  const updateRegistro = (membroId, updates) => {
    setRegistros(prev => prev.map(r => r.membro_id === membroId ? { ...r, ...updates } : r))
  }

  const getMemberName = (id) => members.find(m => m.id === id)?.nome || 'Desconhecido'
  const getMemberRole = (id) => {
    const m = members.find(x => x.id === id)
    return m?.secao || m?.instrumento_voz || 'Músico'
  }

  const presentes = registros.filter(r => r.presente).length
  const ausentes = registros.filter(r => !r.presente).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#3A3A3C] rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{presentes}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Presentes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{ausentes}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ausentes</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {registros.map(reg => (
          <div key={reg.membro_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#3A3A3C] rounded-xl">
            <div className="flex items-center gap-3">
              <Avatar name={getMemberName(reg.membro_id)} size="sm" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{getMemberName(reg.membro_id)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getMemberRole(reg.membro_id)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateRegistro(reg.membro_id, { presente: true, justificativa: '' })}
                className={`w-12 h-8 rounded-lg font-semibold text-sm transition-all ${reg.presente ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600'}`}
              >
                P
              </button>
              <button
                onClick={() => updateRegistro(reg.membro_id, { presente: false })}
                className={`w-12 h-8 rounded-lg font-semibold text-sm transition-all ${!reg.presente ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600'}`}
              >
                F
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button onClick={() => onSave(chamada.id, registros)} className="flex-1 bg-[#007AFF] text-white py-3 rounded-xl font-medium hover:bg-blue-600">
          Salvar Alterações
        </button>
        <button onClick={onCancel} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
          Cancelar
        </button>
      </div>
    </div>
  )
}

function MemberForm({ member, onSave, onCancel, onDelete }) {
  const voices = useSettingsStore(s => s.voices) || []
  const instruments = useSettingsStore(s => s.instruments) || []
  const positions = useSettingsStore(s => s.positions) || []
  const statuses = useSettingsStore(s => s.statuses) || []

  const [form, setForm] = useState(() => {
    if (member) {
      let formattedPhone = member.telefone || ''
      if (formattedPhone) {
        const digits = formattedPhone.replace(/\D/g, '')
        if (digits.length === 11) formattedPhone = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
        else if (digits.length === 10) formattedPhone = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
      }
      return { ...member, telefone: formattedPhone }
    }
    return { nome: '', telefone: '', data_nascimento: '', secao: '', instrumentos: [], cargos: [], status: 'Ativo' }
  })

  const formInstrumentos = form?.instrumentos || []
  const formCargos = form?.cargos || []

  const [showInstDropdown, setShowInstDropdown] = useState(false)
  const [showCargoDropdown, setShowCargoDropdown] = useState(false)

  const instrumentosDisponiveis = instruments.map(i => i.label)
  const cargosDisponiveis = positions.map(p => p.label)

  const addInstrumento = (inst) => {
    if (inst && !formInstrumentos.includes(inst)) {
      setForm(f => ({ ...f, instrumentos: [...(f.instrumentos || []), inst] }))
    }
    setShowInstDropdown(false)
  }

  const removeInstrumento = (inst) => {
    setForm(f => ({ ...f, instrumentos: (f.instrumentos || []).filter(i => i !== inst) }))
  }

  const addCargo = (cargo) => {
    if (cargo && !formCargos.includes(cargo)) {
      setForm(f => ({ ...f, cargos: [...(f.cargos || []), cargo] }))
    }
    setShowCargoDropdown(false)
  }

  const removeCargo = (cargo) => {
    setForm(f => ({ ...f, cargos: (f.cargos || []).filter(c => c !== cargo) }))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Nome</label>
          <input type="text" value={form.nome || ''} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} className="input-apple w-full" placeholder="Nome completo" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Nascimento</label>
          <input type="date" value={form.data_nascimento || ''} onChange={(e) => setForm(f => ({ ...f, data_nascimento: e.target.value }))} className="input-apple w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Telefone</label>
          <input type="text" value={form.telefone || ''} onChange={(e) => {
            let val = e.target.value.replace(/\D/g, '')
            if (val.length > 11) val = val.slice(0, 11)
            let formatted = val
            if (val.length > 2 && val.length <= 6) {
              formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`
            } else if (val.length > 6 && val.length <= 10) {
              formatted = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`
            } else if (val.length > 10) {
              formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
            }
            setForm(f => ({ ...f, telefone: formatted }))
          }} className="input-apple w-full" placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Voz</label>
          <select value={form.secao || ''} onChange={(e) => setForm(f => ({ ...f, secao: e.target.value }))} className="select-apple w-full">
            <option value="">Selecionar...</option>
            {voices.map(v => <option key={v.id} value={v.label}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Instrumentos</label>
          <div
            onClick={() => setShowInstDropdown(!showInstDropdown)}
            className="input-apple w-full min-h-[42px] cursor-pointer flex flex-wrap gap-1"
          >
            {formInstrumentos.length === 0 ? (
              <span className="text-gray-400 dark:text-gray-500">Selecionar...</span>
            ) : (
              formInstrumentos.map(inst => (
                <span key={inst} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  {inst}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeInstrumento(inst); }} className="hover:text-purple-900">×</button>
                </span>
              ))
            )}
          </div>
          {showInstDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {instrumentosDisponiveis.map(inst => (
                <div key={inst} onClick={() => addInstrumento(inst)} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100">{inst}</div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Funções</label>
          <div
            onClick={() => setShowCargoDropdown(!showCargoDropdown)}
            className="input-apple w-full min-h-[42px] cursor-pointer flex flex-wrap gap-1"
          >
            {formCargos.length === 0 ? (
              <span className="text-gray-400 dark:text-gray-500">Selecionar...</span>
            ) : (
              formCargos.map(cargo => (
                <span key={cargo} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {cargo}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeCargo(cargo); }} className="hover:text-blue-900">×</button>
                </span>
              ))
            )}
          </div>
          {showCargoDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {cargosDisponiveis.map(cargo => (
                <div key={cargo} onClick={() => addCargo(cargo)} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100">{cargo}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Status</label>
        <select value={form.status || 'Ativo'} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="select-apple w-full">
          {statuses.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
        </select>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        {member && onDelete && (
          <button type="button" onClick={() => onDelete(member.id)} className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Excluir Integrante">
            <Trash2 size={20} />
          </button>
        )}
        <button onClick={onCancel} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
        <button onClick={() => onSave(form)} className="flex-1 bg-[#007AFF] text-white py-3 rounded-xl font-medium hover:bg-blue-600">{member ? 'Salvar Alterações' : 'Cadastrar'}</button>
      </div>
    </div>
  )
}

function JustificativasList({ alert, onSave, onCancel }) {
  const member = alert?.member;
  const mode = alert?.mode;
  const faltas = mode === 'pendentes' ? (member?.unjustified_list || []) : (member?.justified_list || []);

  const [justificativas, setJustificativas] = useState(() => {
    const initial = {};
    if (mode === 'justificadas') {
      faltas.forEach(f => {
        initial[f.call.id] = f.justificativa;
      });
    }
    return initial;
  });

  const updateJustificativa = (chamadaId, texto) => {
    setJustificativas(prev => ({ ...prev, [chamadaId]: texto }))
  }

  const handleSalvar = () => {
    onSave(member.id, justificativas)
  }

  if (faltas.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma falta para exibir.</p>

  const formatarData = (data) => {
    if (!data) return ''
    if (data.includes('-')) return data.split('-').reverse().join('/')
    return data
  }

  return (
    <div className="space-y-3">
      {faltas.map(falta => (
        <div key={falta.call.id} className="bg-gray-50 dark:bg-[#3A3A3C] rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{formatarData(falta.call.data)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">- {falta.call.contexto || falta.call.tipo}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Motivo (opcional)..."
              value={justificativas[falta.call.id] || ''}
              onChange={(e) => updateJustificativa(falta.call.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSalvar() }}
              className="input-apple text-sm flex-1"
            />
            <button
              onClick={() => updateJustificativa(falta.call.id, '')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shrink-0"
              title="Apagar Justificativa"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
          Cancelar
        </button>
        <button onClick={handleSalvar} className="flex-1 bg-[#007AFF] text-white py-3 rounded-xl font-medium hover:bg-blue-600">
          {mode === 'justificadas' ? 'Salvar Alterações' : 'Salvar Justificativas'}
        </button>
      </div>
    </div>
  )
}

function EdicaoDrawer({ chamada, members, onSave, onDelete, onClose }) {
  console.log('EdicaoDrawer received:', { chamada: { id: chamada?.id, data: chamada?.data, registros: chamada?.registros_json }, membersCount: members?.length })

  const attendanceContexts = useSettingsStore((s) => s.attendanceContexts) || []
  const registrosChamada = chamada?.registros_json || chamada?.registros || []
  const temRegistros = registrosChamada && registrosChamada.length > 0

  const [presencas, setPresencas] = useState(() => {
    const map = {}
    if (temRegistros) {
      registrosChamada.forEach(r => { map[r.membro_id] = r.presente })
    }
    return map
  })
  const [justificativas, setJustificativas] = useState(() => {
    const map = {}
    if (temRegistros) {
      registrosChamada.forEach(r => { map[r.membro_id] = r.justificativa || '' })
    }
    return map
  })
  const [search, setSearch] = useState('')
  const [contexto, setContexto] = useState(chamada?.contexto || chamada?.tipo || 'Ensaio Geral')

  const filteredMembers = members
    .filter(m => !search || m.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  const presenteKey = temRegistros ? (m) => presencas[m.id] !== false : () => true
  const ausenteKey = temRegistros ? (m) => presencas[m.id] === false : () => false

  const presentes = filteredMembers.filter(m => presenteKey(m)).length
  const ausentes = filteredMembers.filter(m => ausenteKey(m)).length

  const togglePresenca = (id) => setPresencas(p => ({ ...p, [id]: p[id] === false ? true : false }))
  const updateJustificativa = (id, text) => setJustificativas(prev => ({ ...prev, [id]: text }))

  const handleSalvar = async () => {
    const registros = filteredMembers.map(m => ({
      membro_id: m.id,
      presente: presencas[m.id] !== false,
      justificativa: justificativas[m.id] || ''
    }))
    console.log('Salvando chamada:', { chamadaId: chamada.id, registros, contexto })
    try {
      await onSave(chamada.id, registros, contexto)
      onClose()
    } catch (err) {
      console.error('Erro ao salvar:', err)
    }
  }

  const formatarDataEdicao = (data) => {
    if (!data) return 'Data inválida'
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/')
      return `${dia}/${mes}/${ano}`
    }
    const dateObj = new Date(data)
    if (isNaN(dateObj.getTime())) return data
    return dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const titulo = `Editando Chamada - ${formatarDataEdicao(chamada.data)}`

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#3A3A3C] flex justify-between items-center bg-white dark:bg-[#1C1C1E]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{titulo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-100 dark:bg-[#3A3A3C] hover:bg-gray-200 dark:hover:bg-[#48484A] rounded-full p-2 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#F5F5F7] dark:bg-[#000000]">
          <div className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm p-3 mb-3 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar integrante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-apple pl-10 w-full"
              />
            </div>
            <select
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              className="select-apple sm:w-36"
            >
              {attendanceContexts.map(ctx => (
                <option key={ctx.id} value={ctx.label}>{ctx.label}</option>
              ))}
              <option value="Ensaio Geral">Ensaio Geral</option>
              <option value="Culto Dominical">Culto Dominical</option>
              <option value="Culto de Celebração">Culto de Celebração</option>
              <option value="Ensaio de Naipe">Ensaio de Naipe</option>
            </select>
          </div>

          {filteredMembers.map(member => {
            const presente = presencas[member.id] !== false
            const showJustificativa = presencas[member.id] === false
            return (
              <div key={member.id} className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.nome} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{member.nome}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.secao || member.instrumento_voz || 'Músico'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePresenca(member.id)} className={`w-10 h-10 rounded-full font-semibold text-sm transition-all ${presente ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600'}`}>P</button>
                    <button onClick={() => togglePresenca(member.id)} className={`w-10 h-10 rounded-full font-semibold text-sm transition-all ${!presente ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600'}`}>F</button>
                  </div>
                </div>
                {showJustificativa && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar motivo da falta (opcional)"
                      value={justificativas[member.id] || ''}
                      onChange={(e) => updateJustificativa(member.id, e.target.value)}
                      className="input-apple text-sm flex-1"
                    />
                    <button
                      onClick={() => updateJustificativa(member.id, '')}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shrink-0"
                      title="Apagar Justificativa"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1C1C1E] flex justify-between items-center">
          <div className="flex gap-6">
            <span className="font-bold text-gray-900 dark:text-white">{presentes} Presentes</span>
            <span className="font-bold text-gray-900 dark:text-white">{ausentes} Ausentes</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { if (confirm('Tem certeza que deseja excluir esta chamada?')) { onDelete(chamada.id).then(onClose).catch(console.error) } }} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30">Excluir</button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
            <button onClick={handleSalvar} className="px-6 py-2 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-blue-600">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  )
}