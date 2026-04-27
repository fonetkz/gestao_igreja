import React, { useState } from 'react'
import { Search, Edit2, Plus, ClipboardList, History, Bell, Users2, MessageSquare, Check, X, Cake, CheckCircle, BellRing, Clock, XCircle, Music, ChevronUp, ChevronDown } from 'lucide-react'
import Topbar from '../components/layout/Topbar'

function Badge({ children, variant = 'default' }) {
  const variants = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    default: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
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
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

const mockMembers = [
  { id: 1, nome: 'Gustavo Henrique', telefone: '(17) 99123-4567', data_nascimento: '15/04/1990', secao: 'Tenor', instrumento_voz: 'Violino', cargo: 'Músico', status: 'Ativo' },
  { id: 2, nome: 'Aline Souza', telefone: '(17) 99234-5678', data_nascimento: '22/08/1995', secao: 'Soprano', instrumento_voz: 'Flauta', cargo: 'Músico', status: 'Ativo' },
  { id: 3, nome: 'Carlos Eduardo', telefone: '(17) 99345-6789', data_nascimento: '03/12/1988', secao: 'Baixo', instrumento_voz: 'Trompete', cargo: 'Músico', status: 'Em Licença' },
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

const mockAlertasIniciais = [
  { id: 1, nome: 'Gustavo Henrique', secao: 'Tenor', faltas: 3, resolvido: false, justificativa: '' },
  { id: 2, nome: 'Mariana Santos', secao: 'Contralto', faltas: 3, resolvido: false, justificativa: '' },
]

const voiceOptions = ['', 'Soprano', 'Contralto', 'Tenor', 'Baixo']
const instrumentOptions = ['', 'Violino', 'Flauta', 'Clarinete', 'Trompete', 'Violão', 'Piano', 'Violoncelo']
const statusOptions = ['', 'Ativo', 'Em Licença', 'Inativo']
const functionOptions = ['', 'Músico', 'Regente', 'Coordenadora', 'Auxiliar']

const formatarDataNascimento = (data) => {
  if (!data) return '—'
  const [dia, mes, ano] = data.split('/')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${dia} ${meses[parseInt(mes, 10) - 1]} ${ano}`
}

const isAniversarioMes = (data) => {
  if (!data) return false
  const [, mes] = data.split('/')
  const mesAtual = new Date().getMonth() + 1
  return parseInt(mes, 10) === mesAtual
}

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState('lista')
  const [searchText, setSearchText] = useState('')
  const [vozFilter, setVozFilter] = useState('')
  const [instrumentoFilter, setInstrumentoFilter] = useState('')
  const [funcaoFilter, setFuncaoFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [justifyingAlert, setJustifyingAlert] = useState(null)
  const [editingHistory, setEditingHistory] = useState(null)
  const [editingChamada, setEditingChamada] = useState(null)
  const [historico, setHistorico] = useState(mockHistorico)
  const [alertas, setAlertas] = useState(mockAlertasIniciais)
  const [activeAlertTab, setActiveAlertTab] = useState('pendentes')
  const [alertSearch, setAlertSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' })

  const filteredMembers = mockMembers.filter(m => {
    if (statusFilter && m.status !== statusFilter) return false
    if (vozFilter && m.secao !== vozFilter) return false
    if (instrumentoFilter && m.instrumento_voz !== instrumentoFilter) return false
    if (funcaoFilter && m.cargo !== funcaoFilter) return false
    if (searchText) {
      const term = searchText.toLowerCase()
      if (!m.nome.toLowerCase().includes(term) && !m.telefone.toLowerCase().includes(term)) return false
    }
    return true
  }).sort((a, b) => {
    let valA = a[sortConfig.key] || ''
    let valB = b[sortConfig.key] || ''
    if (sortConfig.key === 'data_nascimento') {
      valA = a.data_nascimento ? a.data_nascimento.split('/').slice(0, 2).reverse().join('') : ''
      valB = b.data_nascimento ? b.data_nascimento.split('/').slice(0, 2).reverse().join('') : ''
    }
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const getStatusVariant = (status) => {
    if (status === 'Ativo') return 'green'
    if (status === 'Em Licença') return 'yellow'
    if (status === 'Inativo') return 'red'
    return 'default'
  }

  const handleSaveJustificativa = (alertaId, justificativa) => {
    setAlertas(prev => prev.map(a => a.id === alertaId ? { ...a, resolvido: true, justificativa } : a))
    setJustifyingAlert(null)
  }

  const handleSaveEdicaoChamada = (chamadaId, novosRegistros, novoContexto) => {
    setHistorico(prev => prev.map(h => {
      if (h.id === chamadaId) {
        const presentes = novosRegistros.filter(r => r.presente).length
        const ausentes = novosRegistros.filter(r => !r.presente).length
        return { ...h, tipo: novoContexto, contexto: novoContexto, registros: novosRegistros, presentes, ausentes }
      }
      return h
    }))
    setEditingHistory(null)
    setEditingChamada(null)
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const stats = {
    total: mockMembers.length,
    ativos: mockMembers.filter(m => m.status === 'Ativo').length,
    licenca: mockMembers.filter(m => m.status === 'Em Licença').length,
    inativos: mockMembers.filter(m => m.status === 'Inativo').length,
    orquestra: mockMembers.filter(m => m.instrumento_voz && m.instrumento_voz !== '').length,
    aniversariantes: mockMembers.filter(m => isAniversarioMes(m.data_nascimento)).length
  }

  return (
    <div className="min-h-screen pb-12">
      <Topbar title="Gestão Igreja" />
      <div className="px-8 max-w-7xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Integrantes</h1>
            <p className="text-gray-500 mt-1">Gerencie o corpo musical e coralistas.</p>
          </div>
          <button onClick={() => setShowDrawer(true)} className="bg-[#007AFF] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-600">
            <Plus size={18} /> Novo Integrante
          </button>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('lista')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'lista' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            <Users2 size={16} className="inline mr-2" />Lista
          </button>
          <button onClick={() => setActiveTab('chamada')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'chamada' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            <ClipboardList size={16} className="inline mr-2" />Chamada
          </button>
          <button onClick={() => setActiveTab('historico')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'historico' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            <History size={16} className="inline mr-2" />Histórico
          </button>
          <button onClick={() => setActiveTab('alertas')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'alertas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            <Bell size={16} className="inline mr-2" />Alertas
          </button>
        </div>

        {activeTab === 'lista' && (
          <div className="space-y-4">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"><Users2 size={20} /></div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Total</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"><CheckCircle size={20} /></div>
                <p className="text-2xl font-bold text-gray-900">{stats.ativos}</p>
                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Ativos</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"><Clock size={20} /></div>
                <p className="text-2xl font-bold text-gray-900">{stats.licenca}</p>
                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Em Licença</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"><XCircle size={20} /></div>
                <p className="text-2xl font-bold text-gray-900">{stats.inativos}</p>
                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Inativos</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"><Music size={20} /></div>
                <p className="text-2xl font-bold text-gray-900">{stats.orquestra}</p>
                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Orquestra</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"><Cake size={20} /></div>
                <p className="text-2xl font-bold text-gray-900">{stats.aniversariantes}</p>
                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Aniversários</p>
              </div>
            </div>

            {/* Filtros Justificados */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Buscar..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:bg-white outline-none transition-all" />
                </div>
                <select value={vozFilter} onChange={(e) => setVozFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm">
                  {voiceOptions.map(v => <option key={v} value={v}>{v || 'Todas as vozes'}</option>)}
                </select>
                <select value={instrumentoFilter} onChange={(e) => setInstrumentoFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm">
                  {instrumentOptions.map(v => <option key={v} value={v}>{v || 'Todos os instrum.'}</option>)}
                </select>
                <select value={funcaoFilter} onChange={(e) => setFuncaoFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm">
                  {functionOptions.map(v => <option key={v} value={v}>{v || 'Todas as funções'}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm">
                  {statusOptions.map(v => <option key={v} value={v}>{v || 'Todos os status'}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort('nome')}>
                      <div className="flex items-center gap-1">Integrante {sortConfig.key === 'nome' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                      Contato
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort('data_nascimento')}>
                      <div className="flex items-center gap-1">Nascimento {sortConfig.key === 'data_nascimento' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort('secao')}>
                      <div className="flex items-center gap-1">Voz {sortConfig.key === 'secao' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort('instrumento_voz')}>
                      <div className="flex items-center gap-1">Instrumento {sortConfig.key === 'instrumento_voz' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort('cargo')}>
                      <div className="flex items-center gap-1">Função {sortConfig.key === 'cargo' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 cursor-pointer hover:bg-gray-200 transition-colors select-none" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</div>
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Search size={40} className="text-gray-300 mb-3" />
                          <p className="text-base font-semibold text-gray-700">Nenhum integrante encontrado</p>
                          <p className="text-sm text-gray-500 mt-1">Tente ajustar os filtros ou o termo de busca.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={member.nome} size="sm" /><div className="flex items-center gap-1.5"><span className="font-medium">{member.nome}</span>{isAniversarioMes(member.data_nascimento) && <Cake size={14} className="text-amber-400" title="Aniversariante do Mês" />}</div></div></td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.telefone}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatarDataNascimento(member.data_nascimento)}</td>
                        <td className="px-4 py-3">{member.secao ? <Badge variant="blue">{member.secao}</Badge> : <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-3">{member.instrumento_voz ? <Badge variant="purple">{member.instrumento_voz}</Badge> : <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-3"><Badge variant="default">{member.cargo}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={getStatusVariant(member.status)}>{member.status}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => { setEditingMember(member); setShowDrawer(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chamada' && <ChamadaTab members={mockMembers.filter(m => m.status === 'Ativo')} />}

        {activeTab === 'historico' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Histórico de Chamadas</h3>
            <div className="space-y-3">
              {historico.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold">{item.data}</p>
                    <p className="text-sm text-gray-500">{item.tipo}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">{item.presentes}</p>
                      <p className="text-xs text-gray-500">Presentes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-red-500">{item.ausentes}</p>
                      <p className="text-xs text-gray-500">Ausentes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">{Math.round((item.presentes / (item.presentes + item.ausentes)) * 100)}%</p>
                      <p className="text-xs text-gray-500">Presença</p>
                    </div>
                    <button onClick={() => setEditingChamada(item)} className="ml-4 px-4 py-2 text-sm font-medium text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={16} className="inline mr-1" />Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alertas' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Alertas de Frequência</h3>

            <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveAlertTab('pendentes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeAlertTab === 'pendentes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Pendentes ({alertas.filter(a => !a.resolvido).length})
              </button>
              <button
                onClick={() => setActiveAlertTab('resolvidos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeAlertTab === 'resolvidos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Resolvidos ({alertas.filter(a => a.resolvido).length})
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={alertSearch}
                  onChange={(e) => setAlertSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              {activeAlertTab === 'pendentes' ? (
                alertas.filter(a => !a.resolvido && (!alertSearch || a.nome.toLowerCase().includes(alertSearch.toLowerCase()))).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <BellRing className="w-16 h-16 text-gray-300 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-700">Tudo tranquilo por aqui!</h4>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm">Nenhum alerta de frequência pendente encontrado no momento.</p>
                  </div>
                ) : (
                  alertas.filter(a => !a.resolvido && (!alertSearch || a.nome.toLowerCase().includes(alertSearch.toLowerCase()))).map(alerta => (
                    <div key={alerta.id} className="flex items-start justify-between p-4 rounded-xl border bg-red-50 border-red-100">
                      <div className="flex items-start gap-4">
                        <Avatar name={alerta.nome} size="md" />
                        <div>
                          <p className="font-semibold">{alerta.nome}</p>
                          <p className="text-sm text-gray-500">{alerta.secao} - {alerta.faltas} faltas consecutivas</p>
                        </div>
                      </div>
                      <button onClick={() => setJustifyingAlert(alerta)} className="bg-[#007AFF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600">
                        Justificar Falta
                      </button>
                    </div>
                  ))
                )
              ) : (
                alertas.filter(a => a.resolvido && (!alertSearch || a.nome.toLowerCase().includes(alertSearch.toLowerCase()))).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-700">Nenhum alerta resolvido ainda</h4>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm">Os alertas resolvidos aparecerão aqui após justificadas as faltas.</p>
                  </div>
                ) : (
                  alertas.filter(a => a.resolvido && (!alertSearch || a.nome.toLowerCase().includes(alertSearch.toLowerCase()))).map(alerta => (
                    <div key={alerta.id} className="flex items-start justify-between p-4 rounded-xl border bg-green-50 border-green-100">
                      <div className="flex items-start gap-4">
                        <Avatar name={alerta.nome} size="md" />
                        <div>
                          <p className="font-semibold">{alerta.nome}</p>
                          <p className="text-sm text-gray-500">{alerta.secao} - {alerta.faltas} faltas consecutivas</p>
                          <div className="mt-3 border-t border-green-200/50 pt-3 flex flex-col gap-1.5">
                            <div className="text-sm">
                              <span className="font-medium text-green-800">19/04 (Culto):</span>{' '}
                              <span className="text-green-700/80">Viagem a trabalho</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-green-800">12/04 (Ensaio):</span>{' '}
                              <span className="text-green-700/80">Problema de saúde</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-green-800">05/04 (Culto):</span>{' '}
                              <span className="text-gray-500 italic">Sem justificativa</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="green">Resolvido</Badge>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showDrawer} onClose={() => { setShowDrawer(false); setEditingMember(null); }} title={editingMember ? 'Editar Integrante' : 'Novo Integrante'} size="lg">
        <MemberForm member={editingMember} onSave={(data) => { console.log('Salvo:', data); setShowDrawer(false); setEditingMember(null); }} onCancel={() => { setShowDrawer(false); setEditingMember(null); }} />
      </Modal>

      <Modal isOpen={!!justifyingAlert} onClose={() => setJustifyingAlert(null)} title={`Justificar Faltas - ${justifyingAlert?.nome}`} size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Preencha o motivo para cada ausência pendente.</p>
          <JustificativasList alert={justifyingAlert} onSave={handleSaveJustificativa} onCancel={() => setJustifyingAlert(null)} />
        </div>
      </Modal>

      {editingChamada && (
        <EdicaoDrawer
          chamada={editingChamada}
          members={mockMembers.filter(m => m.status === 'Ativo')}
          onSave={handleSaveEdicaoChamada}
          onClose={() => setEditingChamada(null)}
        />
      )}
    </div>
  )
}

function ChamadaTab({ members, isEditing = false, chamada = null, onSaveEdit = null, onCancelEdit = null }) {
  const [dataChamada, setDataChamada] = useState(chamada?.data ? chamada.data.split('/').reverse().join('-') : '2026-04-26')
  const [contextoChamada, setContextoChamada] = useState(chamada?.tipo || 'Ensaio Geral')
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

  const filteredMembers = members
    .filter(m => !searchChamada || m.nome.toLowerCase().includes(searchChamada.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  const total = filteredMembers.length
  const presentes = filteredMembers.filter(m => presencas[m.id] !== false && presencas[m.id] !== undefined).length || (total > 0 && Object.keys(presencas).length === 0 ? total : filteredMembers.filter(m => presencas[m.id] !== false).length)
  const ausentes = filteredMembers.filter(m => presencas[m.id] === false).length

  const togglePresenca = (id) => setPresencas(p => ({ ...p, [id]: p[id] === false ? true : false }))

  const updateJustificativa = (id, text) => setJustificativas(prev => ({ ...prev, [id]: text }))

  const handleSave = () => {
    if (onSaveEdit) {
      const registros = filteredMembers.map(m => ({
        membro_id: m.id,
        presente: presencas[m.id] !== false,
        justificativa: justificativas[m.id] || ''
      }))
      onSaveEdit(chamada.id, registros)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Data</label>
            <input type="date" value={dataChamada} onChange={(e) => setDataChamada(e.target.value)} className="px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Contexto</label>
            <select value={contextoChamada} onChange={(e) => setContextoChamada(e.target.value)} className="px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm">
              <option value="Ensaio Geral">Ensaio Geral</option>
              <option value="Culto Dominical">Culto Dominical</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Buscar</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar membro..." value={searchChamada} onChange={(e) => setSearchChamada(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
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
                  <div className="mt-3 pl-11">
                    <input
                      type="text"
                      placeholder="Adicionar motivo da falta (opcional)"
                      value={justificativas[member.id] || ''}
                      onChange={(e) => updateJustificativa(member.id, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 flex justify-between items-center z-50">
        <div className="flex gap-6">
          <span className="font-bold text-gray-900">{presentes} Presentes</span>
          <span className="font-bold text-gray-900">{ausentes} Ausentes</span>
        </div>
        {isEditing ? (
          <div className="flex gap-3">
            <button onClick={onCancelEdit} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
            <button onClick={handleSave} className="bg-[#007AFF] text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600">Salvar Alterações</button>
          </div>
        ) : (
          <button className="bg-[#007AFF] text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600">Salvar Chamada</button>
        )}
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
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{presentes}</p>
          <p className="text-xs text-gray-500">Presentes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{ausentes}</p>
          <p className="text-xs text-gray-500">Ausentes</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {registros.map(reg => (
          <div key={reg.membro_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Avatar name={getMemberName(reg.membro_id)} size="sm" />
              <div>
                <p className="font-medium">{getMemberName(reg.membro_id)}</p>
                <p className="text-xs text-gray-500">{getMemberRole(reg.membro_id)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateRegistro(reg.membro_id, { presente: true, justificativa: '' })}
                className={`w-12 h-8 rounded-lg font-semibold text-sm transition-all ${reg.presente ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
              >
                P
              </button>
              <button
                onClick={() => updateRegistro(reg.membro_id, { presente: false })}
                className={`w-12 h-8 rounded-lg font-semibold text-sm transition-all ${!reg.presente ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
              >
                F
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button onClick={() => onSave(chamada.id, registros)} className="flex-1 bg-[#007AFF] text-white py-3 rounded-xl font-medium hover:bg-blue-600">
          Salvar Alterações
        </button>
        <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200">
          Cancelar
        </button>
      </div>
    </div>
  )
}

function MemberForm({ member, onSave, onCancel }) {
  const [form, setForm] = useState(member || { nome: '', telefone: '', data_nascimento: '', secao: '', instrumentos: [], cargos: [], status: 'Ativo' })

  const formInstrumentos = form?.instrumentos || []
  const formCargos = form?.cargos || []

  const [showInstDropdown, setShowInstDropdown] = useState(false)
  const [showCargoDropdown, setShowCargoDropdown] = useState(false)

  const instrumentosDisponiveis = ['Violino', 'Flauta', 'Clarinete', 'Trompete', 'Violão', 'Piano', 'Violoncelo']
  const cargosDisponiveis = ['Músico', 'Regente', 'Coordenadora', 'Auxiliar']

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
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nome</label>
          <input type="text" value={form.nome || ''} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm" placeholder="Nome completo" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nascimento</label>
          <input type="date" value={form.data_nascimento || ''} onChange={(e) => setForm(f => ({ ...f, data_nascimento: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Telefone</label>
          <input type="text" value={form.telefone || ''} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm" placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Voz</label>
          <select value={form.secao || ''} onChange={(e) => setForm(f => ({ ...f, secao: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm">
            <option value="">Selecionar...</option>
            <option value="Soprano">Soprano</option>
            <option value="Contralto">Contralto</option>
            <option value="Tenor">Tenor</option>
            <option value="Baixo">Baixo</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Instrumentos</label>
          <div
            onClick={() => setShowInstDropdown(!showInstDropdown)}
            className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm min-h-[42px] cursor-pointer flex flex-wrap gap-1"
          >
            {formInstrumentos.length === 0 ? (
              <span className="text-gray-400">Selecionar...</span>
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
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {instrumentosDisponiveis.map(inst => (
                <div key={inst} onClick={() => addInstrumento(inst)} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">{inst}</div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Funções</label>
          <div
            onClick={() => setShowCargoDropdown(!showCargoDropdown)}
            className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm min-h-[42px] cursor-pointer flex flex-wrap gap-1"
          >
            {formCargos.length === 0 ? (
              <span className="text-gray-400">Selecionar...</span>
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
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {cargosDisponiveis.map(cargo => (
                <div key={cargo} onClick={() => addCargo(cargo)} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">{cargo}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
        <select value={form.status || 'Ativo'} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm">
          <option value="Ativo">Ativo</option>
          <option value="Em Licença">Em Licença</option>
          <option value="Inativo">Inativo</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
        <button onClick={() => onSave(form)} className="flex-1 bg-[#007AFF] text-white py-3 rounded-xl font-medium hover:bg-blue-600">{member ? 'Salvar Alterações' : 'Cadastrar'}</button>
      </div>
    </div>
  )
}

function JustificativasList({ alert, onSave, onCancel }) {
  const mockFaltas = [
    { id: 1, data: '19/04', contexto: 'Culto de Celebração' },
    { id: 2, data: '12/04', contexto: 'Ensaio Geral' },
    { id: 3, data: '05/04', contexto: 'Culto Dominical' },
  ]

  const [justificativas, setJustificativas] = useState({})

  const updateJustificativa = (faltaId, texto) => {
    setJustificativas(prev => ({ ...prev, [faltaId]: texto }))
  }

  const handleSalvar = () => {
    const texto = Object.values(justificativas).filter(t => t).join('; ') || 'Faltas justificadas'
    onSave(alert.id, texto)
  }

  return (
    <div className="space-y-3">
      {mockFaltas.map(falta => (
        <div key={falta.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 text-sm">{falta.data}</span>
            <span className="text-xs text-gray-500">- {falta.contexto}</span>
          </div>
          <input
            type="text"
            placeholder="Motivo (opcional)..."
            value={justificativas[falta.id] || ''}
            onChange={(e) => updateJustificativa(falta.id, e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200">
          Cancelar
        </button>
        <button onClick={handleSalvar} className="flex-1 bg-[#007AFF] text-white py-3 rounded-xl font-medium hover:bg-blue-600">
          Salvar Justificativas
        </button>
      </div>
    </div>
  )
}

function EdicaoDrawer({ chamada, members, onSave, onClose }) {
  const [presencas, setPresencas] = useState(() => {
    const map = {}
    if (chamada?.registros) {
      chamada.registros.forEach(r => { map[r.membro_id] = r.presente })
    }
    return map
  })
  const [justificativas, setJustificativas] = useState(() => {
    const map = {}
    if (chamada?.registros) {
      chamada.registros.forEach(r => { map[r.membro_id] = r.justificativa || '' })
    }
    return map
  })
  const [search, setSearch] = useState('')
  const [contexto, setContexto] = useState(chamada?.tipo || chamada?.contexto || 'Ensaio Geral')

  const filteredMembers = members
    .filter(m => !search || m.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  const presentes = filteredMembers.filter(m => presencas[m.id] !== false).length
  const ausentes = filteredMembers.filter(m => presencas[m.id] === false).length

  const togglePresenca = (id) => setPresencas(p => ({ ...p, [id]: p[id] === false ? true : false }))
  const updateJustificativa = (id, text) => setJustificativas(prev => ({ ...prev, [id]: text }))

  const handleSalvar = () => {
    const registros = filteredMembers.map(m => ({
      membro_id: m.id,
      presente: presencas[m.id] !== false,
      justificativa: justificativas[m.id] || ''
    }))
    onSave(chamada.id, registros, contexto)
  }

  const [dia, mes, ano] = chamada.data.split('/')
  const titulo = `Editando Chamada - ${dia}/${mes}/${ano}`

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#F5F5F7]">
          <div className="bg-white rounded-xl shadow-sm p-3 mb-3 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar membro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm"
              />
            </div>
            <select
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              className="px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm sm:w-48 outline-none focus:ring-2 focus:ring-blue-500/30"
            >
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
              <div key={member.id} className="bg-white rounded-xl shadow-sm p-3 mb-3">
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
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Adicionar motivo da falta (opcional)"
                      value={justificativas[member.id] || ''}
                      onChange={(e) => updateJustificativa(member.id, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
          <div className="flex gap-6">
            <span className="font-bold text-gray-900">{presentes} Presentes</span>
            <span className="font-bold text-gray-900">{ausentes} Ausentes</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
            <button onClick={handleSalvar} className="px-6 py-2 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-blue-600">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  )
}