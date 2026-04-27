import React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Plus } from 'lucide-react'

export default function Checkbox({
  checked,
  onCheckedChange,
  variant = 'default',
  className = '',
  id,
}) {
  // variant 'plus' mostra um botão circular azul (como na referência para marcar presença)
  if (variant === 'plus') {
    return (
      <button
        onClick={() => onCheckedChange?.(!checked)}
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          transition-all duration-200
          ${checked
            ? 'bg-primary dark:bg-primary-light text-white shadow-md shadow-primary/30'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
          }
          ${className}
        `}
      >
        {checked ? <Check size={18} /> : <Plus size={18} />}
      </button>
    )
  }

  return (
    <CheckboxPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={`
        w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600
        flex items-center justify-center
        transition-all duration-200
        data-[state=checked]:bg-primary data-[state=checked]:dark:bg-primary-light data-[state=checked]:border-primary data-[state=checked]:dark:border-primary-light
        focus:outline-none focus:ring-2 focus:ring-primary/20
        ${className}
      `}
    >
      <CheckboxPrimitive.Indicator>
        <Check size={14} className="text-white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
