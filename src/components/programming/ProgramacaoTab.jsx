import React, { useState, useMemo } from 'react'
import { Save, GripVertical, AlertTriangle, Plus, X, Search, Pencil, Check, Clock, Calendar, Music, Users, Sparkles, ChevronUp, ChevronDown } from 'lucide-react'
import Modal from '../ui/Modal'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Input, Textarea } from '../ui/Input'
import Select from '../ui/Select'
import Checkbox from '../ui/Checkbox'
import useHymnsStore from '../../store/hymnsStore'
import useMembersStore from '../../store/membersStore'
import useSettingsStore from '../../store/settingsStore'
import DatePicker from '../ui/DatePicker'

const SECTION_CONFIG = {
  hinario: { label: 'Hinário', color: 'primary', icon: Music },
  coral: { label: 'Coral', color: 'success', icon: Users },
  orquestra: { label: 'Orquestra', color: 'warning', icon: Music },
  especial: { label: 'Especial', color: 'info', icon: Sparkles },
}

function HymnCard({ hymn, index, onEdit, onRemove, onMove, isFirst, isLast, recentInfo }) {
  const SectionIcon = SECTION_CONFIG[hymn.secao_hino]?.icon || Music
  const sectionLabel = SECTION_CONFIG[hymn.secao_hino]?.label || 'Hinário'
  const sectionColor = SECTION_CONFIG[hymn.secao_hino]?.color || 'primary'

  return (
    <Card 
      padding="none" 
      className={`flex items-stretch overflow-hidden group transition-all duration-200 hover:shadow-lg ${
        recentInfo?.isRecent 
          ? 'border-amber-200 dark:border-amber-600/50 shadow-amber-50 dark:shadow-amber-900/20' 
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="w-14 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-r border-slate-200 dark:border-slate-700">
        <GripVertical size={16} className="text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing" />
        <span className="text-xs font-black text-slate-400 dark:text-slate-500 mt-1">{index + 1}</span>
      </div>
      
      <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <Badge variant={sectionColor} className="flex items-center gap-1.5">
              <SectionIcon size={12} />
              {sectionLabel}
            </Badge>
            <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">
              #{hymn.numero} — {hymn.titulo}
            </h4>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users size={14} /> Regente: {hymn.regente || h.tonalidade}
            </span>
            {hymn.solista && (
              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles size={14} /> Solo: {hymn.solista}
              </span>
            )}
          </div>

          {recentInfo?.isRecent && (
            <div className="flex items-center gap-1.5 mt-3 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg w-max">
              <AlertTriangle size={12} strokeWidth={2.5} /> 
              Apresentado há {recentInfo.days} dias
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isFirst && (
            <button 
              onClick={() => onMove(index, -1)} 
              className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Mover para cima"
            >
              <ChevronUp size={18} />
            </button>
          )}
          {!isLast && (
            <button 
              onClick={() => onMove(index, 1)} 
              className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Mover para baixo"
            >
              <ChevronDown size={18} />
            </button>
          )}
          <button 
            onClick={() => onEdit(hymn)} 
            className="p-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            title="Editar"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => onRemove(hymn.id)} 
            className="p-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Remover"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </Card>
  )
}

function HymnSearch({ hymns, onSelect, excludeIds }) {
  const [search, setSearch] = useState('')

  const filteredHymns = useMemo(() => {
    if (search.length < 2) return []
    return hymns
      .filter(h => 
        !excludeIds.includes(h.id) && (
          (h.titulo || '').toLowerCase().includes(search.toLowerCase()) || 
          (h.numero || '').includes(search)
        )
      )
      .slice(0, 6)
  }, [search, hymns, excludeIds])

  return (
    <div className="relative">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          placeholder="Busque por título ou número..." 
          className="w-full bg-slate-100 dark:bg-slate-800 border-0 dark:border border-slate-700 dark:text-white rounded-xl px-4 py-3.5 pl-11 text-sm font-medium
                     focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" 
        />
      </div>
      
      {filteredHymns.length > 0 && (
        <div className="absolute z-30 top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl mt-2 overflow-hidden animate-scale-in">
          {filteredHymns.map(h => (
            <button 
              key={h.id} 
              onClick={() => { onSelect(h.id); setSearch('') }}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-slate-100 dark:border-slate-700 last:border-0 group"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  #{h.numero} — {h.titulo}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {SECTION_CONFIG[h.secao_hino]?.label || 'Hinário'} • Regente: {h.regente || h.tonalidade}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={16} strokeWidth={2.5} />
              </div>
            </button>
          ))}
        </div>
      )}

      {search.length >= 2 && filteredHymns.length === 0 && (
        <div className="absolute z-30 top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl mt-2 p-5 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nenhum hino encontrado</p>
        </div>
      )}

      {search.length < 2 && (
        <div className="absolute z-30 top-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl mt-2 p-5 text-center opacity-60">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Digite pelo menos 2 caracteres para buscar...</p>
        </div>
      )}
    </div>
  )
}

function ServiceHeader({ date, type, meetingOptions, onDateChange, onTypeChange, onConfirm, count, confirmed }) {
  const selectedTypeInfo = useMemo(() => {
    const mt = meetingOptions.find(m => m.label === type)
    return mt?.category || 'normal'
  }, [type, meetingOptions])

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
      <Card className="md:col-span-8 flex flex-col sm:flex-row items-center gap-4" padding="medium">
        <div className="flex-1 w-full">
          <DatePicker 
            label="Data do Culto" 
            value={date} 
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <div className="flex-1 w-full">
          <Select 
            label="Tipo de Reunião" 
            options={meetingOptions} 
            value={type} 
            onChange={onTypeChange} 
            placeholder="Selecione..." 
          />
        </div>
      </Card>

      <Card className="md:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white border-none shadow-xl shadow-slate-900/10 flex flex-col justify-between" padding="medium">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-blue-400">Total Selecionado</p>
          {type && (
            <Badge variant={selectedTypeInfo === 'oracao' ? 'primary' : selectedTypeInfo === 'especial' ? 'warning' : 'neutral'} className="bg-white/10 text-white border-white/20">
              {type}
            </Badge>
          )}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold">{count}</span>
            <span className="text-sm font-semibold text-slate-400">hinos</span>
          </div>
          <Button 
            onClick={onConfirm} 
            disabled={count === 0} 
            variant="secondary" 
            size="md" 
            className="shadow-none"
          >
            {confirmed ? '✓ Salvo!' : 'Finalizar'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function NewHymnForm({ onSubmit, onCancel, members, sections, conductors }) {
  const memberOptions = members.map(m => ({ value: m.nome, label: m.nome }))
  const sectionTypes = sections.map(s => ({ value: s.value, label: s.label }))
  const conductorOptions = conductors.map(c => ({ value: c.value, label: c.label }))

  const emptyForm = { numero: '', titulo: '', regente: '', secao_hino: 'hinario', hasSolo: false, artista: '', observacoes: '' }
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.numero.trim()) errs.numero = 'Obrigatório'
    if (!form.titulo.trim()) errs.titulo = 'Obrigatório'
    if (!form.regente) errs.regente = 'Obrigatório'
    if (form.hasSolo && !form.artista) errs.artista = 'Obrigatório'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit({ ...form, tonalidade: form.regente, artista: form.solista })
    setForm(emptyForm)
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Número" 
          placeholder="001" 
          value={form.numero} 
          onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} 
          error={errors.numero} 
        />
        <Select 
          label="Seção" 
          options={sectionTypes} 
          value={form.secao_hino} 
          onChange={v => setForm(f => ({ ...f, secao_hino: v }))} 
        />
      </div>
      <Input 
        label="Título Oficial" 
        placeholder="Nome da composição" 
        value={form.titulo} 
        onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} 
        error={errors.titulo} 
      />
      <Select 
        label="Regente Responsável" 
        options={conductorOptions} 
        value={form.regente} 
        onChange={v => setForm(f => ({ ...f, regente: v }))} 
        error={errors.regente} 
      />
      
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
        <Checkbox 
          checked={form.hasSolo} 
          onCheckedChange={checked => setForm(f => ({ ...f, hasSolo: checked }))} 
        />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Hino contém solo especial?</span>
      </div>
      
{form.hasSolo && (
          <div className="animate-slide-up">
            <Select 
              label="Solista" 
              options={memberOptions} 
              value={form.artista} 
              placeholder="Escolha um membro..." 
              onChange={v => setForm(f => ({ ...f, artista: v }))} 
              error={errors.artista} 
            />
          </div>
        )}
      
      <div className="flex gap-3 pt-2">
        <Button type="submit" icon={Plus} className="flex-1">Adicionar à Programação</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function EditHymnModal({ hymn, open, onClose, onSave, members, sections, conductors }) {
  const memberOptions = members.map(m => ({ value: m.nome, label: m.nome }))
  const sectionTypes = sections.map(s => ({ value: s.value, label: s.label }))
  const conductorOptions = conductors.map(c => ({ value: c.value, label: c.label }))

  const [form, setForm] = useState({
    numero: '',
    titulo: '',
    regente: '',
    secao_hino: 'hinario',
    hasSolo: false,
    artista: '',
    observacoes: ''
  })

  React.useEffect(() => {
    if (hymn) {
      setForm({
        numero: hymn.numero || '',
        titulo: hymn.titulo || '',
        regente: hymn.regente || hymn.tonalidade || '',
        secao_hino: hymn.secao_hino || 'hinario',
        hasSolo: !!hymn.solista,
        artista: hymn.solista || '',
        observacoes: hymn.observacoes || ''
      })
    }
  }, [hymn])

  const handleSave = () => {
    if (!form.titulo.trim()) return
    onSave(hymn.id, { ...form, tonalidade: form.regente, artista: form.artista })
    onClose()
  }

  return (
    <Modal open={open} onOpenChange={onClose} title="Editar Hino">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Nº" 
            value={form.numero || ''} 
            onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} 
          />
          <Select 
            label="Seção" 
            options={sectionTypes} 
            value={form.secao_hino || 'hinario'} 
            onChange={v => setForm(f => ({ ...f, secao_hino: v }))} 
          />
        </div>
        <Input 
          label="Título Oficial" 
          value={form.titulo || ''} 
          onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} 
        />
        <Select 
          label="Regente" 
          options={conductorOptions} 
          value={form.regente || ''} 
          onChange={v => setForm(f => ({ ...f, regente: v }))} 
        />
        
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <Checkbox 
            checked={form.hasSolo || false} 
            onCheckedChange={c => setForm(f => ({ ...f, hasSolo: c }))} 
          />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Contém Solo?</span>
        </div>
        
        {form.hasSolo && (
          <Select 
            label="Solista" 
            options={memberOptions} 
            value={form.artista || ''} 
            onChange={v => setForm(f => ({ ...f, artista: v }))} 
          />
        )}
        
        <Textarea 
          label="Observações" 
          value={form.observacoes || ''} 
          onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} 
        />
        
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button icon={Check} onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function ProgramacaoTab({ onConfirmed }) {
  const addHymnToProgram = useHymnsStore(s => s.addHymnToProgram)
  const addToTodayProgram = useHymnsStore(s => s.addToTodayProgram)
  const removeFromTodayProgram = useHymnsStore(s => s.removeFromTodayProgram)
  const reorderTodayProgram = useHymnsStore(s => s.reorderTodayProgram)
  const confirmTodayProgram = useHymnsStore(s => s.confirmTodayProgram)
  const updateHymn = useHymnsStore(s => s.updateHymn)
  const todayProgram = useHymnsStore(s => s.todayProgram)
  const hymns = useHymnsStore(s => s.hymns)
  const getHymnById = useHymnsStore(s => s.getHymnById)
  const isRecentlyUsed = useHymnsStore(s => s.isRecentlyUsed)
  const daysSinceLastUsed = useHymnsStore(s => s.daysSinceLastUsed)
  
  const members = useMembersStore(s => s.members)
  const meetingTypes = useSettingsStore(s => s.meetingTypes)
  const hymnSections = useSettingsStore(s => s.hymnSections)
  const conductors = useSettingsStore(s => s.conductors)

  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0])
  const [serviceType, setServiceType] = useState(meetingTypes[0]?.label || '')
  const [showForm, setShowForm] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [editModalHymn, setEditModalHymn] = useState(null)

  const meetingOptions = meetingTypes.map(m => ({ value: m.label, label: m.label }))

  const handleConfirm = () => {
    if (todayProgram.length === 0) return
    confirmTodayProgram(serviceDate, serviceType, 'Sistema')
    setConfirmed(true)
    if (onConfirmed) onConfirmed(serviceDate, serviceType)
    setTimeout(() => setConfirmed(false), 3000)
  }

  const handleMoveItem = (idx, dir) => {
    const arr = [...todayProgram]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= arr.length) return
    ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
    reorderTodayProgram(arr)
  }

  const getRecentInfo = (hymnId) => {
    const isRecent = isRecentlyUsed(hymnId)
    const days = daysSinceLastUsed(hymnId)
    return { isRecent, days }
  }

  return (
    <div className="animate-fade-in">
      <ServiceHeader 
        date={serviceDate}
        type={serviceType}
        meetingOptions={meetingOptions}
        onDateChange={setServiceDate}
        onTypeChange={setServiceType}
        onConfirm={handleConfirm}
        count={todayProgram.length}
        confirmed={confirmed}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="heading-3 text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Music size={20} className="text-blue-600" />
            Adicionar Hino
          </h3>
          <Card padding="large" className="min-h-[280px]">
            <HymnSearch 
              hymns={hymns}
              onSelect={addToTodayProgram}
              excludeIds={todayProgram}
            />
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-3 text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={20} className="text-purple-600" />
              Cadastrar Novo
            </h3>
            {!showForm && (
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)} icon={Plus}>
                Novo Hino
              </Button>
            )}
          </div>
          <Card padding="large">
            {showForm ? (
              <NewHymnForm 
                onSubmit={(hymn) => {
                  addHymnToProgram(hymn)
                  setShowForm(false)
                }}
                onCancel={() => { setShowForm(false) }}
                members={members}
                sections={hymnSections}
                conductors={conductors}
              />
            ) : (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
                  <Plus size={20} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Nenhum formulário aberto</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Clique em "Novo Hino" para cadastrar um hino que ainda não existe no acervo.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h3 className="heading-2 text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar size={22} className="text-blue-600" />
          Ordem do Culto
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
          Use as setas para reordenar
        </p>
      </div>

      {todayProgram.length === 0 ? (
        <Card className="text-center py-14 border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-4">
            <Music size={24} />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">Programação Vazia</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Busque hinos na aba acima para começar a montar a ordem do culto.
          </p>
        </Card>
      ) : (
        <div className="space-y-3 mb-8">
          {todayProgram.map((hId, idx) => {
            const h = getHymnById(hId)
            if (!h) return null
            
            return (
              <HymnCard
                key={hId}
                hymn={h}
                index={idx}
                onEdit={setEditModalHymn}
                onRemove={removeFromTodayProgram}
                onMove={handleMoveItem}
                isFirst={idx === 0}
                isLast={idx === todayProgram.length - 1}
                recentInfo={getRecentInfo(hId)}
              />
            )
          })}
        </div>
      )}

      <EditHymnModal 
        hymn={editModalHymn}
        open={!!editModalHymn}
        onClose={() => setEditModalHymn(null)}
        onSave={updateHymn}
        members={members}
        sections={hymnSections}
        conductors={conductors}
      />
    </div>
  )
}