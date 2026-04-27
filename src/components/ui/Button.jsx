import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = ''
}) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]'

  const variants = {
    primary: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-slate-900/20 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 disabled:shadow-none',
    outline: 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600',
    ghost: 'text-slate-600 dark:text-slate-400 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:text-slate-400 dark:disabled:text-slate-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 disabled:bg-red-300 dark:disabled:bg-red-900/50',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:bg-slate-50 dark:disabled:bg-slate-800/50',
  }

  const sizes = {
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyle}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-70 cursor-not-allowed active:scale-100' : ''}
        ${className}
      `}
    >
      {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />}
      {!loading && Icon && <Icon size={size === 'sm' ? 14 : 18} className={variant === 'outline' || variant === 'ghost' ? 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white' : ''} />}
      {children}
    </button>
  )
}
