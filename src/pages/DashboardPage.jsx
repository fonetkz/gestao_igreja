import React, { useMemo } from 'react'
import { Users, TrendingUp, AlertTriangle, Cake, Music } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import Topbar from '../components/layout/Topbar'
import Avatar from '../components/ui/Avatar'
import useMembersStore from '../store/membersStore'
import useHymnsStore from '../store/hymnsStore'
import { useAttendance } from '../hooks/useAttendance'

function StatCard({ icon: Icon, label, value, color, suffix = '' }) {
  const colorMap = {
    primary: { bg: 'bg-gray-900 dark:bg-white', icon: 'text-white dark:text-gray-900' },
    success: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    warning: { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600 dark:text-amber-400' },
    info: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  }
  const colors = colorMap[color]

  return (
    <div className="metric-card animate-slide-up group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={24} className={colors.icon} strokeWidth={2} />
        </div>
      </div>
      <p className="text-4xl font-bold text-gray-900 dark:text-white">{value}{suffix === '%' && '%'}</p>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</p>
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
  const members = useMembersStore((s) => s.members)
  const getProblematicMembers = useMembersStore((s) => s.getProblematicMembers)
  const { monthlyData, overallRate } = useAttendance()

  // Stats reais
  const activeMembers = useMemo(() => members.filter(m => m.status === 'Ativo').length, [members])
  const problematicMembers = useMemo(() => getProblematicMembers(), [members])

  // Aniversariantes do mês
  const birthdayMembers = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1
    return members.filter(m => {
      if (!m.data_nascimento) return false
      const parts = m.data_nascimento.split('-')
      if (parts.length === 3) return parseInt(parts[1]) === currentMonth
      const partsSlash = m.data_nascimento.split('/')
      if (partsSlash.length === 3) return parseInt(partsSlash[1]) === currentMonth
      return false
    })
  }, [members])

  // Presença por seção
  const sectionData = useMemo(() => {
    const sections = {}
    members.filter(m => m.status === 'Ativo').forEach(m => {
      const sec = m.secao || m.instrumento_voz || 'Outros'
      if (!sections[sec]) sections[sec] = { count: 0 }
      sections[sec].count++
    })
    return Object.entries(sections)
      .map(([nome, data]) => ({ nome, membros: data.count, presenca: overallRate || 0 }))
      .sort((a, b) => b.membros - a.membros)
      .slice(0, 6)
  }, [members, overallRate])

  // Gráfico
  const chartData = useMemo(() => {
    if (monthlyData.length > 0) return monthlyData.slice(-6)
    return [{ name: 'Sem dados', presenca: 0 }]
  }, [monthlyData])

  return (
    <div className="min-h-screen pb-12">
      <Topbar title="Gestão Igreja" />

      <div className="px-8 max-w-7xl mx-auto mt-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Acompanhe as métricas essenciais da sua organização.</p>
          </div>
        </div>

        {/* Stats Grid - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} label="Membros Ativos" value={activeMembers} color="primary" />
          <StatCard icon={TrendingUp} label="Presença Média" value={overallRate} color="success" suffix="%" />
          <StatCard icon={AlertTriangle} label="Alertas Críticos" value={problematicMembers.length} color="warning" />
          <StatCard icon={Cake} label="Aniversariantes" value={birthdayMembers.length} color="info" />
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Frequency Chart */}
          <div className="apple-card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Frequência Geral</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresenca" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E5E5EA" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 11, fontWeight: 500 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#C7C7CC', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="presenca" stroke="#007AFF" strokeWidth={2.5} fill="url(#colorPresenca)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Presence by Section */}
            {sectionData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Membros por Seção</h4>
                <div className="space-y-3">
                  {sectionData.map((section) => (
                    <div key={section.nome} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{section.nome}</span>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#007AFF] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((section.membros / Math.max(activeMembers, 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm font-semibold text-gray-900 dark:text-white text-right">{section.membros}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Alerts & Birthdays */}
          <div className="space-y-6">
            {/* Alerts Card */}
            <div className="apple-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500 dark:text-red-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Atenção</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">2+ faltas no mês</p>
                </div>
              </div>

              <div className="space-y-3">
                {problematicMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Nenhum alerta no momento 🎉</p>
                ) : (
                  problematicMembers.slice(0, 5).map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
                      <Avatar name={m.nome} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.nome}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{m.secao || m.instrumento_voz}</p>
                      </div>
                      <span className="badge-apple bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">{m.faltas_mes_atual} faltas</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Birthdays Card */}
            <div className="apple-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Cake size={20} className="text-pink-500 dark:text-pink-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Aniversariantes</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Neste mês</p>
                </div>
              </div>

              <div className="space-y-3">
                {birthdayMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Nenhum aniversariante este mês</p>
                ) : (
                  birthdayMembers.slice(0, 5).map((m) => {
                    const day = m.data_nascimento?.split('-')[2] || m.data_nascimento?.split('/')[0] || '?'
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800/30">
                        <Avatar name={m.nome} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.nome}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{m.secao || m.instrumento_voz}</p>
                        </div>
                        <span className="text-lg font-bold text-pink-600 dark:text-pink-400">{parseInt(day)}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}