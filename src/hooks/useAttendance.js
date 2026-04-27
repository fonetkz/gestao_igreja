import { useMemo } from 'react'
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

export function useAttendance() {
  const attendance = useMembersStore((s) => s.attendance)
  const members = useMembersStore((s) => s.members)

  const monthlyData = useMemo(() => {
    const months = {}
    attendance.forEach((entry) => {
      if (!entry?.data) return
      const month = entry.data.substring(0, 7)
      if (!months[month]) {
        months[month] = { total: 0, present: 0, sessions: 0 }
      }
      months[month].sessions++
      const registros = safeParseJson(entry.registros_json)
      registros.forEach((r) => {
        months[month].total++
        if (r.presente) months[month].present++
      })
    })

    const monthNames = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
      '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
      '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
    }

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        name: monthNames[month.split('-')[1]] || month,
        month,
        presenca: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        total: data.total,
        presentes: data.present,
        sessoes: data.sessions,
      }))
  }, [attendance])

  const overallRate = useMemo(() => {
    let total = 0, present = 0
    attendance.forEach((entry) => {
      const registros = safeParseJson(entry.registros_json)
      registros.forEach((r) => {
        total++
        if (r.presente) present++
      })
    })
    return total > 0 ? Math.round((present / total) * 100) : 0
  }, [attendance])

  return {
    attendance,
    monthlyData,
    overallRate,
    totalSessions: attendance.length,
  }
}
