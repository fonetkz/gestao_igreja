import React, { useState } from 'react'
import { UserPlus, Search, Users2, Edit2, Calendar, Activity, UserX, Bell, ClipboardList, Trash2, CheckCircle, AlertTriangle, ArrowRight, UserCheck, UserMinus, History, Save, Pencil } from 'lucide-react'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import { Input } from '../components/ui/Input'
import Select from '../components/ui/Select'
import RadioGroup from '../components/ui/RadioGroup'
import Modal from '../components/ui/Modal'
import Topbar from '../components/layout/Topbar'
import DatePicker from '../components/ui/DatePicker'
import useMembersStore from '../store/membersStore'
import useSettingsStore from '../store/settingsStore'

const getColor = (color) => {
  switch (color) {
    case 'blue': return { gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25', border: 'border-blue-300 dark:border-blue-600', text: 'text-blue-600 dark:text-blue-400' }
    case 'purple': return { gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/25', border: 'border-purple-300 dark:border-purple-600', text: 'text-purple-600 dark:text-purple-400' }
    case 'emerald': return { gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25', border: 'border-emerald-300 dark:border-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' }
    case 'amber': return { gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/25', border: 'border-amber-300 dark:border-amber-600', text: 'text-amber-600 dark:text-amber-400' }
    case 'cyan': return { gradient: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/25', border: 'border-cyan-300 dark:border-cyan-600', text: 'text-cyan-600 dark:text-cyan-400' }
    default: return { gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25', border: 'border-blue-300 dark:border-blue-600', text: 'text-blue-600 dark:text-blue-400' }
  }
}

const StatCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: { gradient: 'from-blue-500 to-blue-600', iconColor: 'text-blue-600 dark:text-blue-400' },
    emerald: { gradient: 'from-emerald-500 to-emerald-600', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    slate: { gradient: 'from-slate-400 to-slate-500', iconColor: 'text-slate-500 dark:text-slate-400' },
    amber: { gradient: 'from-amber-500 to-amber-600', iconColor: 'text-amber-600 dark:text-amber-400' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  )
}

const monthOptions = [{ value: '01', label: 'Jan' }, { value: '02', label: 'Fev' }, { value: '03', label: 'Mar' }, { value: '04', label: 'Abr' }, { value: '05', label: 'Mai' }, { value: '06', label: 'Jun' }, { value: '07', label: 'Jul' }, { value: '08', label: 'Ago' }, { value: '09', label: 'Set' }, { value: '10', label: 'Out' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' }]

export default function MembersPage() {
  const [activeView, setActiveView] = useState('lista')

  const members = useMembersStore((s) => s.members)
  const addMember = useMembersStore((s) => s.addMember)
  const updateMember = useMembersStore((s) => s.updateMember)
  const positions = useSettingsStore((s) => s.positions)
  const voiceOptions = useSettingsStore((s) => s.voices) || []
  const instrumentOptions = useSettingsStore((s) => s.instruments) || []
  const statuses = useSettingsStore((s) => s.statuses) || []
  const attendanceContexts = useSettingsStore((s) => s.attendanceContexts) || []
  const saveAttendance = useMembersStore((s) => s.saveAttendance)
  const attendance = useMembersStore((s) => s.attendance) || []

  const [form, setForm] = useState({ nome: '', instrumentos: [], vozes: [], cargos: [], telefone: '', data_nascimento: '', status: 'Ativo' })
  const [errors, setErrors] = useState({})
  const [searchText, setSearchText] = useState('')
  const [vozFilter, setVozFilter] = useState('')
  const [instrumentoFilter, setInstrumentoFilter] = useState('')
  const [funcaoFilter, setFuncaoFilter] = useState('')
  const [nascimentoFilter, setNascimentoFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingMember, setEditingMember] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const itemsPerPage = 10

  const monthOptions = [{ value: '01', label: 'Jan' }, { value: '02', label: 'Fev' }, { value: '03', label: 'Mar' }, { value: '04', label: 'Abr' }, { value: '05', label: 'Mai' }, { value: '06', label: 'Jun' }, { value: '07', label: 'Jul' }, { value: '08', label: 'Ago' }, { value: '09', label: 'Set' }, { value: '10', label: 'Out' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' }]
  const activeMembers = members.filter(m => m.status === 'Ativo')
  const [dataChamada, setDataChamada] = useState(new Date().toISOString().split('T')[0])
  const [contextoChamada, setContextoChamada] = useState(attendanceContexts[0]?.value || 'Ensaio Geral')
  const [presencas, setPresencas] = useState({})
  const [justificativas, setJustificativas] = useState({})
  const [chamadaLoading, setChamadaLoading] = useState(false)
  const [chamadaSuccess, setChamadaSuccess] = useState(false)
  const [searchChamada, setSearchChamada] = useState('')
  const [showConfirmSave, setShowConfirmSave] = useState(false)

  const isVoice = (v) => voiceOptions.some(voice => voice.value === v || voice.label === v)

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 0) val = '(' + val
    if (val.length > 3) val = val.slice(0, 3) + ') ' + val.slice(3)
    if (val.length > 10) val = val.slice(0, 10) + '-' + val.slice(10, 14)
    setForm(f => ({ ...f, telefone: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (form.instrumentos.length === 0 && form.vozes.length === 0) newErrors.music = 'Adicione pelo menos um naipe ou instrumento'
    if (form.cargos.length === 0) newErrors.cargos = 'Adicione pelo menos um cargo'

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

    await addMember(payload)
    setActiveView('lista')
    setForm({ nome: '', instrumentos: [], vozes: [], cargos: [], telefone: '', data_nascimento: '', status: 'Ativo' })
    setErrors({})
  }

  const togglePresenca = (id) => setPresencas(prev => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }))
  const isPresent = (id) => presencas[id] === undefined ? true : presencas[id]

  const handleConfirmChamada = () => setShowConfirmSave(true)
  const handleSalvarChamada = async () => {
    setShowConfirmSave(false)
    setChamadaLoading(true)
    try {
      const registros = activeMembers.map(m => ({
        membro_id: m.id,
        presente: presencas[m.id] === undefined ? true : presencas[m.id],
        justificativa: presencas[m.id] === false ? (justificativas[m.id] || '') : ''
      }))
      await saveAttendance(dataChamada, contextoChamada, registros)
      setChamadaSuccess(true)
      setTimeout(() => { setChamadaSuccess(false); setPresencas({}); setJustificativas({}) }, 3000)
    } catch (err) { console.error(err) } finally { setChamadaLoading(false) }
  }

  const filteredCallMembers = [...activeMembers]
    .filter(m => !searchChamada || m.nome.toLowerCase().includes(searchChamada.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const filtered = members.filter(m => {
    if (statusFilter && m.status !== statusFilter) return false
    if (searchText) {
      const term = searchText.toLowerCase().replace(/\D/g, '')
      const nomeLower = (m.nome || '').toLowerCase()
      const telefoneOnly = (m.telefone || '').replace(/\D/g, '')
      if (!nomeLower.includes(term) && !telefoneOnly.includes(term)) return false
    }
    if (vozFilter && !(m.secao || '').toLowerCase().includes(vozFilter.toLowerCase())) return false
    if (instrumentoFilter && !(m.instrumento_voz || '').toLowerCase().includes(instrumentoFilter.toLowerCase())) return false
    if (funcaoFilter && !(m.cargo || '').toLowerCase().includes(funcaoFilter.toLowerCase())) return false
    if (nascimentoFilter) {
      const birthMonth = m.data_nascimento ? m.data_nascimento.split('-')[1] : ''
      if (birthMonth !== nascimentoFilter) return false
    }
    return true
  })

  const sortedMembers = [...filtered].sort((a, b) => b.id - a.id)
  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage)
  const paginatedMembers = sortedMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const actives = members.filter(m => m.status === 'Ativo').length
  const inactives = members.filter(m => m.status !== 'Ativo').length
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')
  const birthdayCount = members.filter(m => { if (!m.data_nascimento) return false; const month = m.data_nascimento.split('-')[1]; return month === currentMonth; }).length

  const renderForm = (isEdit = false) => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Input label="Nome" value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} error={errors.nome} placeholder="Nome completo" />
        <Input label="Telefone" value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
        <DatePicker label="Nascimento" value={form.data_nascimento} onChange={(e) => setForm(f => ({ ...f, data_nascimento: e.target.value }))} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Voz do Coral</label>
          <Select options={[{ value: '', label: 'Adicionar...' }, ...voiceOptions]} value="" onChange={(v) => v && !form.vozes.includes(v) && setForm(f => ({ ...f, vozes: [...f.vozes, v] }))} size="sm" className="mb-2" />
          {form.vozes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.vozes.map(v => (
                <span key={v} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50 text-pink-700 dark:text-pink-300 rounded-xl text-xs font-semibold shadow-sm">
                  {v}
                  <button type="button" onClick={() => setForm(f => ({ ...f, vozes: f.vozes.filter(x => x !== v) }))} className="hover:opacity-70 ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Instrumento</label>
          <Select options={[{ value: '', label: 'Adicionar...' }, ...instrumentOptions]} value="" onChange={(v) => v && !form.instrumentos.includes(v) && setForm(f => ({ ...f, instrumentos: [...f.instrumentos, v] }))} size="sm" className="mb-2" />
          {form.instrumentos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.instrumentos.map(i => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-100 to-violet-200 dark:from-violet-900/50 dark:to-violet-800/50 text-violet-700 dark:text-violet-300 rounded-xl text-xs font-semibold shadow-sm">
                  {i}
                  <button type="button" onClick={() => setForm(f => ({ ...f, instrumentos: f.instrumentos.filter(x => x !== i) }))} className="hover:opacity-70 ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Função</label>
          <Select options={[{ value: '', label: 'Adicionar...' }, ...positions]} value="" onChange={(v) => v && !form.cargos.includes(v) && setForm(f => ({ ...f, cargos: [...f.cargos, v] }))} size="sm" className="mb-2" />
          {form.cargos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.cargos.map(c => (
                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold shadow-sm">
                  {c}
                  <button type="button" onClick={() => setForm(f => ({ ...f, cargos: f.cargos.filter(x => x !== c) }))} className="hover:opacity-70 ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Status</label>
        <RadioGroup options={statuses} value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))} />
      </div>

      {(errors.music || errors.cargos) && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl">
          {errors.music && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{errors.music}</p>}
          {errors.cargos && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{errors.cargos}</p>}
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <Button type="submit" variant="primary" icon={UserPlus} className="flex-1 h-12 text-base font-semibold">Cadastrar Membro</Button>
        <Button type="button" variant="ghost" onClick={() => { setActiveView('lista'); setForm({ nome: '', instrumentos: [], vozes: [], cargos: [], telefone: '', data_nascimento: '', status: 'Ativo' }); setErrors({}); }} className="flex-1 h-12 text-base font-semibold">Cancelar</Button>
      </div>
    </form>
  )

  const navItems = [
    { id: 'lista', icon: Users2, label: 'Lista de Membros', color: 'blue', action: 'Ver' },
    { id: 'cadastrar', icon: UserPlus, label: 'Cadastrar', color: 'emerald', action: 'Começar' },
    { id: 'chamada', icon: ClipboardList, label: 'Chamada', color: 'purple', action: 'Fazer' },
    { id: 'historico', icon: History, label: 'Histórico', color: 'cyan', action: 'Ver' },
    { id: 'alertas', icon: Bell, label: 'Alertas', color: 'amber', action: 'Ver' },
  ]

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Topbar title="Gestão Igreja" />
      <div className="px-5 md:px-8 max-w-7xl mx-auto mt-8 md:mt-12">
        {/* Navigation Cards */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            const c = getColor(item.color)
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`
                  group text-left bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 
                  transition-all duration-300 border 
                  ${isActive ? `${c.border} shadow-lg` : 'border-slate-100 dark:border-slate-700'}
                `}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center ${c.shadow} mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 truncate">
                  {item.label}
                </h3>
                <span className={`inline-flex items-center gap-1 font-medium text-xs ${c.text}`}>
                  {item.action} <ArrowRight size={12} />
                </span>
              </button>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          {/* LISTA */}
          {activeView === 'lista' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Total" value={members.length} icon={Users2} color="blue" />
                <StatCard label="Ativos" value={actives} icon={UserCheck} color="emerald" />
                <StatCard label="Inativos" value={inactives} icon={UserMinus} color="slate" />
                <StatCard label="Aniversariantes" value={birthdayCount} icon={Calendar} color="amber" />
              </div>

              {/* Table Card */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
                {/* Filters */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-6 gap-x-3 gap-y-2">
                    <div className="flex flex-col gap-1" style={{ minWidth: 180 }}>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Pesquisar</label>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                        <input type="text" placeholder="Buscar nome..." value={searchText} onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }} className="w-full pl-7 pr-2 py-1 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Voz</label>
                      <Select options={[{ value: '', label: 'Todas' }, ...voiceOptions]} value={vozFilter} onChange={(v) => { setVozFilter(v); setCurrentPage(1); }} className="w-full text-xs" size="sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Instrumento</label>
                      <Select options={[{ value: '', label: 'Todos' }, ...instrumentOptions]} value={instrumentoFilter} onChange={(v) => { setInstrumentoFilter(v); setCurrentPage(1); }} className="w-full text-xs" size="sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Função</label>
                      <Select options={[{ value: '', label: 'Todas' }, ...positions]} value={funcaoFilter} onChange={(v) => { setFuncaoFilter(v); setCurrentPage(1); }} className="w-full text-xs" size="sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Nascimento</label>
                      <Select options={[{ value: '', label: 'Todos' }, ...monthOptions]} value={nascimentoFilter} onChange={(v) => { setNascimentoFilter(v); setCurrentPage(1); }} className="w-full text-xs" size="sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                      <Select options={[{ value: '', label: 'Todos' }, ...statuses]} value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} className="w-full text-xs" size="sm" />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Membro</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Voz</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Instrumento</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Função</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nascimento</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 w-16 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Editar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {paginatedMembers.length === 0 ? (
                        <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">Nenhum membro encontrado</td></tr>
                      ) : paginatedMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={member.nome} initials={member.iniciais} size="sm" />
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{member.nome}</p>
                                <p className="text-xs text-slate-500">{member.telefone || 'Sem telefone'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1">
                              {member.secao ? member.secao.split(', ').map(s => <span key={s} className={`px-2 py-0.5 rounded text-[10px] font-bold ${isVoice(s) ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'}`}>{s}</span>) : <span className="text-slate-400">-</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1">
                              {member.instrumento_voz ? member.instrumento_voz.split(', ').map(i => <span key={i} className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded text-[10px] font-bold">{i}</span>) : <span className="text-slate-400">-</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1">
                              {member.cargo ? member.cargo.split(', ').map(c => <span key={c} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold">{c}</span>) : <span className="text-slate-400">-</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{member.data_nascimento ? new Intl.DateTimeFormat('pt-BR').format(new Date(member.data_nascimento)) : '-'}</td>
                          <td className="px-5 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.status === 'Ativo' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : member.status === 'Licença' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button onClick={() => { setEditingMember(member); setEditModalOpen(true); setForm({ nome: member.nome, telefone: member.telefone || '', data_nascimento: member.data_nascimento || '', status: member.status, instrumentos: member.secao?.split(', ') || [], vozes: member.instrumento_voz?.split(', ') || [], cargos: member.cargo?.split(', ') || [] }) }} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                              <Pencil size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-sm text-slate-500">Página {currentPage} de {totalPages}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</Button>
                      <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próxima</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CADASTRAR */}
          {activeView === 'cadastrar' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Novo Membro</h2>
                <p className="text-sm text-slate-500">Preencha os dados para cadastrar um novo membro</p>
              </div>
              {renderForm()}
            </div>
          )}

          {/* CHAMADA */}
          {activeView === 'chamada' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Data</label>
                          <input type="date" value={dataChamada} onChange={(e) => setDataChamada(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Contexto</label>
                          <Select options={attendanceContexts} value={contextoChamada} onChange={setContextoChamada} />
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleConfirmChamada} className="h-12 px-6" icon={Save}>
                      Salvar Chamada
                    </Button>
                  </div>
                </div>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Buscar membro..." value={searchChamada} onChange={(e) => setSearchChamada(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{filteredCallMembers.filter(m => isPresent(m.id)).length} Presentes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">{filteredCallMembers.filter(m => !isPresent(m.id)).length} Ausentes</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
                  {filteredCallMembers.map(m => {
                    const present = isPresent(m.id)
                    return (
                      <div key={m.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!present ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => togglePresenca(m.id)}>
                            <Avatar name={m.nome} initials={m.iniciais} size="md" />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 dark:text-white">{m.nome}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                {m.cargo && m.cargo.split(', ').map(c => (
                                  <span key={c} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold">{c}</span>
                                ))}
                                {m.secao && m.secao.split(', ').map(s => (
                                  <span key={s} className={`px-2 py-0.5 rounded text-[10px] font-bold ${isVoice(s) ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'}`}>{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!present && (
                              <input type="text" placeholder="Justificativa..." value={justificativas[m.id] || ''} onChange={(e) => setJustificativas(prev => ({ ...prev, [m.id]: e.target.value }))} className="w-48 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 placeholder:text-slate-400" />
                            )}
                            <button onClick={() => togglePresenca(m.id)} className="shrink-0">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${present ? 'bg-emerald-500 border-2 border-emerald-500 shadow-lg shadow-emerald-500/25' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-emerald-400'}`}>
                                {present && <CheckCircle size={20} className="text-white" />}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* HISTÓRICO */}
          {activeView === 'historico' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                      <History size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Histórico de Chamadas</h3>
                      <p className="text-sm text-slate-500">Todas as chamadas registradas</p>
                    </div>
                  </div>
                </div>
                {attendance.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <ClipboardList size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500">Nenhuma chamada registrada ainda.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {attendance.slice(0, 20).map(c => {
                      const presentes = c.registros_json?.filter(r => r.presente).length || 0
                      const total = c.registros_json?.length || 0
                      const pct = total > 0 ? Math.round((presentes / total) * 100) : 0
                      return (
                        <div key={c.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pct >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30' : pct >= 50 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                <Calendar size={20} className={pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'} />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{c.data?.split('-').reverse().join('/')}</p>
                                <p className="text-sm text-slate-500">{c.contexto}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{presentes}<span className="text-slate-400 font-normal">/{total}</span></p>
                                <p className="text-xs text-slate-500">{pct}% presença</p>
                              </div>
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${pct >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30' : pct >= 50 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                <span className={`text-lg font-bold ${pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{pct}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ALERTAS */}
          {activeView === 'alertas' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Bell size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Alertas de Frequência</h3>
                    <p className="text-sm text-slate-500">Membros com falta(s) frequente(s)</p>
                  </div>
                </div>
              </div>
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <AlertTriangle size={32} className="text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-slate-500">Em breve você poderá ver alertas de frequência.</p>
              </div>
            </div>
          )}
        </div>

        <Modal open={showConfirmSave} onOpenChange={setShowConfirmSave} title="Confirmar Chamada">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
            Tem certeza que deseja salvar esta chamada com {filteredCallMembers.filter(m => !isPresent(m.id)).length} ausência(s)?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="ghost" onClick={() => setShowConfirmSave(false)}>Cancelar</Button>
            <Button onClick={handleSalvarChamada} loading={chamadaLoading} variant="primary" icon={CheckCircle}>
              Confirmar
            </Button>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal open={editModalOpen} onOpenChange={setEditModalOpen} title="Editar Membro">
          {editingMember && (
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateMember(editingMember.id); setEditModalOpen(false); }} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Input label="Nome" value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} error={errors.nome} placeholder="Nome completo" />
                <Input label="Telefone" value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
                <DatePicker label="Nascimento" value={form.data_nascimento} onChange={(e) => setForm(f => ({ ...f, data_nascimento: e.target.value }))} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Voz do Coral</label>
                  <Select options={[{ value: '', label: 'Adicionar...' }, ...voiceOptions]} value="" onChange={(v) => v && !form.vozes.includes(v) && setForm(f => ({ ...f, vozes: [...f.vozes, v] }))} size="sm" className="mb-2" />
                  {form.vozes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.vozes.map(v => (
                        <span key={v} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50 text-pink-700 dark:text-pink-300 rounded-xl text-xs font-semibold shadow-sm">
                          {v}
                          <button type="button" onClick={() => setForm(f => ({ ...f, vozes: f.vozes.filter(x => x !== v) }))} className="hover:opacity-70 ml-0.5">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Instrumento</label>
                  <Select options={[{ value: '', label: 'Adicionar...' }, ...instrumentOptions]} value="" onChange={(v) => v && !form.instrumentos.includes(v) && setForm(f => ({ ...f, instrumentos: [...f.instrumentos, v] }))} size="sm" className="mb-2" />
                  {form.instrumentos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.instrumentos.map(i => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-100 to-violet-200 dark:from-violet-900/50 dark:to-violet-800/50 text-violet-700 dark:text-violet-300 rounded-xl text-xs font-semibold shadow-sm">
                          {i}
                          <button type="button" onClick={() => setForm(f => ({ ...f, instrumentos: f.instrumentos.filter(x => x !== i) }))} className="hover:opacity-70 ml-0.5">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Função</label>
                  <Select options={[{ value: '', label: 'Adicionar...' }, ...positions]} value="" onChange={(v) => v && !form.cargos.includes(v) && setForm(f => ({ ...f, cargos: [...f.cargos, v] }))} size="sm" className="mb-2" />
                  {form.cargos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.cargos.map(c => (
                        <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold shadow-sm">
                          {c}
                          <button type="button" onClick={() => setForm(f => ({ ...f, cargos: f.cargos.filter(x => x !== c) }))} className="hover:opacity-70 ml-0.5">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Status</label>
                <RadioGroup options={statuses} value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))} />
              </div>

              {(errors.music || errors.cargos) && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl">
                  {errors.music && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{errors.music}</p>}
                  {errors.cargos && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{errors.cargos}</p>}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)} className="flex-1 h-12 text-base font-semibold">Cancelar</Button>
                <Button type="submit" variant="primary" icon={Save} className="flex-1 h-12 text-base font-semibold">Salvar Alterações</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  )
}