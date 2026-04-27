import React, { useState } from 'react'
import { Music, History, Printer, ArrowRight } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import Card from '../components/ui/Card'
import ProgramacaoSimples from '../components/programming/ProgramacaoSimples'

export default function ProgrammingPage() {
  const [activeView, setActiveView] = useState('programar')
  const [confirmedData, setConfirmedData] = useState(null)

  const handleConfirm = (date, serviceType) => {
    setConfirmedData({ date, serviceType })
    setActiveView('imprimir')
  }

  const navItems = [
    { id: 'programar', icon: Music, label: 'Programar', color: 'blue', action: 'Criar' },
    { id: 'historico', icon: History, label: 'Histórico', color: 'purple', action: 'Consultar' },
    { id: 'imprimir', icon: Printer, label: 'Imprimir', color: 'emerald', action: 'Gerar' },
  ]

  const getColor = (color) => {
    switch(color) {
      case 'blue': return { gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25', border: 'border-blue-300 dark:border-blue-600', text: 'text-blue-600 dark:text-blue-400' }
      case 'purple': return { gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/25', border: 'border-purple-300 dark:border-purple-600', text: 'text-purple-600 dark:text-purple-400' }
      case 'emerald': return { gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25', border: 'border-emerald-300 dark:border-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' }
      default: return { gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25', border: 'border-blue-300 dark:border-blue-600', text: 'text-blue-600 dark:text-blue-400' }
    }
  }

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Topbar title="Choir Deck" />

      <div className="px-5 md:px-8 max-w-7xl mx-auto mt-8 md:mt-12">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            const c = getColor(item.color)
            return (
              <button 
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`
                  group text-left bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 
                  transition-all duration-300 border 
                  ${isActive ? `${c.border} shadow-lg` : 'border-slate-100 dark:border-slate-700'}
                `}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center ${c.shadow} mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {item.label}
                </h3>
                <span className={`inline-flex items-center gap-1.5 font-medium text-sm ${c.text}`}>
                  {item.action} <ArrowRight size={14} />
                </span>
              </button>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          {activeView === 'programar' && (
            <Card padding="none" className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <ProgramacaoSimples onConfirmed={handleConfirm} />
            </Card>
          )}
          
          {activeView === 'historico' && (
            <Card padding="none" className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <History size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Histórico de Programações</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Em breve você poderá consultar todas as programações anteriores.</p>
              </div>
            </Card>
          )}
          
          {activeView === 'imprimir' && (
            <Card padding="none" className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Printer size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Gerar Impressão</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Crie belos layouts para distribuição na igreja.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}