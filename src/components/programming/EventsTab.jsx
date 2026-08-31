import { useState, useMemo, useEffect } from 'react'
import { Plus, Calendar, MapPin, Clock, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronDown, FileText } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ConfirmModal from '../ui/ConfirmModal'
import Badge from '../ui/Badge'
import DatePicker from '../ui/DatePicker'
import TimePicker from '../ui/TimePicker'
import useEventsStore from '../../store/eventsStore'
import useToastStore from '../../store/toastStore'

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const formatDate = (d) => {
  if (!d) return ''
  const [ano, mes, dia] = d.split('-')
  return `${parseInt(dia, 10)} de ${MESES[parseInt(mes, 10) - 1]} de ${ano}`
}

const getDayOfWeek = (d) => {
  if (!d) return ''
  const [ano, mes, dia] = d.split('-')
  const date = new Date(ano, mes - 1, dia)
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  return dias[date.getDay()]
}

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function EventModal({ isOpen, onClose, onSave, editingEvent }) {
  const [form, setForm] = useState({ titulo: '', data: '', hora_inicio: '', local: '', observacoes: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingEvent) {
      setForm({
        titulo: editingEvent.titulo || '',
        data: editingEvent.data || '',
        hora_inicio: editingEvent.hora_inicio || '',
        local: editingEvent.local || '',
        observacoes: editingEvent.observacoes || '',
      })
    } else {
      setForm({ titulo: '', data: '', hora_inicio: '', local: '', observacoes: '' })
    }
    setErrors({})
  }, [editingEvent, isOpen])

  const handleSave = () => {
    const newErrors = {}
    if (!form.titulo.trim()) newErrors.titulo = 'Título obrigatório'
    if (!form.data) newErrors.data = 'Data obrigatória'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    onSave({ ...form, titulo: form.titulo.trim() }, editingEvent?.id)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingEvent ? "Editar Evento" : "Novo Evento"} size="md">
      <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-4">
        <div>
          <label className="label mb-2 block">Título</label>
          <input type="text" value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Reunião Festa do Dia dos Pais" className={`input ${errors.titulo ? 'ring-2 ring-red-400' : ''}`} />
          {errors.titulo && <span className="text-xs text-red-500 mt-1 block">{errors.titulo}</span>}
        </div>
        <div>
          <DatePicker label="Data" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} error={errors.data} />
        </div>
        <div>
          <TimePicker label="Horário" value={form.hora_inicio} onChange={(e) => setForm(f => ({ ...f, hora_inicio: e.target.value }))} />
        </div>
        <div>
          <label className="label mb-2 block">Local</label>
          <input type="text" value={form.local} onChange={(e) => setForm(f => ({ ...f, local: e.target.value }))} placeholder="Endereço ou local do evento" className="input" />
        </div>
        <div>
          <label className="label mb-2 block">Observações</label>
          <textarea value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Detalhes adicionais (opcional)" rows={3} className="input resize-y" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" onClick={onClose} variant="secondary" fullWidth>Cancelar</Button>
          <Button type="submit" variant="primary" fullWidth>{editingEvent ? "Salvar Alterações" : "Salvar Evento"}</Button>
        </div>
      </form>
    </Modal>
  )
}

