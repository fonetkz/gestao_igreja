import React, { useState, useMemo } from 'react'
import { Plus, X, Search, Music, Trash2, Save, Check, BookOpen, ChevronUp, ChevronDown, GripVertical, Clock } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import Modal from '../components/ui/Modal'

function HymnResultItem({ hymn, onAdd, isAdded }) {
  return (
    <button
      onClick={() => !isAdded && onAdd(hymn)}
      disabled={isAdded}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group text-left border border-blue-100 hover:border-blue-200 hover:bg-blue-50/50 ${
        isAdded ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-100' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-blue-900">
          <span className="text-[#007AFF]">#{hymn.numero}</span> — {hymn.titulo}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {hymn.ultimo_uso ? (
            <span className="text-xs text-blue-500 flex items-center gap-1">
              <Clock size={10} />
              Último uso: {hymn.ultimo_uso}
            </span>
          ) : (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
              Nunca tocado
            </span>
          )}
        </div>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-3 transition-colors ${
        isAdded ? 'bg-gray-200' : 'bg-blue-100 group-hover:bg-[#007AFF]'
      }`}>
        <Plus size={16} className={isAdded ? 'text-gray-400' : 'text-blue-600 group-hover:text-white'} />
      </div>
    </button>
  )
}

function ProgrammedHymnItem({ hymn, index, onRemove, onMove, total, isFirst, isLast }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex flex-col items-center gap-0.5 cursor-grab">
        <button disabled={isFirst} onClick={() => onMove(index, -1)} className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-30">
          <ChevronUp size={16} />
        </button>
        <GripVertical size={14} className="text-gray-300" />
        <button disabled={isLast} onClick={() => onMove(index, 1)} className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-30">
          <ChevronDown size={16} />
        </button>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[#007AFF] font-bold">#{hymn.numero}</span>
          <span className="font-semibold text-gray-900 truncate">{hymn.titulo}</span>
        </div>
        {hymn.regente && (
          <p className="text-xs text-gray-500 mt-0.5">Regente: {hymn.regente}</p>
        )}
      </div>

      <button
        onClick={() => onRemove(hymn.id)}
        className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function NewHymnModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ numero: '', titulo: '', tom: '' })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.numero.trim()) newErrors.numero = 'Número é obrigatório'
    if (!form.titulo.trim()) newErrors.titulo = 'Título é obrigatório'
    
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }
    
    onSave(form)
    setForm({ numero: '', titulo: '', tom: '' })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Hino" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Número</label>
          <input
            type="text"
            value={form.numero}
            onChange={(e) => setForm(f => ({ ...f, numero: e.target.value }))}
            placeholder="Ex: 001"
            className={`input-apple ${errors.numero ? 'border-red-300' : ''}`}
          />
          {errors.numero && <span className="text-xs text-red-500 mt-1">{errors.numero}</span>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Título</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
            placeholder="Nome do hino"
            className={`input-apple ${errors.titulo ? 'border-red-300' : ''}`}
          />
          {errors.titulo && <span className="text-xs text-red-500 mt-1">{errors.titulo}</span>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tom</label>
          <input
            type="text"
            value={form.tom}
            onChange={(e) => setForm(f => ({ ...f, tom: e.target.value }))}
            placeholder="Ex: Dó Maior"
            className="input-apple"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-apple-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" className="btn-apple-primary flex-1">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function ProgrammingPage() {
  const [activeTab, setActiveTab] = useState('programar')
  const [confirmed, setConfirmed] = useState(false)

  const tabs = [
    { id: 'programar', label: 'Nova Programação', icon: Music },
    { id: 'historico', label: 'Histórico', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen pb-12">
      <Topbar title="Choir Deck" />

      <div className="px-8 max-w-7xl mx-auto mt-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Nova Programação</h1>
            <p className="text-gray-500 mt-1">Monte a ordem do culto agora.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'programar' && (
            <ProgramacaoForm setConfirmed={setConfirmed} confirmed={confirmed} />
          )}
          {activeTab === 'historico' && (
            <div className="apple-card p-8">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <BookOpen size={32} className="text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Histórico vazio</h3>
                <p className="text-sm text-gray-500">O histórico de programações aparecerá aqui.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgramacaoForm({ setConfirmed, confirmed }) {
  // Mock Data
  const mockHymns = [
    { id: 1, numero: '001', titulo: 'Grande Deus', ultimo_uso: '12 Mar 2026', regente: 'Márcio' },
    { id: 2, numero: '002', titulo: 'Santo, Santo, Santo', ultimo_uso: '05 Mar 2026', regente: 'Pedro' },
    { id: 3, numero: '003', titulo: 'Amazing Grace', ultimo_uso: null, regente: null },
    { id: 4, numero: '004', titulo: 'Creio em Ti', ultimo_uso: '28 Fev 2026', regente: 'Ana' },
  ]

  const mockProgram = [
    { id: 1, numero: '001', titulo: 'Grande Deus', regente: 'Márcio' },
    { id: 2, numero: '003', titulo: 'Amazing Grace', regente: null },
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [serviceDate, setServiceDate] = useState('2026-04-26')
  const [serviceType, setServiceType] = useState('Culto Dominical Matutino')
  const [todayProgram, setTodayProgram] = useState(mockProgram.map(h => h.id))
  const [showNewHymnModal, setShowNewHymnModal] = useState(false)

  const filteredHymns = useMemo(() => {
    if (!searchTerm.trim()) return mockHymns
    const term = searchTerm.toLowerCase()
    return mockHymns.filter(h => 
      h.titulo.toLowerCase().includes(term) || 
      h.numero.toLowerCase().includes(term)
    )
  }, [searchTerm])

  const programHymns = useMemo(() => {
    return todayProgram.map(id => mockProgram.find(h => h.id === id)).filter(Boolean)
  }, [todayProgram])

  const handleAddHymn = (hymn) => {
    if (!todayProgram.includes(hymn.id)) {
      setTodayProgram([...todayProgram, hymn.id])
    }
  }

  const handleRemove = (id) => {
    setTodayProgram(todayProgram.filter(pid => pid !== id))
  }

  const handleMove = (idx, dir) => {
    const arr = [...todayProgram]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
    setTodayProgram(arr)
  }

  const handleSaveNewHymn = (form) => {
    const newHymn = {
      id: Date.now(),
      numero: form.numero,
      titulo: form.titulo,
      ultimo_uso: null,
      regente: null,
    }
    mockHymns.push(newHymn)
    handleAddHymn(newHymn)
  }

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 3000)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Card - Compact */}
        <div className="apple-card p-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="input-apple w-auto"
                style={{ colorScheme: 'light' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contexto</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="select-apple w-auto min-w-[220px]"
              >
                <option value="Culto Dominical Matutino">Culto Dominical Matutino</option>
                <option value="Culto Dominical Vespertino">Culto Dominical Vespertino</option>
                <option value="Ensaio Geral">Ensaio Geral</option>
                <option value="Ensaio de Seção">Ensaio de Seção</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column - Acervo (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="apple-card p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Music size={18} className="text-[#007AFF]" />
                Acervo de Hinos
              </h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por número ou título..."
                  className="input-apple pl-9"
                />
              </div>

              {/* New hymn button */}
              <button 
                onClick={() => setShowNewHymnModal(true)}
                className="w-full mb-4 text-sm font-medium text-[#007AFF] hover:text-[#0062CC] flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed border-[#007AFF]/30 hover:border-[#007AFF] hover:bg-blue-50 transition-colors"
              >
                <Plus size={16} />
                Novo Hino
              </button>

              {/* Results List */}
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {filteredHymns.map(hymn => (
                  <HymnResultItem 
                    key={hymn.id} 
                    hymn={hymn} 
                    onAdd={handleAddHymn}
                    isAdded={todayProgram.includes(hymn.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order (7 cols) */}
          <div className="md:col-span-7">
            <div className="apple-card p-4 bg-gray-50/30 min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Music size={18} className="text-purple-500" />
                  Ordem do Culto
                </h3>
                <span className="badge-apple bg-purple-100 text-purple-700">
                  {todayProgram.length} {todayProgram.length === 1 ? 'Hino' : 'Hinos'}
                </span>
              </div>

              {todayProgram.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Music size={32} className="text-gray-300" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Nenhum hino adicionado</p>
                  <p className="text-sm text-gray-500">Busque hinos ao lado para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {programHymns.map((hymn, idx) => hymn && (
                    <ProgrammedHymnItem
                      key={hymn.id}
                      hymn={hymn}
                      index={idx}
                      total={todayProgram.length}
                      onRemove={handleRemove}
                      onMove={handleMove}
                      isFirst={idx === 0}
                      isLast={idx === todayProgram.length - 1}
                    />
                  ))}
                </div>
              )}

              {/* Save Button */}
              {todayProgram.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={handleConfirm}
                    disabled={confirmed}
                    className="btn-apple-primary px-8"
                  >
                    {confirmed ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> Salvar Programação</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Hymn Modal */}
      <NewHymnModal
        isOpen={showNewHymnModal}
        onClose={() => setShowNewHymnModal(false)}
        onSave={handleSaveNewHymn}
      />
    </>
  )
}