import React, { forwardRef } from 'react'

export const Input = forwardRef(({
  label,
  error,
  className = '',
  id,
  type,
  ...props
}, ref) => {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36).substr(2, 9)}`

  const isDateInput = type === 'date'

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`label ${isDateInput ? 'flex items-center gap-2' : ''}`}
        >
          {isDateInput && (
            <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-primary dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          )}
          {label}
        </label>
      )}

      {isDateInput ? (
        <div className="relative group">
          <div className="absolute left-0 top-0 bottom-0 w-12 rounded-l-xl bg-blue-50 dark:bg-blue-900/30 border border-r-0 border-gray-200 dark:border-gray-500 flex items-center justify-center pointer-events-none group-focus-within:ring-4 group-focus-within:ring-primary/10">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`
              w-full pl-14 pr-4 py-3.5 rounded-xl border text-base font-medium transition-all duration-200 focus:outline-none
              bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              ${error
                ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-gray-200 dark:border-gray-500 focus:border-primary dark:focus:border-blue-400 focus:ring-4 focus:ring-primary/10 dark:focus:ring-blue-400/10 hover:border-gray-300 dark:hover:border-gray-400'
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
            bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${error
              ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-gray-200 dark:border-gray-500 focus:border-primary dark:focus:border-blue-400 focus:ring-4 focus:ring-primary/10 dark:focus:ring-blue-400/10'
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
          className="label"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        className={`
          w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none min-h-[100px] resize-y
          bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
          ${error
            ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-gray-200 dark:border-gray-500 focus:border-primary dark:focus:border-blue-400 focus:ring-4 focus:ring-primary/10 dark:focus:ring-blue-400/10'
          }
        `}
        {...props}
      />

      {error && <span className="text-xs font-bold text-red-500 mt-1.5 animate-slide-up">{error}</span>}
    </div>
  )
})

Textarea.displayName = 'Textarea'