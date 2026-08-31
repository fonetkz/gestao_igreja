import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const Z_INDEX_CLASSES = {
  50: 'z-50',
  210: 'z-[210]',
}

export default function Modal({ isOpen, onClose, title, children, size = 'lg', zIndex = 50 }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement
    const panel = panelRef.current
    if (panel) {
      const target = panel.querySelector('input:not([type="hidden"]), select, textarea')
      if (target instanceof HTMLElement) target.focus()
      else panel.focus()
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const focusable = Array.from(
        panel.querySelectorAll(
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className={`fixed inset-0 ${Z_INDEX_CLASSES[zIndex] || 'z-50'} flex items-center justify-center p-4 animate-fade-in`}>
      <div
        className="absolute inset-0 bg-gray-900/30 dark:bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`relative card w-full ${sizeClasses[size]} overflow-hidden animate-scale-in border-gray-200 dark:border-gray-500 focus:outline-none`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-500 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="heading-3">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}