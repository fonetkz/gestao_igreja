import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const DatePicker = ({ value, onChange, label, error }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
  const [inputValue, setInputValue] = useState(value || '')
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00')
      if (!isNaN(d.getTime())) {
        setInputValue(formatToDisplay(value))
      }
    } else {
      setInputValue('')
    }
  }, [value])

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const formatToDisplay = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return dateStr
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  const parseDisplayDate = (str) => {
    const cleaned = str.replace(/\D/g, '')
    if (cleaned.length === 8) {
      const day = cleaned.slice(0, 2)
      const month = cleaned.slice(2, 4)
      const year = cleaned.slice(4, 8)
      return `${year}-${month}-${day}`
    }
    return null
  }

  const handleInputChange = (e) => {
    let val = e.target.value
    
    const numericOnly = val.replace(/\D/g, '')
    let formatted = ''
    
    if (numericOnly.length > 0) {
      formatted = numericOnly.slice(0, 2)
      if (numericOnly.length >= 3) {
        formatted += '/' + numericOnly.slice(2, 4)
      }
      if (numericOnly.length >= 5) {
        formatted += '/' + numericOnly.slice(4, 8)
      }
    }
    
    setInputValue(formatted)
    
    const isoDate = parseDisplayDate(formatted)
    if (isoDate) {
      onChange({ target: { value: isoDate } })
      setViewDate(new Date(isoDate + 'T00:00:00'))
    } else if (formatted === '') {
      onChange({ target: { value: '' } })
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleSelectDay = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange({ target: { value: formatted } })
    setInputValue(formatToDisplay(formatted))
    setIsOpen(false)
  }

  const navigateMonth = (direction) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + direction, 1))
  }

  const goToYear = (direction) => {
    setViewDate(new Date(viewDate.getFullYear() + direction, viewDate.getMonth(), 1))
  }

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  const selectedDate = value ? new Date(value + 'T00:00:00') : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handleClear = (e) => {
    e.stopPropagation()
    setInputValue('')
    onChange({ target: { value: '' } })
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col w-full" ref={wrapperRef}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="dd/mm/yyyy"
            className={`
              flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
              bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400
              focus:outline-none w-full
              ${error
                ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10'
              }
            `}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
              absolute right-2 p-1.5 rounded-lg
              text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200
              ${isOpen ? 'text-blue-600 dark:text-blue-400' : ''}
            `}
          >
            {isOpen ? <X size={16} /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          </button>
        </div>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => goToYear(-10)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
                </button>
                <span className="font-bold text-sm text-slate-900 dark:text-white min-w-[100px] text-center">
                  {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => goToYear(10)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            <div className="p-2">
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[9px] font-semibold text-slate-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDayOfMonth(viewDate) }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth(viewDate) }).map((_, i) => {
                  const day = i + 1
                  const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
                  const isSelected = selectedDate && 
                    cellDate.getDate() === selectedDate.getDate() &&
                    cellDate.getMonth() === selectedDate.getMonth() &&
                    cellDate.getFullYear() === selectedDate.getFullYear()
                  const isToday = cellDate.getTime() === today.getTime()

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`
                        w-7 h-7 rounded-md text-xs font-medium transition-all duration-150
                        ${isSelected 
                          ? 'bg-blue-600 text-white' 
                          : isToday
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }
                      `}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                  onChange({ target: { value: todayStr } })
                  setInputValue(formatToDisplay(todayStr))
                  setIsOpen(false)
                }}
                className="flex-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <span className="text-xs font-bold text-red-500 mt-1">{error}</span>}
    </div>
  )
}

export default DatePicker