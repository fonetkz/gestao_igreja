import React, { useState, useMemo } from 'react'
import { Calendar, Search, Users, ChevronDown, ChevronUp, Music, Filter, X, Clock, FileText } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { Input } from '../ui/Input'
import Select from '../ui/Select'
import useHymnsStore from '../../store/hymnsStore'
import useSettingsStore from '../../store/settingsStore'

function HistoryCard({ program, hymns, onToggle, isExpanded }) {
  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr + 'T12:00:00')
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
    } catch { return isoStr }
  }

  const getDayName = (isoStr) => {
    try {
      const d = new Date(isoStr + 'T12:00:00')
      return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d).toUpperCase()
    } catch { return '' }
  }

  const monthName = (isoStr) => {
    try {
      const d = new Date(isoStr + 'T12:00:00')
      return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d).toUpperCase()
    } catch { return '' }
  }

  return (
    <Card 
      padding="none" 
      className={`overflow-hidden transition-all duration-300 hover:shadow-md ${
        isExpanded ? 'ring-2 ring-blue-500/20' : ''
      }`}
    >
      <div 
        onClick={() => onToggle(program.id)} 
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-[10px] font-bold opacity-80">{getDayName(program.data)}</span>
            <span className="text-xl font-black leading-none">{program.data?.substring(8, 10)}</span>
            <span className="text-[9px] font-semibold opacity-80">{monthName(program.data)}</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{formatDate(program.data)}</h4>
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              <Badge variant="neutral">{program.tipo_culto || 'Reunião'}</Badge>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Music size={14} /> {hymns.length} hinos
              </span>
              {program.responsavel && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users size={14} /> {program.responsavel}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`p-2.5 rounded-xl text-slate-400 dark:text-slate-500 transition-all duration-200 ${
          isExpanded ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-5 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <FileText size={14} /> Repertório Executado
            </h5>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {hymns.length} hino{hymns.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {hymns.length === 0 ? (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic py-4 text-center">
              Nenhum hino registrado nesta data.
            </p>
          ) : (
            <div className="grid gap-2.5">
              {hymns.map((h, idx) => (
                <div 
                  key={`${program.id}-${h.id}-${idx}`} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      #{h.numero} — {h.titulo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {h.secao_hino || 'Hinário'}
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {h.regente || h.tonalidade}
                    </span>
                    {h.solista && (
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-md">
                        Solo: {h.solista}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

function FilterBar({ filters, onChange }) {
  const meetingTypes = useSettingsStore(s => s.meetingTypes)
  const meetingOptions = meetingTypes.map(m => ({ value: m.label, label: m.label }))

  return (
    <Card padding="medium" className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 border-none shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <Filter size={18} className="text-blue-400" />
          <h3 className="font-bold text-white dark:text-white">Filtros</h3>
        </div>
        {filters.dateFilter || filters.hymnFilter || filters.conductorFilter || filters.typeFilter ? (
          <button 
            onClick={() => onChange({ dateFilter: '', hymnFilter: '', conductorFilter: '', typeFilter: '' })}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-auto sm:ml-0"
          >
            <X size={14} /> Limpar
          </button>
        ) : null}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-400 mb-1.5 block">
            <Calendar size={12} className="inline mr-1" /> Por Data
          </label>
          <input 
            type="date" 
            value={filters.dateFilter} 
            onChange={e => onChange({ ...filters, dateFilter: e.target.value })} 
            className="w-full bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-medium text-white dark:text-white
                       focus:bg-slate-700 dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]" 
          />
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-400 mb-1.5 block">
            <Search size={12} className="inline mr-1" /> Por Hino
          </label>
          <input 
            type="text" 
            placeholder="Número ou título..." 
            value={filters.hymnFilter} 
            onChange={e => onChange({ ...filters, hymnFilter: e.target.value })} 
            className="w-full bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-medium text-white dark:text-white placeholder:text-slate-500
                       focus:bg-slate-700 dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all" 
          />
        </div>
        
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-400 mb-1.5 block">
            <Users size={12} className="inline mr-1" /> Por Regente
          </label>
          <input 
            type="text" 
            placeholder="Nome do regente..." 
            value={filters.conductorFilter} 
            onChange={e => onChange({ ...filters, conductorFilter: e.target.value })} 
            className="w-full bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-medium text-white dark:text-white placeholder:text-slate-500
                       focus:bg-slate-700 dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all" 
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-400 mb-1.5 block">
            <FileText size={12} className="inline mr-1" /> Por Tipo
          </label>
          <Select
            options={[{ value: '', label: 'Todos os tipos' }, ...meetingOptions]}
            value={filters.typeFilter}
            onChange={(val) => onChange({ ...filters, typeFilter: val })}
          />
        </div>
      </div>
    </Card>
  )
}

function EmptyState({ hasFilters, onClearFilters }) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        <Search size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {hasFilters ? 'Nenhum resultado' : 'Nenhum histórico'}
      </h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        {hasFilters 
          ? 'Tente ajustar os filtros para encontrar o que procura.' 
          : 'O histórico de programações aparecerá aqui após você confirmar uma programação.'
        }
      </p>
      {hasFilters && (
        <button 
          onClick={onClearFilters}
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-2 mx-auto"
        >
          <X size={16} /> Limpar filtros
        </button>
      )}
    </div>
  )
}

export default function HistoricoTab() {
  const history = useHymnsStore(s => s.history) || []
  const getHymnById = useHymnsStore(s => s.getHymnById)

  const [filters, setFilters] = useState({
    dateFilter: '',
    hymnFilter: '',
    conductorFilter: '',
    typeFilter: ''
  })
  const [expandedId, setExpandedId] = useState(null)

  const hasFilters = filters.dateFilter || filters.hymnFilter || filters.conductorFilter || filters.typeFilter

  const filteredHistory = useMemo(() => {
    return history
      .filter(p => {
        if (filters.dateFilter && !p.data.includes(filters.dateFilter)) return false
        if (filters.typeFilter && p.tipo_culto !== filters.typeFilter) return false
        
        const p_hymns = (p.hinos_json || []).map(id => getHymnById(id)).filter(Boolean)
        
        if (filters.hymnFilter) {
          const lower = filters.hymnFilter.toLowerCase()
          if (!p_hymns.some(h => 
            (h.titulo || '').toLowerCase().includes(lower) || 
            (h.numero || '').includes(filters.hymnFilter)
          )) return false
        }
        
        if (filters.conductorFilter) {
          const lower = filters.conductorFilter.toLowerCase()
          if (!p_hymns.some(h => 
            (h.regente || h.tonalidade || '').toLowerCase().includes(lower)
          )) return false
        }
        
        return true
      })
      .sort((a, b) => new Date(b.data) - new Date(a.data))
  }, [history, filters, getHymnById])

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const clearFilters = () => {
    setFilters({ dateFilter: '', hymnFilter: '', conductorFilter: '', typeFilter: '' })
  }

  return (
    <div className="animate-fade-in">
      <FilterBar 
        filters={filters} 
        onChange={setFilters} 
      />

      {filteredHistory.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(prog => (
            <HistoryCard
              key={prog.id}
              program={prog}
              hymns={(prog.hinos_json || []).map(id => getHymnById(id)).filter(Boolean)}
              onToggle={toggleExpand}
              isExpanded={expandedId === prog.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}