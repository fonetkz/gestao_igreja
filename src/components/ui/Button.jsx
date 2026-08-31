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
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200
        active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'btn-full' : ''}
        ${isDisabled ? 'opacity-70 cursor-not-allowed active:scale-100' : ''}
        ${className}
      `}
    >
      {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />}
      {!loading && Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      {children}
    </button>
  )
}