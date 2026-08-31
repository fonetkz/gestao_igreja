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
    normal: 'p-5',
    large: 'p-6',
  }

  return (
    <div className={`
      card
      ${hover ? 'card-hover' : ''}
      ${paddingClasses[padding] || paddingClasses.normal}
      ${className}
    `}>
      {children}
    </div>
  )
}