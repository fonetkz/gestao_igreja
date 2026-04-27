import React from 'react'

const colorPalette = [
  'bg-primary', 'bg-indigo-600', 'bg-violet-600', 'bg-blue-600',
  'bg-cyan-600', 'bg-teal-600', 'bg-emerald-600', 'bg-amber-600',
  'bg-rose-600', 'bg-pink-600', 'bg-fuchsia-600', 'bg-purple-600',
]

function getColorFromName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colorPalette[Math.abs(hash) % colorPalette.length]
}

export default function Avatar({
  name = '',
  initials,
  src,
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  }

  const displayInitials = initials || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const bgColor = getColorFromName(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-sm ${className}`}
      />
    )
  }

  return (
    <div
      className={`
        ${sizes[size]} ${bgColor}
        rounded-full flex items-center justify-center
        font-semibold text-white
        ring-2 ring-white shadow-sm
        ${className}
      `}
      title={name}
    >
      {displayInitials}
    </div>
  )
}
