import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useMembersStore from '../../store/membersStore'
import useHymnsStore from '../../store/hymnsStore'
import useSettingsStore from '../../store/settingsStore'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const fetchMembers = useMembersStore(s => s.fetchMembers)
  const fetchAttendance = useMembersStore(s => s.fetchAttendance)
  const fetchHymns = useHymnsStore(s => s.fetchHymns)
  const fetchProgramHistory = useHymnsStore(s => s.fetchProgramHistory)
  const fetchSettings = useSettingsStore(s => s.fetchSettings)

  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers()
      fetchAttendance()
      fetchHymns()
      fetchProgramHistory()
      fetchSettings()
    }
  }, [isAuthenticated, fetchMembers, fetchAttendance, fetchHymns, fetchProgramHistory, fetchSettings])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#1C1C1E] transition-colors duration-300">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
