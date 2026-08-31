import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Edit2, Plus, ClipboardList, History, Bell, Users2, MessageSquare, Check, X, Cake, CheckCircle, BellRing, Clock, XCircle, Music, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import MultiSelect from '../components/ui/MultiSelect'
import ConfirmModal from '../components/ui/ConfirmModal'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import useMembersStore from '../store/membersStore'
import useSettingsStore from '../store/settingsStore'
import useToastStore from '../store/toastStore'
import useAuthStore from '../store/authStore'

const normalizeStr = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

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

const toTitleCase = (str) => {
  if (!str) return str
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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
  const [historicoPage, setHistoricoPage] = useState(1)
  const [historicoItemsPerPage, setHistoricoItemsPerPage] = useState(20)
  const [alertSearch, setAlertSearch] = useState('')
  const [alertSubTab, setAlertSubTab] = useState('pendentes')
  const [alertMonth, setAlertMonth] = useState(new Date().toISOString().slice(0, 7))
  const [activeMetric, setActiveMetric] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [memberDeleteId, setMemberDeleteId] = useState(null)
  const [chamadaDeleteId, setChamadaDeleteId] = useState(null)

  const toggleMetric = (metric) => {
    setActiveMetric(prev => {
      const next = prev === metric ? null : metric
      if (next === 'aniversarios') {
        setSortConfig({ key: 'data_nascimento', direction: 'asc' })
      }
      return next
    })
  }

  const storeMembers = useMembersStore((s) => s.members) || []
  const storeAttendance = useMembersStore((s) => s.attendance) || []
  const addMember = useMembersStore((s) => s.addMember)
  const updateMember = useMembersStore((s) => s.updateMember)
  const removeMember = useMembersStore((s) => s.removeMember)
  const deleteCall = useMembersStore((s) => s.deleteCall)
  const updateAttendance = useMembersStore((s) => s.updateAttendance)
  const showToast = useToastStore((s) => s.showToast)

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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, vozFilter, instrumentoFilter, funcaoFilter, statusFilter, activeMetric])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (searchParams.has('view')) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('view')
      setSearchParams(newParams)
    }
  }

  const SECOES_VOCAIS = ['soprano', 'contralto', 'tenor', 'baixo', 'alto', 'mezzo', 'mezzo-soprano', 'barítono', 'baritono']

  const isOrquestra = (m) => {
    const instrumento = (m.instrumento_voz || '').trim().toLowerCase()
    return instrumento !== '' && !SECOES_VOCAIS.includes(instrumento)
  }

  const filteredMembers = storeMembers.filter(member => {
    if (searchText) {
      const searchNorm = normalizeStr(searchText).toLowerCase()
      const searchDigits = searchText.replace(/\D/g, '')
      const matchNome = normalizeStr(member.nome).toLowerCase().includes(searchNorm)
      const matchTelefone = member.telefone && searchDigits && member.telefone.replace(/\D/g, '').includes(searchDigits)
      if (!matchNome && !matchTelefone) return false
    }
    if (vozFilter && member.secao !== vozFilter) return false
    if (instrumentoFilter && !normalizeStr(member.instrumento_voz).toLowerCase().includes(normalizeStr(instrumentoFilter).toLowerCase())) return false
    if (funcaoFilter && !normalizeStr(member.cargo).toLowerCase().includes(normalizeStr(funcaoFilter).toLowerCase())) return false
    if (statusFilter && member.status !== statusFilter) return false
    if (activeMetric === 'ativos' && member.status !== 'Ativo') return false
    if (activeMetric === 'licenca' && member.status !== 'Licença') return false
    if (activeMetric === 'inativos' && member.status !== 'Inativo') return false
    if (activeMetric === 'orquestra' && !isOrquestra(member)) return false
    if (activeMetric === 'aniversarios' && !isAniversarioMes(member.data_nascimento)) return false
    return true
  }).sort((a, b) => {
    if (!sortConfig.key) return 0

    if (activeMetric === 'aniversarios' && sortConfig.key === 'data_nascimento') {
      const extractDayMonth = (data) => {
        if (!data) return ''
        if (data.includes('-')) {
          const parts = data.split('-')
          return `${parts[1]}-${parts[2]}`
        }
        const parts = data.split('/')
        return `${parts[1]}-${parts[0]}`
      }
      const aVal = extractDayMonth(a[sortConfig.key])
      const bVal = extractDayMonth(b[sortConfig.key])
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    }

    const aVal = a[sortConfig.key] || ''
    const bVal = b[sortConfig.key] || ''
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
  const alertSearchNorm = normalizeStr(alertSearch).toLowerCase()
  const pendingAlerts = membersWithAbsencesData.filter(m => m.unjustified_absences >= 3 && (!alertSearch || normalizeStr(m.nome).toLowerCase().includes(alertSearchNorm)))
  const justifiedAlerts = membersWithAbsencesData.filter(m => m.justified_absences > 0 && (!alertSearch || normalizeStr(m.nome).toLowerCase().includes(alertSearchNorm)))
  const hasPendingAlerts = membersWithAbsencesData.some(m => m.unjustified_absences >= 3)

  const formatarDataEdicaoTitulo = (data) => {
    if (!data) return 'Data inválida'
    const dataStr = data.includes('/') ? data.split('/').reverse().join('-') : data
    const dateObj = new Date(`${dataStr}T12:00:00`)
    if (isNaN(dateObj.getTime())) return data
    const formatado = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    return formatado.charAt(0).toUpperCase() + formatado.slice(1)
  }

  const handleSaveEdicaoChamada = async (chamadaId, novosRegistros, novoContexto, novaData) => {
    try {
      await updateAttendance(chamadaId, { registros_json: novosRegistros, contexto: novoContexto, data: novaData })
      setEditingChamada(null)
      showToast('Chamada atualizada com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar edição:', err)
      showToast('Erro ao salvar as alterações.', 'error')
    }
  }

  const getStatusVariant = (status) => {
    if (status === 'Ativo') return 'success'
    if (status === 'Licença') return 'warning'
    if (status === 'Inativo') return 'danger'
    return 'neutral'
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
      showToast('Ocorreu um erro ao salvar as justificativas.', 'error')
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
    orquestra: storeMembers.filter(m => isOrquestra(m)).length,
    aniversariantes: storeMembers.filter(m => isAniversarioMes(m.data_nascimento)).length
  }

  return (
    <div className="min-h-screen pb-12">
      <Topbar title="Gestão Igreja" />
      <div className="px-8 max-w-7xl mx-auto mt-8">
        {editingChamada && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="heading-1">Editando Chamada</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{formatarDataEdicaoTitulo(editingChamada.data)}</p>
              </div>
              <button
                onClick={() => setEditingChamada(null)}
                title="Fechar edição"
                className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <ChamadaTab
              members={storeMembers.filter(m => m.status === 'Ativo')}
              isEditing
              chamada={editingChamada}
              onSaveEdit={handleSaveEdicaoChamada}
              onCancelEdit={() => setEditingChamada(null)}
              onDeleteEdit={(id) => setChamadaDeleteId(id)}
            />
          </>
        )}
        {!editingChamada && (
        <>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-1">Integrantes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie o corpo musical e coralistas.</p>
          </div>
          {activeTab === 'lista' && (
            <button onClick={() => setShowDrawer(true)} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors">
              <Plus size={18} /> Novo Integrante
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          <button onClick={() => handleTabChange('lista')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'lista' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <Users2 size={16} />Lista
          </button>
          <button onClick={() => handleTabChange('chamada')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chamada' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <ClipboardList size={16} />Chamada
          </button>
          <button onClick={() => handleTabChange('historico')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'historico' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <History size={16} />Histórico
          </button>
          <button
            onClick={() => handleTabChange('alertas')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'alertas' ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            title="Membros ativos com 3 ou mais faltas não justificadas no mês selecionado."
          >
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
              {[
                { key: 'total', label: 'Total', value: stats.total, icon: <Users2 size={24} strokeWidth={2} />, color: 'blue' },
                { key: 'ativos', label: 'Ativos', value: stats.ativos, icon: <CheckCircle size={24} strokeWidth={2} />, color: 'green' },
                { key: 'licenca', label: 'Licença', value: stats.licenca, icon: <Clock size={24} strokeWidth={2} />, color: 'amber' },
                { key: 'inativos', label: 'Inativos', value: stats.inativos, icon: <XCircle size={24} strokeWidth={2} />, color: 'red' },
                { key: 'orquestra', label: 'Orquestra', value: stats.orquestra, icon: <Music size={24} strokeWidth={2} />, color: 'purple' },
                { key: 'aniversarios', label: 'Aniversários', value: stats.aniversariantes, icon: <Cake size={24} strokeWidth={2} />, color: 'pink' },
              ].map(({ key, label, value, icon, color }) => {
                const isActive = activeMetric === key
                const colorMap = {
                  blue: { icon: 'bg-gray-100 dark:bg-gray-800 text-primary dark:text-blue-300', ring: 'ring-2 ring-primary/30' },
                  green: { icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', ring: 'ring-2 ring-green-400 dark:ring-green-500' },
                  amber: { icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', ring: 'ring-2 ring-amber-400 dark:ring-amber-500' },
                  red: { icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', ring: 'ring-2 ring-red-400 dark:ring-red-500' },
                  purple: { icon: 'bg-gray-100 dark:bg-gray-800 text-primary dark:text-blue-300', ring: 'ring-2 ring-primary/30' },
                  pink: { icon: 'bg-gray-100 dark:bg-gray-800 text-primary dark:text-blue-300', ring: 'ring-2 ring-primary/30' },
                }
                const c = colorMap[color]
                return (
                  <div
                    key={key}
                    onClick={() => key === 'total' ? setActiveMetric(null) : toggleMetric(key)}
                    className={`metric-card animate-slide-up group transition-all cursor-pointer ${isActive || (key === 'total' && activeMetric === null) ? c.ring + ' bg-gray-50 dark:bg-[#3A3A3C]' : ''}`}
                  >
                    <div className="mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${c.icon}`}>
                        {icon}
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                  </div>
                )
              })}
            </div>

            {/* Filtros */}
            {(() => {
              const hasActiveFilters = searchText || vozFilter || instrumentoFilter || funcaoFilter || statusFilter
              const clearFilters = () => { setSearchText(''); setVozFilter(''); setInstrumentoFilter(''); setFuncaoFilter(''); setStatusFilter('') }
              return (
                <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-500 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-500">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Search size={14} />
                      Filtros
                      {hasActiveFilters && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
                          {[searchText, vozFilter, instrumentoFilter, funcaoFilter, statusFilter].filter(Boolean).length}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="label mb-1.5">Buscar</label>
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <input type="text" placeholder="Nome ou telefone..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="input pl-8 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="label mb-1.5">Voz / Naipe</label>
                        <Select
                          options={[{ value: '', label: 'Todas' }, ...voices.map(v => ({ value: v.label, label: v.label }))]}
                          value={vozFilter}
                          onChange={(val) => setVozFilter(val)}
                          size="sm"
                        />
                      </div>
                      <div>
                        <label className="label mb-1.5">Instrumento</label>
                        <Select
                          options={[{ value: '', label: 'Todos' }, ...instruments.map(v => ({ value: v.label, label: v.label }))]}
                          value={instrumentoFilter}
                          onChange={(val) => setInstrumentoFilter(val)}
                          size="sm"
                        />
                      </div>
                      <div>
                        <label className="label mb-1.5">Função</label>
                        <Select
                          options={[{ value: '', label: 'Todas' }, ...positions.map(v => ({ value: v.label, label: v.label }))]}
                          value={funcaoFilter}
                          onChange={(val) => setFuncaoFilter(val)}
                          size="sm"
                        />
                      </div>
                      <div>
                        <label className="label mb-1.5">Status</label>
                        <Select
                          options={[{ value: '', label: 'Todos' }, ...statuses.map(v => ({ value: v.label, label: v.label }))]}
                          value={statusFilter}
                          onChange={(val) => setStatusFilter(val)}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-500 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#1C1C1E] border-b border-gray-100 dark:border-gray-500">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none w-80" onClick={() => handleSort('nome')}>
                      <div className="flex items-center gap-1">Integrante {sortConfig.key === 'nome' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
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
                      <td colSpan="7" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Search size={40} className="text-gray-300 mb-3" />
                          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Nenhum integrante encontrado</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tente ajustar os filtros ou o termo de busca.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedMembers.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 w-76 max-w-0">
                          <div className="flex items-center gap-3">
                            <Avatar name={member.nome} size="sm" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-medium text-gray-900 dark:text-white truncate" title={toTitleCase(member.nome)}>{toTitleCase(member.nome)}</span>
                                {isAniversarioMes(member.data_nascimento) && <Cake size={13} className="text-amber-400 shrink-0" title="Aniversariante do Mês" />}
                              </div>
                              {member.telefone && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatarTelefone(member.telefone)}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatarDataNascimento(member.data_nascimento)}</td>
                        <td className="px-4 py-3">{member.secao ? <Badge variant="primary">{toTitleCase(member.secao)}</Badge> : <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-3">
                          {member.instrumento_voz && member.instrumento_voz.split(', ').filter(i => i !== member.secao).sort((a, b) => a.localeCompare(b, 'pt-BR')).join(', ') ? <Badge variant="primary">{toTitleCase(member.instrumento_voz.split(', ').filter(i => i !== member.secao).sort((a, b) => a.localeCompare(b, 'pt-BR')).join(', '))}</Badge> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3">{member.cargo ? <Badge variant="neutral">{toTitleCase(member.cargo.split(', ').sort((a, b) => a.localeCompare(b, 'pt-BR')).join(', '))}</Badge> : <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-3"><Badge variant={getStatusVariant(member.status)}>{toTitleCase(member.status)}</Badge></td>
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
              {filteredMembers.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-500">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>Mostrando</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)}
                    </span>
                    <span>de</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{filteredMembers.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
                      className="text-sm border-0 bg-gray-50 dark:bg-[#3A3A3C] rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary/30 dark:focus:ring-blue-400/40 cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <ChevronUp className="rotate-[-90deg]" size={18} />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <ChevronUp className="rotate-[90deg]" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chamada' && <ChamadaTab members={storeMembers.filter(m => m.status === 'Ativo')} />}

        {activeTab === 'historico' && (
          <>
            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-500 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Histórico de Chamadas</h3>
              <div className="flex flex-wrap items-end gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <label className="label mb-2">Buscar</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome..."
                      value={historicoNameFilter}
                      onChange={(e) => { setHistoricoNameFilter(e.target.value); setHistoricoPage(1) }}
                      className="input pl-10 w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="label mb-2">Contexto</label>
                  <Select
                    options={[{ value: '', label: 'Todos os contextos' }, ...attendanceContexts.map(ctx => ({ value: ctx.label, label: ctx.label }))]}
                    value={historicoFilter}
                    onChange={(val) => { setHistoricoFilter(val); setHistoricoPage(1) }}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="label mb-2">Mês</label>
                  <input
                    type="month"
                    value={historicoDateFilter}
                    onChange={(e) => { setHistoricoDateFilter(e.target.value); setHistoricoPage(1) }}
                    className="input w-auto min-w-[140px]"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-500 shadow-sm overflow-hidden mt-4">
              {(() => {
                const filtered = storeAttendance.filter(item => {
                    if (historicoFilter && !normalizeStr(item.contexto).toLowerCase().includes(normalizeStr(historicoFilter).toLowerCase())) return false
                  if (historicoDateFilter) {
                    const itemDate = item.data ? item.data.split('T')[0] : item.data
                    let itemYearMonth = ''
                    if (itemDate.includes('-')) {
                      itemYearMonth = itemDate.slice(0, 7)
                    } else if (itemDate.includes('/')) {
                      const parts = itemDate.split('/')
                      itemYearMonth = `${parts[2]}-${parts[1]}`
                    }
                    if (itemYearMonth !== historicoDateFilter) return false
                  }
                  if (historicoNameFilter) {
                    const registros = item.registros_json || []
                    const hasName = registros.some(r => {
                      const member = storeMembers.find(m => m.id === r.membro_id)
                      return normalizeStr(member?.nome).toLowerCase().includes(normalizeStr(historicoNameFilter).toLowerCase())
                    })
                    if (!hasName) return false
                  }
                  return true
                })

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <History size={40} className="text-gray-300 mb-3" />
                      <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Nenhum histórico encontrado</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">As chamadas salvas aparecerão aqui.</p>
                    </div>
                  )
                }

                const historicoTotalPages = Math.ceil(filtered.length / historicoItemsPerPage)
                const paginatedHistorico = filtered.slice((historicoPage - 1) * historicoItemsPerPage, historicoPage * historicoItemsPerPage)

                return (
                  <>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {paginatedHistorico.map(item => {
                        const registros = item.registros_json || []
                        const presentes = registros.filter(r => r.presente).length
                        const ausentes = registros.filter(r => !r.presente).length
                        const attendancePercent = registros.length > 0 ? Math.round((presentes / registros.length) * 100) : 0

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

                        const percentClass = attendancePercent >= 80 ? 'text-green-600' : attendancePercent >= 50 ? 'text-yellow-600' : 'text-red-600'

                        return (
                          <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#3A3A3C] transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary dark:text-blue-300 shrink-0">
                                  <History size={18} />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{dataFormatada}</p>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium badge-neutral mt-0.5">
                                    {item.contexto}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-center">
                                  <p className="text-xl font-bold text-green-600 tabular-nums">{presentes}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">presentes</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold text-red-500 tabular-nums">{ausentes}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">ausentes</p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-xl font-bold tabular-nums ${percentClass}`}>{attendancePercent}%</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">presença</p>
                                </div>
                                <button onClick={() => setEditingChamada(item)} title="Editar chamada" className="p-2.5 rounded-xl text-gray-400 hover:text-primary dark:hover:text-blue-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                                  <Edit2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-500">
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>Mostrando</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {((historicoPage - 1) * historicoItemsPerPage) + 1} - {Math.min(historicoPage * historicoItemsPerPage, filtered.length)}
                        </span>
                        <span>de</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={historicoItemsPerPage}
                          onChange={(e) => { setHistoricoItemsPerPage(Number(e.target.value)); setHistoricoPage(1) }}
                          className="text-sm border-0 bg-gray-50 dark:bg-[#3A3A3C] rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary/30 dark:focus:ring-blue-400/40 cursor-pointer"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => setHistoricoPage(p => Math.max(1, p - 1))}
                            disabled={historicoPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            <ChevronUp className="rotate-[-90deg]" size={18} />
                          </button>
                          {Array.from({ length: Math.min(5, historicoTotalPages) }, (_, i) => {
                            let pageNum
                            if (historicoTotalPages <= 5) {
                              pageNum = i + 1
                            } else if (historicoPage <= 3) {
                              pageNum = i + 1
                            } else if (historicoPage >= historicoTotalPages - 2) {
                              pageNum = historicoTotalPages - 4 + i
                            } else {
                              pageNum = historicoPage - 2 + i
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setHistoricoPage(pageNum)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${historicoPage === pageNum ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                          <button
                            onClick={() => setHistoricoPage(p => Math.min(historicoTotalPages, p + 1))}
                            disabled={historicoPage === historicoTotalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            <ChevronUp className="rotate-[90deg]" size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}

            </div>
          </>
        )
        }

        {
          activeTab === 'alertas' && (
            <>
              <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-500 p-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alertas de Frequência</h3>
                </div>
                <div className="flex flex-wrap items-end gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <label className="label mb-2">Buscar</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={alertSearch}
                        onChange={(e) => setAlertSearch(e.target.value)}
                        className="input pl-10 w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label mb-2">Mês</label>
                    <input
                      type="month"
                      value={alertMonth}
                      onChange={(e) => setAlertMonth(e.target.value)}
                      className="input w-auto min-w-[140px]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-gray-500 shadow-sm overflow-hidden mt-4">
                <div className="flex border-b border-gray-100 dark:border-gray-500 px-4">
                  <button
                    onClick={() => setAlertSubTab('pendentes')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${alertSubTab === 'pendentes' ? 'border-primary text-primary dark:text-blue-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    <div className="relative flex items-center justify-center">
                      <BellRing size={14} />
                      {hasPendingAlerts && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />}
                    </div>
                    Pendentes
                    {pendingAlerts.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${alertSubTab === 'pendentes' ? 'bg-primary/10 text-primary dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                        {pendingAlerts.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setAlertSubTab('justificadas')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${alertSubTab === 'justificadas' ? 'border-primary text-primary dark:text-blue-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    <CheckCircle size={14} />
                    Justificadas
                    {justifiedAlerts.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${alertSubTab === 'justificadas' ? 'bg-primary/10 text-primary dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                        {justifiedAlerts.length}
                      </span>
                    )}
                  </button>
                </div>
                {(() => {
                  const fmtCallDate = (d) => d ? (d.includes('-') ? d.split('-').reverse().join('/') : d) : ''
                  if (alertSubTab === 'pendentes') {
                    if (pendingAlerts.length === 0) return (
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <BellRing className="w-16 h-16 text-gray-300 mb-4" />
                        <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Nenhum alerta no momento</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">Nenhum integrante com 3+ faltas não justificadas no mês selecionado.</p>
                      </div>
                    )
                    const sorted = [...pendingAlerts].sort((a, b) => b.unjustified_absences - a.unjustified_absences)
                    return (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {sorted.map(member => (
                          <div key={member.id} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-[#3A3A3C] transition-colors">
                            <div className="relative shrink-0">
                              <Avatar name={member.nome} size="md" />
                              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                {member.unjustified_absences}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white leading-tight">{member.nome}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{member.secao || member.cargo || '—'}</p>
                              {member.unjustified_list.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {member.unjustified_list.map((falta, i) => (
                                    <span key={i} className="text-[11px] px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium">
                                      {fmtCallDate(falta.call.data)}{falta.call.contexto ? ` · ${falta.call.contexto}` : ''}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right hidden sm:block">
                                <p className="text-2xl font-bold text-red-500 leading-none tabular-nums">{member.unjustified_absences}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">faltas</p>
                              </div>
                              <button
                                onClick={() => setJustifyingAlert({ member, mode: 'pendentes' })}
                                className="px-3 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors whitespace-nowrap"
                              >
                                Justificar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  } else {
                    if (justifiedAlerts.length === 0) return (
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Nenhuma justificativa</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">Nenhuma falta foi justificada no mês selecionado.</p>
                      </div>
                    )
                    return (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {justifiedAlerts.map(member => (
                          <div key={member.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-[#3A3A3C] transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="relative shrink-0">
                                <Avatar name={member.nome} size="md" />
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                  {member.justified_absences}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white leading-tight">{member.nome}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{member.secao || member.cargo || '—'}</p>
                                  </div>
                                  <button
                                    onClick={() => setJustifyingAlert({ member, mode: 'justificadas' })}
                                    title="Editar justificativas"
                                    className="p-2.5 rounded-xl text-gray-400 hover:text-primary dark:hover:text-blue-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors shrink-0"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                </div>
                                <div className="space-y-2 mt-2.5">
                                  {member.justified_list.map((falta, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className="text-[11px] px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium shrink-0 mt-0.5">
                                        {fmtCallDate(falta.call.data)}
                                      </span>
                                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{falta.justificativa}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                })()}
              </div>
            </>
          )
        }
        </>
        )}
      </div >

      <Modal isOpen={showDrawer} onClose={() => { setShowDrawer(false); setEditingMember(null); }} title={editingMember ? 'Editar Integrante' : 'Novo Integrante'} size="lg">
        <MemberForm
          key={editingMember ? editingMember.id : 'new'}
          member={editingMember}
          onSave={async (data) => {
            try {
              const payload = {
                nome: toTitleCase(data.nome),
                telefone: data.telefone ? data.telefone.replace(/\D/g, '') : '',
                data_nascimento: data.data_nascimento,
                secao: toTitleCase(data.secao),
                instrumento_voz: (data.instrumentos || []).map(toTitleCase).join(', '),
                cargo: (data.cargos || []).map(toTitleCase).join(', '),
                status: toTitleCase(data.status)
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
            setMemberDeleteId(id)
          }}
        />
      </Modal>

      <Modal isOpen={!!justifyingAlert} onClose={() => setJustifyingAlert(null)} title={justifyingAlert?.mode === 'justificadas' ? `Editar Justificativas - ${justifyingAlert?.member?.nome}` : `Justificar Faltas - ${justifyingAlert?.member?.nome}`} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {justifyingAlert?.mode === 'justificadas' ? 'Edite os motivos das ausências ou deixe em branco para remover a justificativa.' : 'Preencha o motivo para cada ausência pendente.'}
          </p>
          <JustificativasList alert={justifyingAlert} onSave={handleSaveJustificativa} onCancel={() => setJustifyingAlert(null)} />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!memberDeleteId}
        onClose={() => setMemberDeleteId(null)}
        onConfirm={async () => {
          try {
            await removeMember(memberDeleteId)
            setShowDrawer(false)
            setEditingMember(null)
            setMemberDeleteId(null)
          } catch (err) {
            console.error('Erro ao excluir integrante:', err)
          }
        }}
        title="Excluir Integrante"
        description="O integrante será removido, mas o histórico de presenças nas chamadas passadas será preservado."
        confirmLabel="Sim, excluir integrante"
        danger
      />

      <ConfirmModal
        isOpen={!!chamadaDeleteId}
        onClose={() => setChamadaDeleteId(null)}
        onConfirm={async () => {
          try {
            await deleteCall(chamadaDeleteId)
            setChamadaDeleteId(null)
            setEditingChamada(null)
          } catch (err) {
            console.error('Erro ao excluir chamada:', err)
          }
        }}
        title="Excluir Chamada"
        description="Todos os registros de presença desta chamada serão removidos permanentemente."
        confirmLabel="Sim, excluir chamada"
        danger
      />
    </div >
  )
}

function ChamadaTab({ members, isEditing = false, chamada = null, onSaveEdit = null, onCancelEdit = null, onDeleteEdit = null }) {
  const attendanceContexts = useSettingsStore((s) => s.attendanceContexts) || []
  const saveAttendance = useMembersStore((s) => s.saveAttendance)
  const showToast = useToastStore((s) => s.showToast)
  const currentUser = useAuthStore((s) => s.user)

  const registrosChamada = chamada?.registros_json || chamada?.registros || null
  const defaultContexto = chamada?.contexto || chamada?.tipo || currentUser?.contexto_padrao || attendanceContexts[0]?.label || 'Ensaio Geral'

  const [dataChamada, setDataChamada] = useState(() => {
    if (!chamada?.data) return new Date().toISOString().split('T')[0]
    return chamada.data.includes('/') ? chamada.data.split('/').reverse().join('-') : chamada.data
  })
  const [contextoChamada, setContextoChamada] = useState(defaultContexto)
  const [presencas, setPresencas] = useState(() => {
    if (registrosChamada) {
      const map = {}
      registrosChamada.forEach(r => { map[r.membro_id] = r.presente })
      return map
    }
    return {}
  })
  const [justificativas, setJustificativas] = useState(() => {
    if (registrosChamada) {
      const map = {}
      registrosChamada.forEach(r => { map[r.membro_id] = r.justificativa || '' })
      return map
    }
    return {}
  })
  const [searchChamada, setSearchChamada] = useState('')
  const [motivoAbertoId, setMotivoAbertoId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [secoesColapsadas, setSecoesColapsadas] = useState({})
  const toggleSecao = (chave) => setSecoesColapsadas(prev => ({ ...prev, [chave]: !prev[chave] }))

  const SECOES_VOCAIS = ['soprano', 'contralto', 'tenor', 'baixo', 'alto', 'mezzo', 'mezzo-soprano', 'barítono', 'baritono']
  const isOrquestra = (m) => {
    const instrumento = (m.instrumento_voz || '').trim().toLowerCase()
    return instrumento !== '' && !SECOES_VOCAIS.includes(instrumento)
  }

  const grupoAtual = contextoChamada.toLowerCase().includes('orquestra') ? 'orquestra' : 'todos'
  const membersDoGrupo = members
    .filter(m => grupoAtual === 'orquestra' ? isOrquestra(m) : true)
  const filteredMembers = membersDoGrupo
    .filter(m => !searchChamada || normalizeStr(m.nome).toLowerCase().includes(normalizeStr(searchChamada).toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  const gruposOrdenados = (() => {
    const grupos = new Map()
    for (const m of filteredMembers) {
      let chave, ordem
      if (grupoAtual === 'orquestra') {
        // Ensaio de orquestra: agrupa por instrumento, já que a chamada é sobre os naipes instrumentais.
        chave = m.instrumento_voz || 'Outros'
        ordem = `2-${chave}`
      } else if (m.secao) {
        // Regra geral: agrupa por voz/naipe, mesmo quem também toca instrumento —
        // é a informação que a secretaria usa pra fazer a chamada do coral.
        chave = m.secao
        ordem = `1-${chave}`
      } else if (isOrquestra(m)) {
        // Sem voz cadastrada, mas toca instrumento: agrupa por instrumento como alternativa.
        chave = `Orquestra · ${m.instrumento_voz || 'Outros'}`
        ordem = `2-${chave}`
      } else {
        // Sem voz e sem instrumento: cai num grupo à parte, sempre por último.
        chave = 'Sem seção'
        ordem = `9-${chave}`
      }
      if (!grupos.has(chave)) grupos.set(chave, { chave, ordem, membros: [] })
      grupos.get(chave).membros.push(m)
    }
    return [...grupos.values()].sort((a, b) => a.ordem.localeCompare(b.ordem, 'pt-BR'))
  })()

  const total = filteredMembers.length
  const ausentes = filteredMembers.filter(m => presencas[m.id] === false).length
  const presentes = total - ausentes
  const faltasSemJustificativa = filteredMembers.filter(m => presencas[m.id] === false && !(justificativas[m.id] || '').trim()).length

  const setPresenca = (id, valor) => setPresencas(p => ({ ...p, [id]: valor }))

  const updateJustificativa = (id, text) => setJustificativas(prev => ({ ...prev, [id]: text }))

  const handleSave = async () => {
    const registros = membersDoGrupo.map(m => ({
      membro_id: m.id,
      presente: presencas[m.id] !== false,
      justificativa: justificativas[m.id] || ''
    }))

    if (onSaveEdit) {
      onSaveEdit(chamada.id, registros, contextoChamada, dataChamada)
    } else {
      setLoading(true)
      try {
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
      <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-500 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chamada</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label mb-2">Data</label>
            <input type="date" value={dataChamada} onChange={(e) => setDataChamada(e.target.value)} className="input w-auto" />
          </div>
          <div>
            <label className="label mb-2">Contexto</label>
            <Select
              options={attendanceContexts.map(ctx => ({ value: ctx.label, label: ctx.label }))}
              value={contextoChamada}
              onChange={(val) => setContextoChamada(val)}
              size="sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="label mb-2">Buscar</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar integrante..." aria-label="Buscar integrante" value={searchChamada} onChange={(e) => setSearchChamada(e.target.value)} className="input pl-10 w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-500 overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList size={40} className="text-gray-300 mb-3" />
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Nenhum integrante encontrado</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{members.length === 0 ? 'Adicione membros ativos para começar a registrar chamadas.' : 'Ajuste a busca para encontrar quem procura.'}</p>
            </div>
          ) : (
            gruposOrdenados.map(grupo => {
              const colapsado = !!secoesColapsadas[grupo.chave]
              return (
              <div key={grupo.chave}>
                {gruposOrdenados.length > 1 && (
                  <button
                    type="button"
                    onClick={() => toggleSecao(grupo.chave)}
                    aria-expanded={!colapsado}
                    className="w-full flex items-center justify-between gap-2 px-4 pt-3 pb-1 bg-gray-50/70 dark:bg-[#232325] hover:bg-gray-100 dark:hover:bg-[#2A2A2C] transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{grupo.chave} · {grupo.membros.length}</p>
                    <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${colapsado ? '-rotate-90' : ''}`} />
                  </button>
                )}
                {!colapsado && (
                <>
                {grupo.membros.map(member => {
                  const ausente = presencas[member.id] === false
                  const motivoAberto = motivoAbertoId === member.id
                  const temJustificativa = (justificativas[member.id] || '').trim() !== ''
                  return (
                    <div key={member.id} className={`p-3 sm:p-4 transition-colors ${ausente ? 'bg-red-50/60 dark:bg-red-900/10' : ''}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={member.nome} size="sm" />
                          <div className="min-w-0">
                            <p className={`font-medium truncate ${ausente ? 'text-gray-500 line-through decoration-red-300' : ''}`}>{member.nome}</p>
                            <p className="text-xs text-gray-500 truncate">{grupoAtual === 'orquestra' ? (member.instrumento_voz || 'Orquestra') : (member.secao || member.instrumento_voz || 'Músico')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!ausente ? (
                            <button
                              onClick={() => setPresenca(member.id, false)}
                              aria-pressed={false}
                              aria-label={`${member.nome}: marcar falta`}
                              title="Marcar falta"
                              className="h-10 px-4 rounded-full font-semibold text-sm transition-all bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-500 hover:text-white"
                            >
                              Falta
                            </button>
                          ) : (
                            <button
                              onClick={() => { setPresenca(member.id, true); setMotivoAbertoId(null) }}
                              aria-pressed={true}
                              aria-label={`${member.nome}: faltou, tocar para desfazer`}
                              title="Desfazer falta"
                              className="h-10 px-4 rounded-full font-semibold text-sm transition-all bg-red-500 text-white hover:bg-red-600"
                            >
                              Faltou
                            </button>
                          )}
                        </div>
                      </div>
                      {ausente && (
                        motivoAberto || temJustificativa ? (
                          <div className="mt-3 pl-11 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Motivo da falta (opcional)"
                              aria-label={`Motivo da falta de ${member.nome}`}
                              value={justificativas[member.id] || ''}
                              onChange={(e) => updateJustificativa(member.id, e.target.value)}
                              className="input text-sm flex-1"
                            />
                            {(justificativas[member.id] || '') !== '' && (
                              <button
                                onClick={() => updateJustificativa(member.id, '')}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shrink-0"
                                title="Apagar Justificativa"
                                aria-label={`Apagar justificativa de ${member.nome}`}
                              >
                                <X size={18} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2 pl-11">
                            <button
                              onClick={() => setMotivoAbertoId(member.id)}
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium add-affordance transition-colors"
                            >
                              + motivo
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )
                })}
                </>
                )}
              </div>
              )
            })
          )}
          {filteredMembers.length > 0 && total > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {total} integrantes{searchChamada ? ' encontrados' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-500 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex justify-between items-center gap-3 w-full">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">{presentes} presentes</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className={`font-bold whitespace-nowrap ${ausentes > 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{ausentes} {ausentes === 1 ? 'falta' : 'faltas'}</span>
            {faltasSemJustificativa > 0 && (
              <>
                <span className="hidden md:inline text-gray-300 dark:text-gray-600">·</span>
                <span className="hidden md:inline font-bold whitespace-nowrap text-amber-600 dark:text-amber-400">{faltasSemJustificativa} sem motivo</span>
              </>
            )}
          </div>
          {isEditing ? (
            <div className="flex gap-3">
              {onDeleteEdit && (
                <button onClick={() => onDeleteEdit(chamada.id)} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">Excluir</button>
              )}
              <Button variant="primary" onClick={handleSave}>Salvar Alterações</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {ausentes > 0 && (
                <button
                  onClick={() => { setPresencas({}); setJustificativas({}); setMotivoAbertoId(null) }}
                  className="h-10 px-4 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Limpar
                </button>
              )}
              <button onClick={handleSave} disabled={loading || success} className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {loading ? 'Salvando...' : success ? 'Salvo com sucesso!' : 'Salvar chamada'}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="h-20" />
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

  const instrumentOptions = instruments.map(i => ({ value: i.label, label: i.label }))
  const cargoOptions = positions.map(p => ({ value: p.label, label: p.label }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="label mb-2">Nome</label>
          <input type="text" value={form.nome || ''} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} className="input w-full" placeholder="Nome completo" />
        </div>
        <div>
          <label className="label mb-2">Nascimento</label>
          <input type="date" value={form.data_nascimento || ''} onChange={(e) => setForm(f => ({ ...f, data_nascimento: e.target.value }))} className="input w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label mb-2">Telefone</label>
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
          }} className="input w-full" placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label className="label mb-2">Voz</label>
          <Select
            options={[{ value: '', label: 'Selecionar...' }, ...voices.map(v => ({ value: v.label, label: v.label }))]}
            value={form.secao || ''}
            onChange={(val) => setForm(f => ({ ...f, secao: val }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label mb-2">Instrumentos</label>
          <MultiSelect
            options={instrumentOptions}
            values={form.instrumentos || []}
            onChange={(vals) => setForm(f => ({ ...f, instrumentos: vals }))}
            placeholder="Selecionar..."
          />
        </div>
        <div>
          <label className="label mb-2">Funções</label>
          <MultiSelect
            options={cargoOptions}
            values={form.cargos || []}
            onChange={(vals) => setForm(f => ({ ...f, cargos: vals }))}
            placeholder="Selecionar..."
          />
        </div>
      </div>

      <div>
        <label className="label mb-2">Status</label>
        <Select
          options={statuses.map(s => ({ value: s.label, label: s.label }))}
          value={form.status || 'Ativo'}
          onChange={(val) => setForm(f => ({ ...f, status: val }))}
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-500">
        {member && onDelete && (
          <button type="button" onClick={() => onDelete(member.id)} className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Excluir Integrante">
            <Trash2 size={20} />
          </button>
        )}
        <button onClick={onCancel} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
        <button onClick={() => onSave(form)} className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark">{member ? 'Salvar Alterações' : 'Cadastrar'}</button>
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
        <div key={falta.call.id} className="bg-gray-50 dark:bg-[#3A3A3C] rounded-xl p-3 border border-gray-100 dark:border-gray-500">
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
              className="input text-sm flex-1"
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
        <button onClick={handleSalvar} className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark">
          {mode === 'justificadas' ? 'Salvar Alterações' : 'Salvar Justificativas'}
        </button>
      </div>
    </div>
  )
}

