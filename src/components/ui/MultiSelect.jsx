import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search, X } from 'lucide-react'

export default function MultiSelect({ label, options = [], values = [], onChange, placeholder = "Selecionar...", className = "", size = "md", sortOptions = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 0 })
  const containerRef = useRef(null)
  const dropdownElRef = useRef(null)
  const searchInputRef = useRef(null)
  const triggerRef = useRef(null)

  const isSm = size === "sm"

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPos({
        left: rect.left,
        top: rect.bottom + 6,
        width: Math.max(rect.width, 220)
      })
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && containerRef.current.contains(event.target)) return
      if (dropdownElRef.current && dropdownElRef.current.contains(event.target)) return
      setIsOpen(false)
      setSearchTerm('')
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      setSearchTerm('')
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
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

  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )

  const sortedOptions = sortOptions
    ? [...normalizedOptions].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
    : normalizedOptions

  const normalizeStr = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const filteredOptions = searchTerm
    ? sortedOptions.filter(opt =>
        normalizeStr(opt.label).toLowerCase().includes(normalizeStr(searchTerm).toLowerCase())
      )
    : sortedOptions

  const toggleValue = (val) => {
    const newValues = values.includes(val)
      ? values.filter(v => v !== val)
      : [...values, val]
    onChange(newValues)
  }

  const removeValue = (val, e) => {
    e.stopPropagation()
    onChange(values.filter(v => v !== val))
  }

  return (
    <>
      <div className={`relative ${className}`} ref={containerRef}>
        {label && (
          <label className="label">{label}</label>
        )}
        <div
          ref={triggerRef}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsOpen(!isOpen)
            }
          }}
          className="w-full flex items-center gap-1 flex-wrap px-4 py-3 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-500 text-gray-900 dark:text-gray-100 shadow-sm cursor-pointer hover:border-primary dark:hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-primary/25 dark:focus:ring-blue-400/40 transition-all min-h-[44px]"
        >
          {values.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            values.map(val => {
              const opt = normalizedOptions.find(o => o.value === val)
              const labelText = opt ? opt.label : val
              return (
                <span key={val} className="inline-flex items-center gap-1 badge-info px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {labelText}
                  <button type="button" onClick={(e) => removeValue(val, e)} aria-label={`Remover ${labelText}`} className="hover:opacity-70 transition-opacity rounded-full">
                    <X size={12} />
                  </button>
                </span>
              )
            })
          )}
          <ChevronDown size={isSm ? 14 : 18} className={`text-gray-400 shrink-0 ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownElRef}
          className="fixed z-[100] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-500 shadow-high overflow-hidden"
          style={{ left: dropdownPos.left, top: dropdownPos.top, width: dropdownPos.width }}
        >
          <div className="p-2 border-b border-gray-100 dark:border-gray-500">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                aria-label="Buscar opção"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25 dark:focus:ring-blue-400/40 text-gray-900 dark:text-white placeholder-gray-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5 scrollbar-thin" role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-400 text-center">Nenhum resultado</div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = values.includes(option.value)
                return (
                  <button
                    key={idx}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleValue(option.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors rounded-lg text-left ${isSelected ? 'filter-active' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <span className="truncate pr-2">{option.label}</span>
                    {isSelected && <X size={isSm ? 14 : 16} className="text-primary dark:text-blue-300 shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}