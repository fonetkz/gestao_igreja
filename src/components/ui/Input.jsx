import React, { forwardRef } from 'react'

export const Input = forwardRef(({
  label,
  error,
  className = '',
  id,
  type,
  ...props
}, ref) => {
  // Gera um ID único se não for passado nenhum, útil para vincular o <label> ao <input>
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36).substr(2, 9)}`

  const isDateInput = type === 'date'

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ${isDateInput ? 'flex items-center gap-2' : ''}`}
        >
          {isDateInput && (
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          )}
          {label}
        </label>
      )}

      {isDateInput ? (
        <div className="relative group">
          <div className="absolute left-0 top-0 bottom-0 w-12 rounded-l-xl bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/30 dark:to-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 flex items-center justify-center pointer-events-none group-focus-within:ring-4 group-focus-within:ring-blue-500/10">
            <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`
              w-full pl-14 pr-4 py-3.5 rounded-xl border text-base font-medium transition-all duration-200 focus:outline-none
              bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
              ${error
                ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
            style={{ colorScheme: 'light' }}
            {...props}
          />
        </div>
      ) : (
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none
            bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
            ${error
              ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10'
            }
          `}
          {...props}
        />
      )}

      {error && <span className="text-xs font-bold text-red-500 mt-1.5 animate-slide-up">{error}</span>}
    </div>
  )
})

Input.displayName = 'Input'

export const Textarea = forwardRef(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `textarea-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        className={`
          w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none min-h-[100px] resize-y
          bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
          ${error
            ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10'
          }
        `}
        {...props}
      />

      {error && <span className="text-xs font-bold text-red-500 mt-1.5 animate-slide-up">{error}</span>}
    </div>
  )
})

Textarea.displayName = 'Textarea'