function MiniCalendar({ events, viewDate, setViewDate, selectedDay, onSelectDay }) {
  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const today = todayStr()
  const pad = (n) => String(n).padStart(2, '0')

  const eventDates = useMemo(() => new Set(events.map(e => e.data)), [events])

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-sm text-gray-900 dark:text-white">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth(viewDate) }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth(viewDate) }).map((_, i) => {
          const day = i + 1
          const dateStr = `${viewDate.getFullYear()}-${pad(viewDate.getMonth() + 1)}-${pad(day)}`
          const hasEvent = eventDates.has(dateStr)
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDay
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(isSelected ? null : dateStr)}
              className={`relative w-full aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center
                ${isSelected
                  ? 'bg-primary text-white'
                  : isToday
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 font-bold ring-1 ring-primary/50'
                    : hasEvent
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-gray-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-300 dark:ring-emerald-400/40 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {day}
              {hasEvent && <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500 dark:bg-emerald-400'}`} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EventCard({ evento, today, onEdit, onDelete }) {
  const isPast = evento.data < today
  return (
    <div className={`flex items-start gap-3 p-4 card ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 dark:text-white">{evento.titulo}</span>
          {evento.data === today && <Badge variant="success" size="sm">Hoje</Badge>}
          {isPast && <Badge variant="neutral" size="sm">Encerrado</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {getDayOfWeek(evento.data)}, {formatDate(evento.data)}
          </span>
          {evento.hora_inicio && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {evento.hora_inicio}
            </span>
          )}
          {evento.local && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {evento.local}
            </span>
          )}
        </div>
        {evento.observacoes && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-start gap-1">
            <FileText size={12} className="mt-0.5 shrink-0" /> {evento.observacoes}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onEdit(evento)} className="p-2 rounded-lg text-gray-400 hover:text-primary dark:hover:text-blue-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={() => onDelete(evento.id)} className="p-2 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

export default function EventsTab() {
  const events = useEventsStore((s) => s.events)
  const fetchEvents = useEventsStore((s) => s.fetchEvents)
  const addEvent = useEventsStore((s) => s.addEvent)
  const updateEvent = useEventsStore((s) => s.updateEvent)
  const removeEvent = useEventsStore((s) => s.removeEvent)
  const showToast = useToastStore((s) => s.showToast)

  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [excluindoId, setExcluindoId] = useState(null)
  const [excluindo, setExcluindo] = useState(false)
  const [showPast, setShowPast] = useState(false)

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const today = todayStr()

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.data !== b.data) return a.data < b.data ? -1 : 1
      return (a.hora_inicio || '').localeCompare(b.hora_inicio || '')
    })
  }, [events])

  const viewMonthStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`
  const monthEvents = useMemo(() => sortedEvents.filter(e => (e.data || '').slice(0, 7) === viewMonthStr), [sortedEvents, viewMonthStr])

  const visibleEvents = selectedDay ? sortedEvents.filter(e => e.data === selectedDay) : monthEvents
  const upcomingEvents = useMemo(() => monthEvents.filter(e => e.data >= today), [monthEvents, today])
  const pastEvents = useMemo(() => monthEvents.filter(e => e.data < today).reverse(), [monthEvents, today])

  const handleSave = async (form, id) => {
    try {
      if (id) {
        await updateEvent(id, form)
        showToast('Evento atualizado com sucesso!')
      } else {
        await addEvent(form)
        showToast('Evento cadastrado com sucesso!')
      }
      setModalOpen(false)
      setEditingEvent(null)
    } catch (error) {
      console.error('Erro ao salvar evento', error)
      showToast('Erro ao salvar o evento.', 'error')
    }
  }

  const openEdit = (evento) => {
    setEditingEvent(evento)
    setModalOpen(true)
  }

  const confirmExcluir = async () => {
    setExcluindo(true)
    try {
      await removeEvent(excluindoId)
      setExcluindoId(null)
    } catch (error) {
      showToast('Erro ao excluir o evento.', 'error')
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left — Calendário */}
        <div className="md:col-span-5 space-y-4">
          <MiniCalendar events={events} viewDate={viewDate} setViewDate={setViewDate} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          <button onClick={() => { setEditingEvent(null); setModalOpen(true) }} className="w-full py-2 text-sm font-medium add-affordance rounded-xl transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> Novo Evento
          </button>
        </div>

        {/* Right — Lista */}
        <div className="md:col-span-7">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-primary dark:text-blue-300" />
                {selectedDay ? `Eventos em ${formatDate(selectedDay)}` : `Eventos de ${MESES[viewDate.getMonth()]} de ${viewDate.getFullYear()}`}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="primary">{(selectedDay ? visibleEvents : upcomingEvents).length} {(selectedDay ? visibleEvents : upcomingEvents).length === 1 ? 'Evento' : 'Eventos'}</Badge>
                {selectedDay && (
                  <button onClick={() => setSelectedDay(null)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-300 transition-colors">
                    Ver todos
                  </button>
                )}
              </div>
            </div>

            {visibleEvents.length === 0 ? (
              <div className="empty-state flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <Calendar size={32} className="text-gray-300 dark:text-gray-500" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Nenhum evento {selectedDay ? 'nesse dia' : 'neste mês'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Clique em "Novo Evento" para começar</p>
              </div>
            ) : selectedDay ? (
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {visibleEvents.map((evento) => (
                  <EventCard key={evento.id} evento={evento} today={today} onEdit={openEdit} onDelete={setExcluindoId} />
                ))}
              </div>
            ) : (
              <div className="max-h-[560px] overflow-y-auto pr-1 space-y-5">
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((evento) => (
                      <EventCard key={evento.id} evento={evento} today={today} onEdit={openEdit} onDelete={setExcluindoId} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Nenhum evento futuro neste mês</p>
                )}

                {pastEvents.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-500">
                    <button
                      type="button"
                      onClick={() => setShowPast(v => !v)}
                      className="w-full flex items-center justify-between gap-2 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      <span>Eventos Encerrados · {pastEvents.length}</span>
                      <ChevronDown size={16} className={`transition-transform ${showPast ? '' : '-rotate-90'}`} />
                    </button>
                    {showPast && (
                      <div className="space-y-3 mt-2">
                        {pastEvents.map((evento) => (
                          <EventCard key={evento.id} evento={evento} today={today} onEdit={openEdit} onDelete={setExcluindoId} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null) }}
        onSave={handleSave}
        editingEvent={editingEvent}
      />

      <ConfirmModal
        isOpen={!!excluindoId}
        onClose={() => setExcluindoId(null)}
        onConfirm={confirmExcluir}
        title="Excluir evento"
        description="Tem certeza que deseja excluir este evento? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        loading={excluindo}
      />
    </>
  )
}
