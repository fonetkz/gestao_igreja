import React from 'react'

export default function PageHeader({ label, title, subtitle, children }) {
  return (
    <div className="mb-10 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="heading-1">{title}</h1>
          {subtitle && (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">{subtitle}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
