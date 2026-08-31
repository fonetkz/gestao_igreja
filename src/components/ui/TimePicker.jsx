import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Clock, X } from 'lucide-react'

const pad2 = (n) => String(n).padStart(2, '0')

const TimePicker = ({ value, onChange, label, error }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 200 })
  const wrapperRef = useRef(null)
  const dropdownElRef = useRef(null)
  const hourListRef = useRef(null)
  const minuteListRef = useRef(null)

  const updatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setDropdownPos({ left: rect.left, top: rect.bottom + 6, width: Math.max(rect.width, 200) })
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && wrapperRef.current.contains(event.target)) return
      if (dropdownElRef.current && dropdownElRef.current.contains(event.target)) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    updatePosition()
    requestAnimationFrame(() => {
      hourListRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'center' })
      minuteListRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'center' })
    })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleScrollOrResize = () => updatePosition()
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize, true)
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize, true)
    }
  }, [isOpen])

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  const parts = /^(\d{2}):(\d{2})$/.exec(value || '')
  const selectedHour = parts ? parseInt(parts[1], 10) : null
  const selectedMinute = parts ? parseInt(parts[2], 10) : null

  const handleInputChange = (e) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 4)
    let formatted = numericOnly
    if (numericOnly.length >= 3) {
      formatted = numericOnly.slice(0, 2) + ':' + numericOnly.slice(2)
    }
    setInputValue(formatted)

    if (/^\d{2}:\d{2}$/.test(formatted)) {
      const h = parseInt(formatted.slice(0, 2), 10)
      const m = parseInt(formatted.slice(3, 5), 10)
      if (h <= 23 && m <= 59) onChange({ target: { value: formatted } })
    } else if (formatted === '') {
      onChange({ target: { value: '' } })
    }
  }

  const selectHour = (h) => {
    const m = selectedMinute ?? 0
    const formatted = `${pad2(h)}:${pad2(m)}`
    setInputValue(formatted)
    onChange({ target: { value: formatted } })
  }

  const selectMinute = (m) => {
    const h = selectedHour ?? 0
    const formatted = `${pad2(h)}:${pad2(m)}`
    setInputValue(formatted)
    onChange({ target: { value: formatted } })
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setInputValue('')
    onChange({ target: { value: '' } })
    setIsOpen(false)
  }

  const handleNow = () => {
    const now = new Date()
    const formatted = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
    setInputValue(formatted)
    onChange({ target: { value: formatted } })
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col w-full" ref={wrapperRef}>
      {label && <label className="label">{label}</label>}

      <div className="relative">
        <div className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder="hh:mm"
            className={`
              flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
              bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400
              focus:outline-none w-full
              ${error
                ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-gray-200 dark:border-gray-500 focus:border-primary dark:focus:border-blue-400 focus:ring-4 focus:ring-primary/10 dark:focus:ring-blue-400/10'
              }
            `}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
              absolute right-2 p-1.5 rounded-lg
              text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200
              ${isOpen ? 'text-primary dark:text-blue-300' : ''}
            `}
          >
            {isOpen ? <X size={16} /> : <Clock size={16} />}
          </button>
        </div>
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownElRef}
          className="fixed z-[100] bg-white dark:bg-gray-800 rounded-2xl shadow-high border border-gray-200 dark:border-gray-500 overflow-hidden animate-scale-in"
          style={{ left: dropdownPos.left, top: dropdownPos.top, width: dropdownPos.width }}
        >
          <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700">
            <div ref={hourListRef} className="max-h-48 overflow-y-auto scrollbar-thin py-1">
              {Array.from({ length: 24 }).map((_, h) => (
                <button
                  key={h}
                  type="button"
                  data-active={selectedHour === h}
                  onClick={() => selectHour(h)}
                  className={`w-full text-center py-1.5 text-sm font-medium transition-colors ${selectedHour === h ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {pad2(h)}
                </button>
              ))}
            </div>
            <div ref={minuteListRef} className="max-h-48 overflow-y-auto scrollbar-thin py-1">
              {Array.from({ length: 60 }).map((_, m) => (
                <button
                  key={m}
                  type="button"
                  data-active={selectedMinute === m}
                  onClick={() => selectMinute(m)}
                  className={`w-full text-center py-1.5 text-sm font-medium transition-colors ${selectedMinute === m ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {pad2(m)}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 border-t border-gray-100 dark:border-gray-500 bg-gray-50 dark:bg-gray-800/50 flex gap-2">
            <button type="button" onClick={handleNow} className="flex-1 py-1.5 text-xs font-medium text-primary dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
              Agora
            </button>
            <button type="button" onClick={handleClear} className="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              Limpar
            </button>
          </div>
        </div>,
        document.body
      )}

      {error && <span className="text-xs font-bold text-red-500 mt-1">{error}</span>}
    </div>
  )
}

export default TimePicker
