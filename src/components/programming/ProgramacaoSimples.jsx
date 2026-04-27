import React, { useState, useMemo } from 'react'
import { Plus, X, Search, Music, Users, Sparkles, ChevronUp, ChevronDown, Trash2, Save, Check, BookOpen } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Input } from '../ui/Input'
import Select from '../ui/Select'
import DatePicker from '../ui/DatePicker'
import useHymnsStore from '../../store/hymnsStore'
import useSettingsStore from '../../store/settingsStore'

const SECTION_CONFIG = {
  hinario: { label: 'Hinário', color: 'primary', icon: BookOpen },
  coral: { label: 'Coral', color: 'success', icon: Users },
  orquestra: { label: 'Orquestra', color: 'warning', icon: Music },
  especial: { label: 'Especial', color: 'info', icon: Sparkles },
}

function HymnItem({ hymn, index, onRemove, onMove, isFirst, isLast, sectionColor, sectionLabel }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all group">
      <div className="flex flex-col items-center gap-0.5">
        {!isFirst && (
          <button onClick={() => onMove(index, -1)} className="p-1.5 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
            <ChevronUp size={14} />
          </button>
        )}
        <span className="text-xs font-black text-slate-400 dark:text-slate-500">{index + 1}</span>
        {!isLast && (
          <button onClick={() => onMove(index, 1)} className="p-1.5 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
            <ChevronDown size={14} />
          </button>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={sectionColor} className="text-[9px] px-2 py-0.5">
            {sectionLabel}
          </Badge>
          <span className="font-bold text-sm text-slate-900 dark:text-white">#{hymn.numero}</span>
          <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{hymn.titulo}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
          {hymn.regente && <span className="flex items-center gap-1"><Users size={10} /> {hymn.regente}</span>}
          {hymn.solista && <span className="flex items-center gap-1 text-blue-500"><Sparkles size={10} /> Solo: {hymn.solista}</span>}
        </div>
      </div>

      <button 
        onClick={() => onRemove(hymn.id)} 
        className="p-2 rounded-xl text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function NovoHinoForm({ onSubmit, onCancel, hymnSections, conductors }) {
  const sectionTypes = hymnSections.map(s => ({ value: s.value, label: s.label }))
  const conductorOptions = conductors.map(c => ({ value: c.value, label: c.label }))

  const [form, setForm] = useState({ 
    numero: '', 
    titulo: '', 
    regente: '', 
    secao_hino: 'hinario', 
    hasSolo: false, 
    artista: '' 
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.numero?.trim()) errs.numero = 'Obrigatório'
    if (!form.titulo?.trim()) errs.titulo = 'Obrigatório'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit({ ...form, tonalidade: form.regente, artista: form.hasSolo ? form.artista : '' })
    setForm({ numero: '', titulo: '', regente: '', secao_hino: 'hinario', hasSolo: false, artista: '' })
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
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
        label="Título do Hino" 
        placeholder="Nome completo do hino" 
        value={form.titulo} 
        onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} 
        error={errors.titulo} 
      />
      <Select 
        label="Regente" 
        options={conductorOptions} 
        value={form.regente} 
        onChange={v => setForm(f => ({ ...f, regente: v }))} 
        placeholder="Selecione o regente..."
      />
      
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
        <input 
          type="checkbox" 
          checked={form.hasSolo} 
          onChange={e => setForm(f => ({ ...f, hasSolo: e.target.checked }))}
          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Este hino terá solo?</span>
      </div>
      
      {form.hasSolo && (
        <Input 
          label="Nome do Solista" 
          placeholder="Quem irá cantar o solo?" 
          value={form.artista} 
          onChange={e => setForm(f => ({ ...f, artista: e.target.value }))} 
        />
      )}
      
      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" icon={Plus} className="flex-1">Salvar & Adicionar</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

export default function ProgramacaoSimples({ onConfirmed }) {
  const hymns = useHymnsStore(s => s.hymns)
  const addHymn = useHymnsStore(s => s.addHymn)
  const addToTodayProgram = useHymnsStore(s => s.addToTodayProgram)
  const removeFromTodayProgram = useHymnsStore(s => s.removeFromTodayProgram)
  const reorderTodayProgram = useHymnsStore(s => s.reorderTodayProgram)
  const confirmTodayProgram = useHymnsStore(s => s.confirmTodayProgram)
  const todayProgram = useHymnsStore(s => s.todayProgram)
  const getHymnById = useHymnsStore(s => s.getHymnById)
  
  const hymnSections = useSettingsStore(s => s.hymnSections)
  const conductors = useSettingsStore(s => s.conductors)
  const meetingTypes = useSettingsStore(s => s.meetingTypes)

  const [searchTerm, setSearchTerm] = useState('')
  const [showNovoForm, setShowNovoForm] = useState(false)
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0])
  const [serviceType, setServiceType] = useState(meetingTypes[0]?.label || '')
  const [confirmed, setConfirmed] = useState(false)

  const filteredHymns = useMemo(() => {
    if (!searchTerm.trim()) return []
    const term = searchTerm.toLowerCase()
    return hymns.filter(h => 
      (h.titulo || '').toLowerCase().includes(term) || 
      (h.numero || '').toLowerCase().includes(term)
    ).slice(0, 6)
  }, [searchTerm, hymns])

  const programHymns = useMemo(() => {
    return todayProgram.map(id => getHymnById(id)).filter(Boolean)
  }, [todayProgram, getHymnById])

  const groupedHymns = useMemo(() => {
    const groups = {}
    hymnSections.forEach(s => { groups[s.value] = [] })
    programHymns.forEach(h => {
      const section = h.secao_hino || 'hinario'
      if (!groups[section]) groups[section] = []
      groups[section].push(h)
    })
    return groups
  }, [programHymns, hymnSections])

  const handleAddHymn = async (hymn) => {
    if (!hymn.id) {
      const newHymn = await addHymn(hymn)
      addToTodayProgram(newHymn.id)
    } else {
      addToTodayProgram(hymn.id)
    }
    setSearchTerm('')
  }

  const handleMove = (idx, dir) => {
    const arr = [...todayProgram]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= arr.length) return
    ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
    reorderTodayProgram(arr)
  }

  const handleConfirm = async () => {
    if (todayProgram.length === 0) return
    await confirmTodayProgram(serviceDate, serviceType, 'Sistema')
    setConfirmed(true)
    if (onConfirmed) onConfirmed(serviceDate, serviceType)
    setTimeout(() => setConfirmed(false), 3000)
  }

  const meetingOptions = meetingTypes.map(m => ({ value: m.label, label: m.label }))

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Nova Programação</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Selecione os hinos para este culto</p>
        </div>
        <div className="flex items-center gap-3">
          <DatePicker 
            value={serviceDate} 
            onChange={e => setServiceDate(e.target.value)} 
          />
          <div className="w-48">
            <Select 
              options={meetingOptions} 
              value={serviceType} 
              onChange={setServiceType} 
              placeholder="Tipo..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Add Hymns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Music size={16} className="text-white" />
              </div>
              Adicionar Hino
            </h3>
          </div>

          {showNovoForm ? (
            <Card padding="medium" className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/10 border-slate-200 dark:border-slate-700">
              <NovoHinoForm 
                onSubmit={async (hymn) => {
                  const newHymn = await addHymn(hymn)
                  addToTodayProgram(newHymn.id)
                  setShowNovoForm(false)
                }}
                onCancel={() => setShowNovoForm(false)}
                hymnSections={hymnSections}
                conductors={conductors}
              />
            </Card>
          ) : (
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por número ou título..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              
              {filteredHymns.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
                  {filteredHymns.map(h => (
                    <button
                      key={h.id}
                      onClick={() => handleAddHymn(h)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          #{h.numero} — {h.titulo}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {SECTION_CONFIG[h.secao_hino]?.label || 'Hinário'} • {h.regente || 'Sem regente'}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <Plus size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm.length >= 2 && filteredHymns.length === 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl p-5 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Nenhum hino encontrado</p>
                  <Button size="sm" icon={Plus} onClick={() => setShowNovoForm(true)}>
                    Cadastrar novo hino
                  </Button>
                </div>
              )}
            </div>
          )}

          {!showNovoForm && (
            <Button variant="outline" className="w-full justify-center" icon={Plus} onClick={() => setShowNovoForm(true)}>
              Cadastrar Novo Hino
            </Button>
          )}

          {/* Quick Access - Hinário */}
          {hymns.length > 0 && !showNovoForm && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <BookOpen size={14} /> Hinário ({hymns.length} hinos)
              </p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                {hymns.map(h => (
                  <button
                    key={h.id}
                    onClick={() => handleAddHymn(h)}
                    disabled={todayProgram.includes(h.id)}
                    className={`
                      px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200
                      ${todayProgram.includes(h.id)
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
                      }
                    `}
                  >
                    #{h.numero}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Program List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Music size={16} className="text-white" />
              </div>
              Ordem do Culto
            </h3>
            <Badge variant="primary" className="px-3 py-1">
              {todayProgram.length} {todayProgram.length === 1 ? 'hino' : 'hinos'}
            </Badge>
          </div>

          {todayProgram.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-800/30 dark:to-purple-900/10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <Music size={28} className="text-slate-300 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nenhum hino adicionado</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Busque ou cadastre um hino para começar</p>
            </div>
          ) : (
            <div className="space-y-5 max-h-[450px] overflow-y-auto pr-2">
              {hymnSections.map(section => {
                const sectionHymns = groupedHymns[section.value] || []
                if (sectionHymns.length === 0) return null
                
                return (
                  <div key={section.value}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={SECTION_CONFIG[section.value]?.color || 'primary'} className="px-3 py-1">
                        {section.label}
                      </Badge>
                      <span className="text-xs text-slate-400">{sectionHymns.length} {sectionHymns.length === 1 ? 'hino' : 'hinos'}</span>
                    </div>
                    <div className="space-y-2">
                      {sectionHymns.map((h) => {
                        const globalIdx = todayProgram.indexOf(h.id)
                        return (
                          <HymnItem
                            key={h.id}
                            hymn={h}
                            index={globalIdx}
                            onRemove={removeFromTodayProgram}
                            onMove={handleMove}
                            isFirst={globalIdx === 0}
                            isLast={globalIdx === todayProgram.length - 1}
                            sectionColor={SECTION_CONFIG[section.value]?.color || 'primary'}
                            sectionLabel={section.label}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {todayProgram.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button 
                onClick={handleConfirm} 
                disabled={confirmed}
                className="w-full h-14 text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                icon={confirmed ? Check : Save}
              >
                {confirmed ? 'Programação Salva!' : 'Salvar Programação'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}