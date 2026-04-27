import React from 'react'

export default function Card({
  children,
  className = '',
  padding = 'normal',
  hover = false
}) {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  }

  const baseClasses = 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors duration-300'
  const shadowClasses = 'shadow-sm'
  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-300' : ''

  return (
    <div className={`${baseClasses} ${shadowClasses} ${hoverClasses} ${paddingClasses[padding] || paddingClasses.normal} ${className}`}>
      {children}
    </div>
  )
}