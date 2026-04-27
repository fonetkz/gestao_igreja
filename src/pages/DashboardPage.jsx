import React, { useMemo, useState } from 'react'
import { Users, TrendingUp, AlertTriangle, Cake, ArrowRight, CheckCircle2, Users2, TrendingDown } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts'
import Topbar from '../components/layout/Topbar'
import Avatar from '../components/ui/Avatar'

// Mock Data para Dashboard
const mockStats = {
  membros: 48,
  presenca: 88,
  alertas: 2,
  aniversariantes: 3
}

// Dados do gráfico de frequência - últimos 6 meses
const mockFrequencyData = [
  { mes: 'Nov', presenca: 82 },
  { mes: 'Dez', presenca: 78 },
  { mes: 'Jan', presenca: 85 },
  { mes: 'Fev', presenca: 91 },
  { mes: 'Mar', presenca: 88 },
  { mes: 'Abr', presenca: 88 },
]

// Presença por seção
const mockSectionsData = [
  { nome: 'Soprano', presenca: 92, membros: 12 },
  { nome: 'Contralto', presenca: 85, membros: 8 },
  { nome: 'Tenor', presenca: 88, membros: 10 },
  { nome: 'Baixo', presenca: 86, membros: 8 },
  { nome: 'Orquestra', presenca: 90, membros: 10 },
]

// Alertas de membros com falta
const mockAlertas = [
  { id: 1, nome: 'Marcos Silva', secao: 'Baixo', faltas: 3 },
  { id: 2, nome: 'Juliana Costa', secao: 'Soprano', faltas: 3 },
]

// Aniversariantes do mês
const mockAniversariantes = [
  { id: 1, nome: 'Ana Paula Silva', secao: 'Soprano', dia: 5 },
  { id: 2, nome: 'Pedro Santos', secao: 'Tenor', dia: 12 },
  { id: 3, nome: 'Lucas Oliveira', secao: 'Baixo', dia: 28 },
]

function StatCard({ icon: Icon, label, value, color, suffix = '' }) {
  const colorMap = {
    primary: { bg: 'bg-gray-900', icon: 'text-white' },
    success: { bg: 'bg-green-100', icon: 'text-green-600' },
    warning: { bg: 'bg-amber-100', icon: 'text-amber-600' },
    info: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  }
  const colors = colorMap[color]

  return (
    <div className="metric-card animate-slide-up group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={24} className={colors.icon} strokeWidth={2} />
        </div>
        <span className={`text-xs font-semibold ${color === 'success' ? 'text-green-600' : color === 'warning' ? 'text-amber-600' : 'text-gray-500'}`}>
          {suffix}
        </span>
      </div>
      <p className="text-4xl font-bold text-gray-900">{value}{suffix === '%' && '%'}</p>
      <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 shadow-lg rounded-xl px-3 py-2">
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
        {payload[0].value}% presença
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-04')

  const monthOptions = [
    { value: '2026-04', label: 'Abril de 2026' },
    { value: '2026-03', label: 'Março de 2026' },
    { value: '2026-02', label: 'Fevereiro de 2026' },
    { value: '2026-01', label: 'Janeiro de 2026' },
    { value: '2025-12', label: 'Dezembro de 2025' },
    { value: '2025-11', label: 'Novembro de 2025' },
  ]

  return (
    <div className="min-h-screen pb-12">
      <Topbar title="Gestão Igreja" />

      <div className="px-8 max-w-7xl mx-auto mt-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Acompanhe as métricas essenciais e o desempenho da sua orquestra.</p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="select-apple w-auto"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Stats Grid - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} label="Membros Ativos" value={mockStats.membros} color="primary" />
          <StatCard icon={TrendingUp} label="Presença Média" value={mockStats.presenca} color="success" suffix="%" />
          <StatCard icon={AlertTriangle} label="Alertas Críticos" value={mockStats.alertas} color="warning" />
          <StatCard icon={Cake} label="Aniversariantes" value={mockStats.aniversariantes} color="info" />
        </div>

        {/* Charts Area - Split 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Frequency Chart - 2 columns */}
          <div className="apple-card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequência Geral</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockFrequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresenca" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E5E5EA" vertical={false} />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 11, fontWeight: 500 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#C7C7CC', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="presenca" stroke="#007AFF" strokeWidth={2.5} fill="url(#colorPresenca)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Presence by Section - Horizontal bars */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Presença por Seção</h4>
              <div className="space-y-3">
                {mockSectionsData.map((section) => (
                  <div key={section.nome} className="flex items-center gap-4">
                    <span className="w-20 text-sm font-medium text-gray-700">{section.nome}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#007AFF] rounded-full transition-all duration-500" 
                        style={{ width: `${section.presenca}%` }} 
                      />
                    </div>
                    <span className="w-12 text-sm font-semibold text-gray-900 text-right">{section.presenca}%</span>
                    <span className="w-8 text-xs text-gray-400">{section.membros}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Alerts & Birthdays */}
          <div className="space-y-6">
            {/* Alerts Card */}
            <div className="apple-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Atenção</h3>
                  <p className="text-xs text-gray-500 font-medium">3+ faltas no mês</p>
                </div>
              </div>

              <div className="space-y-3">
                {mockAlertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                  >
                    <Avatar name={alerta.nome} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{alerta.nome}</p>
                      <p className="text-xs text-gray-500">{alerta.secao}</p>
                    </div>
                    <span className="badge-apple bg-red-100 text-red-700">{alerta.faltas} faltas</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Birthdays Card */}
            <div className="apple-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Cake size={20} className="text-pink-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Aniversariantes</h3>
                  <p className="text-xs text-gray-500 font-medium">Neste mês</p>
                </div>
              </div>

              <div className="space-y-3">
                {mockAniversariantes.map((aniv) => (
                  <div
                    key={aniv.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 border border-pink-100"
                  >
                    <Avatar name={aniv.nome} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{aniv.nome}</p>
                      <p className="text-xs text-gray-500">{aniv.secao}</p>
                    </div>
                    <span className="text-lg font-bold text-pink-600">{aniv.dia}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}