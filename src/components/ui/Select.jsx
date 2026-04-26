import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function Select({ label, options = [], value, onChange, placeholder = "Selecione...", className = "", size = "md" }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isSm = size === "sm"
  const padding = isSm ? "px-2 py-1.5" : "px-4 py-3"
  const textSize = isSm ? "text-xs" : "text-sm"
  const rounded = isSm ? "rounded-lg" : "rounded-2xl"
  const optionPadding = isSm ? "px-2 py-1.5" : "px-3 py-2.5"

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Normaliza opções para garantir que tenham o formato { value, label }
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )

  const selectedOption = normalizedOptions.find(opt => opt.value === value)
  const displayValue = selectedOption ? selectedOption.label : placeholder

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between ${padding} ${textSize} rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all`}
      >
        <span className={!selectedOption && !value ? "text-slate-400" : "font-medium truncate pr-2"}>
          {displayValue}
        </span>
        <ChevronDown size={isSm ? 14 : 18} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="fixed z-[100] min-w-[200px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden animate-slide-down origin-top" style={{ left: dropdownRef.current?.getBoundingClientRect().left, top: dropdownRef.current?.getBoundingClientRect().bottom + 8 }}>
          <div className={`max-h-60 overflow-y-auto p-2 scrollbar-hide flex flex-col gap-1`}>
            {normalizedOptions.map((option, idx) => {
              const isSelected = value === option.value
              return (
                <button key={idx} type="button" onClick={() => { onChange(option.value); setIsOpen(false); }} className={`w-full flex items-center justify-between ${optionPadding} ${textSize} font-medium transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  <span className="truncate pr-2">{option.label}</span>
                  {isSelected && <Check size={isSm ? 12 : 16} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}