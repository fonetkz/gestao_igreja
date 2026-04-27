import React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      {children}
    </TabsPrimitive.Root>
  )
}

export function TabsList({ children, className = '' }) {
  return (
    <TabsPrimitive.List
      className={`
        flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-10 overflow-x-auto scrollbar-hide
        ${className}
      `}
    >
      {children}
    </TabsPrimitive.List>
  )
}

export function TabsTrigger({ value, children, badge, icon: Icon, className = '' }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={`
        relative flex items-center gap-2.5 px-6 py-3 text-sm font-bold transition-colors duration-200 whitespace-nowrap
        text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/50
        data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400
        data-[state=active]:after:absolute
        data-[state=active]:after:bottom-0
        data-[state=active]:after:left-0
        data-[state=active]:after:right-0
        data-[state=active]:after:h-1
        data-[state=active]:after:bg-blue-600
        data-[state=active]:after:rounded-t-md
        focus:outline-none
        ${className}
      `}
    >
      {Icon && <Icon size={18} className="group-data-[state=active]:stroke-[2.5px]" />}
      <span className="flex items-center gap-2">
        {children}
        {badge && (
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        )}
      </span>
    </TabsPrimitive.Trigger>
  )
}

export function TabsContent({ value, children, className = '' }) {
  return (
    <TabsPrimitive.Content
      value={value}
      className={`animate-fade-in focus:outline-none ${className}`}
    >
      {children}
    </TabsPrimitive.Content>
  )
}
