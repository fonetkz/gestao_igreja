import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Mail, RotateCcw, Users2, Edit2, X, ClipboardCheck, Save, CheckCircle, Bell, AlertTriangle, Calendar, Check, RefreshCw, Search, History, Trash2 } from 'lucide-react'
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

function CadastroTab() {
  const members = useMembersStore((s) => s.members)
  const addMember = useMembersStore((s) => s.addMember)
  const updateMember = useMembersStore((s) => s.updateMember)
  const activeCount = useMembersStore((s) => s.getActiveCount)()
  const memberSections = useSettingsStore((s) => s.memberSections)

  const [form, setForm] = useState({ nome: '', instrumento_voz: '', telefone: '', data_nascimento: '', status: 'Ativo' })
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (!form.instrumento_voz) newErrors.instrumento_voz = 'Selecione um naipe'

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    const payload = {
      nome: form.nome,
      instrumento_voz: form.instrumento_voz,
      secao: form.instrumento_voz,
      telefone: form.telefone,
      data_nascimento: form.data_nascimento,
      status: form.status,
    }

    if (editingId) {
      await updateMember(editingId, payload)
    } else {
      await addMember(payload)
    }

    setForm({ nome: '', instrumento_voz: '', telefone: '', data_nascimento: '', status: 'Ativo' })
    setEditingId(null)
    setErrors({})
  }

  const handleEditClick = (member) => {
    setEditingId(member.id)
    setForm({
      nome: member.nome || '',
      instrumento_voz: member.instrumento_voz || '',
      telefone: member.telefone || '',
      data_nascimento: member.data_nascimento || '',
      status: member.status || 'Ativo'
    })
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({ nome: '', instrumento_voz: '', telefone: '', data_nascimento: '', status: 'Ativo' })
    setErrors({})
  }

  const filtered = !searchTerm.trim()
    ? members
    : members.filter(m => {
      const term = searchTerm.toLowerCase()
      return (m.nome || '').toLowerCase().includes(term) ||
        (m.instrumento_voz || '').toLowerCase().includes(term) ||
        (m.secao || '').toLowerCase().includes(term)
    })

  const recentMembers = [...filtered].sort((a, b) => b.id - a.id).slice(0, 10)

  const today = new Date()
  const dateStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(today)

  return (
    <div className="animate-fade-in space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-none shadow-lg h-full flex flex-col justify-between" padding="large">
            <div>
              <h3 className="heading-3 text-white mb-3">Integração de Talentos</h3>
              <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                Expanda sua galeria adicionando novos membros qualificados.
              </p>
            </div>
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-end gap-4">
                <div>
                  <span className="text-4xl font-black text-white">{activeCount}</span>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-[1.5px] text-blue-300 block mb-0.5">Membros</span>
                  <span className="text-sm font-semibold text-slate-300">Ativos na base</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card padding="large">
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="heading-3 text-slate-900 dark:text-white">{editingId ? 'Editar Registro' : 'Novo Registro'}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                {editingId ? 'Atualize as informações do membro selecionado' : 'Adicione um novo membro à sua lista'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Nome Completo" placeholder="ex: Elena Rossi" value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} error={errors.nome} />
              <Select label="Cargo ou Naipe" options={memberSections} value={form.instrumento_voz} onChange={(v) => setForm(f => ({ ...f, instrumento_voz: v }))} error={errors.instrumento_voz} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Data de Nascimento" type="date" value={form.data_nascimento} onChange={(e) => setForm(f => ({ ...f, data_nascimento: e.target.value }))} />
                <Input label="Telefone Celular" placeholder="(11) 90000-0000" value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} />
              </div>
              <div className="pt-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-3">Situação Atual</label>
                <RadioGroup options={[{ value: 'Ativo', label: 'Ativo' }, { value: 'Licença', label: 'Licença' }, { value: 'Ausente', label: 'Ausente' }]} value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))} />
              </div>
              <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                <Button type="submit" size="lg" className="flex-1" icon={editingId ? Edit2 : UserPlus}>{editingId ? 'Atualizar Cadastro' : 'Salvar Cadastro'}</Button>
                {editingId && <Button type="button" size="lg" variant="outline" onClick={handleCancelEdit} icon={X}>Cancelar</Button>}
              </div>
            </form>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="heading-2 text-slate-900 dark:text-white flex items-center gap-2">
              <Users2 size={24} />Membros Recentes
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Visualização rápida dos membros</p>
          </div>
          <div className="w-full max-w-sm">
            <Input placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <Card padding="none" className="overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
                  <th className="px-6 py-4 label-uppercase">Músico</th>
                  <th className="px-6 py-4 label-uppercase">Naipe / Função</th>
                  <th className="px-6 py-4 label-uppercase">Status</th>
                  <th className="px-6 py-4 label-uppercase text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={member.nome} initials={member.iniciais} size="md" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{member.nome}</p>
                          {member.telefone && <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{member.telefone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">{member.secao}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={member.status === 'Ativo' ? 'badge-success' : member.status === 'Licença' ? 'badge-warning' : 'badge-error'}>
                        <span className={`w-2 h-2 rounded-full ${member.status === 'Ativo' ? 'bg-emerald-500' : member.status === 'Licença' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleEditClick(member)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ChamadaTab() {
  const members = useMembersStore((s) => s.members)
  const saveAttendance = useMembersStore((s) => s.saveAttendance)
  const activeMembers = members.filter(m => m.status === 'Ativo')

  const [dataChamada, setDataChamada] = useState(new Date().toISOString().split('T')[0])
  const [contexto, setContexto] = useState('Ensaio Geral')
  const [presencas, setPresencas] = useState({})
  const [justificativas, setJustificativas] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
  const grouped = filtered.reduce((acc, m) => {
    const sec = m.secao || 'Outros'
    if (!acc[sec]) acc[sec] = []
    acc[sec].push(m)
    return acc
  }, {})
  const isPresent = (id) => presencas[id] === undefined ? true : presencas[id]
  const presentesCount = activeMembers.filter(m => isPresent(m.id)).length
  const faltasCount = activeMembers.length - presentesCount

  return (
    <div className="animate-fade-in space-y-6">
      <Card padding="large">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Data da Chamada" type="date" value={dataChamada} onChange={(e) => setDataChamada(e.target.value)} />
            <Select label="Contexto / Reunião" options={[{ value: 'Ensaio Geral', label: 'Ensaio Geral' }, { value: 'Culto de Domingo', label: 'Culto de Domingo' }, { value: 'Culto de Ensino', label: 'Culto de Ensino' }, { value: 'Apresentação Especial', label: 'Apresentação Especial' }]} value={contexto} onChange={setContexto} />
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

        <div className="space-y-8">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([secao, membros]) => (
            <div key={secao}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">{secao} <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs">{membros.length}</span></h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {membros.map(m => {
                  const present = isPresent(m.id)
                  return (
                    <div key={m.id} className={`flex flex-col p-3 rounded-xl border transition-all duration-200 ${present ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10' : 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10'}`}>
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => handleToggle(m.id)}>
                        <div className="flex items-center gap-3">
                          <Avatar name={m.nome} initials={m.iniciais} size="sm" />
                          <p className={`text-sm font-bold truncate ${present ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{m.nome}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${present ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-red-300 dark:border-red-600 text-transparent'}`}>
                          <CheckCircle size={14} className={present ? 'opacity-100' : 'opacity-0'} strokeWidth={3} />
                        </div>
                      </div>
                      {!present && (
                        <div className="mt-3 pt-3 border-t border-red-200/50 dark:border-red-900/30 animate-fade-in" onClick={e => e.stopPropagation()}>
                          <input type="text" placeholder="Motivo da falta (opcional)..." value={justificativas[m.id] || ''} onChange={(e) => setJustificativas(prev => ({ ...prev, [m.id]: e.target.value }))} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg focus:outline-none focus:border-red-400 text-slate-900 dark:text-white placeholder:text-red-300" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function MembersPage() {
  const navigate = useNavigate()
  const members = useMembersStore((s) => s.members)
  const hasAlerts = members.some(m => m.faltas_mes_atual >= 2)
  const attendance = useMembersStore((s) => s.attendance || [])
  const getProblematicMembers = useMembersStore((s) => s.getProblematicMembers)
  const justifyAbsences = useMembersStore((s) => s.justifyAbsences)
  const resetAbsences = useMembersStore((s) => s.resetAbsences)
  const updateCall = useMembersStore((s) => s.updateCall)
  const deleteCall = useMembersStore((s) => s.deleteCall)
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

  const toggleExpand = (id) => setExpandedCalls(prev => ({ ...prev, [id]: !prev[id] }))
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

  const problematic = getProblematicMembers()
  const filteredSearch = !searchTerm.trim() ? problematic : problematic.filter(m => (m.nome || '').toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEditJustification = (chamadaId, membroId, currentJustification) => {
    setEditingJustification(`${chamadaId}-${membroId}`)
    setJustificationText(currentJustification || '')
  }

  const handleTogglePresence = async (chamadaId, membroId) => {
    const chamada = attendance.find(c => c.id === chamadaId)
    if (!chamada) return

    const updated_regs = chamada.registros_json.map(r => {
      if (String(r.membro_id) === String(membroId)) {
        return { ...r, presente: !r.presente }
      }
      return r
    })

    await updateCall(chamadaId, updated_regs)
  }

  const handleSaveJustification = async (chamadaId, membroId) => {
    const chamada = attendance.find(c => c.id === chamadaId)
    if (!chamada) return

    const updated_regs = chamada.registros_json.map(r => {
      if (String(r.membro_id) === String(membroId)) {
        return { ...r, justificativa: justificationText }
      }
      return r
    })

    await updateCall(chamadaId, updated_regs)
    setEditingJustification(null)
  }

  const handleCancelJustification = () => {
    setEditingJustification(null)
    setJustificationText('')
  }

  return (
    <div className="min-h-screen pb-12">
      <Topbar
        title="Choir Deck"
        onBellClick={() => navigate('/membros?tab=alertas')}
        onSettingsClick={() => navigate('/configuracoes')}
      />
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
                      <tbody className="divide-y divide-slate-100">
                        {paginatedCalls.map(c => {
                          const regs = Array.isArray(c.registros_json) ? c.registros_json : []
                          const pres = regs.filter(r => r.presente).length
                          const falt = regs.filter(r => !r.presente).length
                          const total = pres + falt
                          const pct = total > 0 ? Math.round((pres / total) * 100) : 0
                          const isExpanded = expandedCalls[c.id]
                          return (
                            <React.Fragment key={c.id}>
                              <tr className="hover:bg-slate-50/50 cursor-pointer border-b border-slate-200 dark:border-slate-700" onClick={() => toggleExpand(c.id)}>
                                <td className="px-4 py-3 font-semibold">{formatDate(c.data)}</td>
                                <td className="px-4 py-3 text-sm">{c.contexto}</td>
                                <td className="px-4 py-3 text-center"><Badge variant="success">{pres}</Badge></td>
                                <td className="px-4 py-3 text-center"><Badge variant={falt > 0 ? 'danger' : 'neutral'}>{falt}</Badge></td>
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
                                  <td colSpan={6} className="p-4 bg-slate-50 border-b border-slate-200">
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
                                          {[...regs].filter(r => r.presente && (!expandedSearch[c.id] || getMemberName(r.membro_id).toLowerCase().includes(expandedSearch[c.id].toLowerCase()))).sort((a, b) => getMemberName(a.membro_id).localeCompare(getMemberName(b.membro_id))).map((r, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10">
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
                                          {[...regs].filter(r => !r.presente && (!expandedSearch[c.id] || getMemberName(r.membro_id).toLowerCase().includes(expandedSearch[c.id].toLowerCase()))).sort((a, b) => getMemberName(a.membro_id).localeCompare(getMemberName(b.membro_id))).map((r, i) => (
                                            <div key={i} className="flex flex-col p-3 rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10">
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
                                              <input
                                                type="text"
                                                placeholder="Motivo da falta (opcional)..."
                                                value={r.justificativa || ''}
                                                onChange={(e) => {
                                                  const updated_regs = attendance.find(a => a.id === c.id)?.registros_json.map(reg => {
                                                    if (String(reg.membro_id) === String(r.membro_id)) {
                                                      return { ...reg, justificativa: e.target.value }
                                                    }
                                                    return reg
                                                  })
                                                  if (updated_regs) updateCall(c.id, updated_regs)
                                                }}
                                                className="w-full mt-3 pt-3 border-t border-red-200/50 dark:border-red-900/30 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg focus:outline-none focus:border-red-400 text-slate-900 dark:text-white placeholder:text-red-300"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
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
                <Card padding="medium" className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-red-600" />
                    <div><span className="text-2xl font-bold text-red-700">{problematic.filter(m => m.faltas_mes_atual >= 3).length}</span><p className="text-xs font-semibold text-red-600">Críticos</p></div>
                  </div>
                </Card>
                <Card padding="medium" className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-amber-600" />
                    <div><span className="text-2xl font-bold text-amber-700">{problematic.filter(m => m.faltas_mes_atual === 2).length}</span><p className="text-xs font-semibold text-amber-600">Atenção</p></div>
                  </div>
                </Card>
                <Card padding="medium" className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Users2 size={20} className="text-blue-600" />
                    <div><span className="text-2xl font-bold text-blue-700">{problematic.length}</span><p className="text-xs font-semibold text-blue-600">Total</p></div>
                  </div>
                </Card>
              </div>
              <Card padding="none" className="overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Modal>
      </div>
      )