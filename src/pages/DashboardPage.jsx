import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, Cake } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import Topbar from '../components/layout/Topbar'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import useMembersStore from '../store/membersStore'

const safeParseJson = (jsonStr, defaultValue = []) => {
  try {
    if (!jsonStr) return defaultValue
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? parsed : defaultValue
  } catch {
    return defaultValue
  }
}

function StatCard({ icon: Icon, label, value, color, trend }) {
  const colorClasses = {
    primary: 'bg-slate-900 text-white',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-blue-100 text-blue-600',
  }

  return (
    <Card hover padding="large" className="animate-slide-up relative overflow-hidden group">
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${colorClasses[color]}`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
          {trend && (
            <Badge className={trend.includes('-') ? 'badge-danger' : 'badge-success'}>
              <TrendingUp size={12} className={trend.includes('-') ? 'rotate-180' : ''} />
              <span>{trend}</span>
            </Badge>
          )}
        </div>
        <div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 shadow-lg rounded-lg border border-slate-700 px-3 py-2 text-white">
      <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400" />
        {payload[0].value}% presença
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const allMembers = useMembersStore(s => s.members)
  const attendance = useMembersStore(s => s.attendance)
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  // Gera as opções dos últimos 12 meses para o Select customizado
  const monthOptions = useMemo(() => {
    const options = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
      options.push({
        value,
        label: label.charAt(0).toUpperCase() + label.slice(1) // Primeira letra maiúscula
      })
    }
    return options
  }, [])

  const { monthlyData, overallRate, problematicMembers, birthdaysThisMonth, attendanceBySection } = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number)

    // Aniversariantes do mês selecionado
    const birthdays = allMembers.filter(member => {
      if (!member.data_nascimento) return false
      const birthDate = new Date(member.data_nascimento)
      return birthDate.getMonth() + 1 === month
    }).sort((a, b) => new Date(a.data_nascimento).getDate() - new Date(b.data_nascimento).getDate())

    // Dados de presença para o ano selecionado (para o gráfico)
    const yearData = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(year, i).toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
      presenca: 0
    }))

    const callsInYear = attendance.filter(c => c.data && c.data.startsWith(String(year)))
    const monthlyRates = {} // { '01': { total: 100, present: 80 }, ... }

    callsInYear.forEach(call => {
      const callMonth = call.data.substring(5, 7)
      if (!monthlyRates[callMonth]) monthlyRates[callMonth] = { total: 0, present: 0 }
      const registros = safeParseJson(call.registros_json)
      registros.forEach(reg => {
        monthlyRates[callMonth].total++
        if (reg.presente) monthlyRates[callMonth].present++
      })
    })

    Object.entries(monthlyRates).forEach(([m, data]) => {
      const monthIndex = parseInt(m, 10) - 1
      if (data.total > 0) {
        yearData[monthIndex].presenca = Math.round((data.present / data.total) * 100)
      }
    })

    // Presença por naipe (geral, não por mês)
    const sections = ['Baixo', 'Soprano', 'Tenor', 'Contralto']
    const attendanceBySectionData = sections.map(secao => {
      const membersInSection = allMembers.filter(m => m.secao === secao)
      const total = membersInSection.length
      if (total === 0) return { name: secao, rate: 0, total: 0 }
      const withFaltas = membersInSection.filter(m => m.faltas_mes_atual >= 1).length
      const rate = total > 0 ? Math.round(((total - withFaltas) / total) * 100) : 0
      return { name: secao, rate, total }
    })

    // Alertas e taxa de presença para o mês selecionado
    const callsInMonth = attendance.filter(c => c.data && c.data.startsWith(selectedMonth))
    const memberAbsences = {}
    let totalRecords = 0
    let presentRecords = 0

    callsInMonth.forEach(call => {
      const registros = safeParseJson(call.registros_json)
      registros.forEach(r => {
        totalRecords++
        if (r.presente) presentRecords++
        else {
          if (!memberAbsences[r.membro_id]) memberAbsences[r.membro_id] = 0
          memberAbsences[r.membro_id]++
        }
      })
    })

    const problematic = Object.entries(memberAbsences)
      .filter(([mId, count]) => count >= 3)
      .map(([mId, count]) => ({ ...allMembers.find(m => String(m.id) === mId), faltas_mes_atual: count }))
      .sort((a, b) => b.faltas_mes_atual - a.faltas_mes_atual)

    const rate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0

    return { monthlyData: yearData, overallRate: rate, problematicMembers: problematic, birthdaysThisMonth: birthdays, attendanceBySection: attendanceBySectionData }

  }, [allMembers, attendance, selectedMonth])

  const formatBirthDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.getDate()
  }

  return (
    <div className="min-h-screen pb-12">
      <Topbar title="Gestão Igreja" />

      <div className="px-4 sm:px-8 max-w-7xl mx-auto mt-8">
        <div className="relative z-50">
          <PageHeader
            label="Visão Geral"
            title="Dashboard"
            subtitle="Acompanhe as métricas essenciais e o desempenho da sua orquestra."
          >
            <div className="w-full sm:w-48">
              <Select
                options={monthOptions}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </div>
          </PageHeader>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
          <StatCard
            icon={Users}
            label="Membros"
            value={allMembers.length}
            color="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Presença"
            value={`${overallRate}%`}
            color="success"
          />
          <StatCard
            icon={AlertTriangle}
            label="Alertas Críticos"
            value={problematicMembers.length}
            color="warning"
          />
          <StatCard
            icon={Cake}
            label="Aniversariantes"
            value={birthdaysThisMonth.length}
            color="info"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Frequência + Presença por Seção */}
          <Card padding="small" className="flex flex-col">
            <div className="mb-2 pb-2 border-b border-slate-200">
              <h3 className="heading-4 text-slate-900 dark:text-white">Frequência Geral</h3>
            </div>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresenca" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} strokeOpacity={0.6} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} dy={4} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="presenca" stroke="#3B82F6" strokeWidth={2} fill="url(#colorPresenca)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <h4 className="heading-4 text-slate-900 dark:text-white mt-4 mb-2">Presença por Seção</h4>
            <div className="grid grid-cols-4 gap-2">
              {attendanceBySection.map((section) => (
                <div key={section.name} className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{section.rate}%</p>
                  <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">{section.name}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Alert Panel */}
          <Card padding="small" className="flex flex-col bg-gradient-to-b from-white to-slate-50/30 dark:from-slate-800 dark:to-slate-800/50 h-full">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle size={16} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="heading-4 text-slate-900 dark:text-white">Atenção</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                  3+ faltas
                </p>
              </div>
            </div>

            {problematicMembers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                  <CheckCircle2 size={20} className="text-emerald-600" strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Tudo certo!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sem alertas.</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {problematicMembers.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800
                                 hover:border-red-300 dark:hover:border-red-700/50 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all cursor-pointer group"
                    onClick={() => navigate('/membros')}
                  >
                    <Avatar name={member.nome} initials={member.iniciais} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{member.nome}</p>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{member.secao}</p>
                    </div>
                    <Badge className="badge-danger whitespace-nowrap text-[10px]">{member.faltas_mes_atual}</Badge>
                  </div>
                ))}
              </div>
            )}

            {problematicMembers.length > 0 && (
              <button onClick={() => navigate('/membros')} className="w-full mt-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold text-slate-900 dark:text-white transition-colors flex items-center justify-center gap-1 group">
                Ver Todos
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </Card>

          {/* Birthday Panel */}
          <Card padding="small" className="flex flex-col bg-gradient-to-b from-white to-slate-50/30 dark:from-slate-800 dark:to-slate-800/50 h-full">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
                <Cake size={16} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="heading-4 text-slate-900 dark:text-white">Aniversariantes</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                  Neste Mês
                </p>
              </div>
            </div>

            {birthdaysThisMonth.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                  <Cake size={20} className="text-slate-400" strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Nenhum</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Esta semana.</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {birthdaysThisMonth.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800
                                 hover:border-pink-300 dark:hover:border-pink-700/50 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 transition-all cursor-pointer group"
                    onClick={() => navigate('/membros')}
                  >
                    <Avatar name={member.nome} initials={member.iniciais} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{member.nome}</p>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{member.secao}</p>
                    </div>
                    <Badge className="badge-secondary whitespace-nowrap text-[10px]">{formatBirthDate(member.data_nascimento)}</Badge>
                  </div>
                ))}
              </div>
            )}

            {birthdaysThisMonth.length > 0 && (
              <button onClick={() => navigate('/membros')} className="w-full mt-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold text-slate-900 dark:text-white transition-colors flex items-center justify-center gap-1 group">
                Ver Todos
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
