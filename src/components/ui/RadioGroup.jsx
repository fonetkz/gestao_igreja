import React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

export default function RadioGroup({
  label,
  options = [],
  value,
  onValueChange,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <span className="label-uppercase dark:text-slate-400">{label}</span>
      )}
      <RadioGroupPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        className="flex items-center gap-6"
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupPrimitive.Item
              value={opt.value}
              id={`radio-${opt.value}`}
              className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600
                         data-[state=checked]:border-primary data-[state=checked]:dark:border-primary-light data-[state=checked]:border-[5px]
                         transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
            </RadioGroupPrimitive.Item>
            <label
              htmlFor={`radio-${opt.value}`}
              className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {opt.label}
            </label>
          </div>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  )
}
