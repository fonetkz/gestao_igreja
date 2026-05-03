import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, LayoutDashboard, Search, ChevronDown, Users, Music, LogOut, Pencil, Settings, Sun, Moon } from 'lucide-react'
import Avatar from '../ui/Avatar'
import useAuthStore from '../../store/authStore'
import useMembersStore from '../../store/membersStore'

const pageItems = [
  { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/membros', label: 'Integrantes', icon: Users },
  { to: '/programacao', label: 'Programação', icon: Music },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Topbar({ title = 'Gestão Igreja', searchPlaceholder, onSearch }) {
  const user = useAuthStore((s) => s.user)
  const members = useMembersStore((s) => s.members) || []
  const attendance = useMembersStore((s) => s.attendance) || []
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const [logoError, setLogoError] = useState(false)
  const location = useLocation()

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('gestao_igreja_theme') === 'dark'
    } catch { return false }
  })

  // Sincroniza o tema na montagem e sempre que isDarkMode mudar
  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      localStorage.setItem('gestao_igreja_theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('gestao_igreja_theme', 'light')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  const hasAlerts = useMemo(() => {
    if (!members.length || !attendance.length) return false
    const currentMonth = new Date().toISOString().slice(0, 7)

    for (const member of members) {
      if (member.status !== 'Ativo') continue
      let unjustifiedCount = 0
      for (const call of attendance) {
        let isThisMonth = false
        if (call.data) {
          if (call.data.includes('-') && call.data.startsWith(currentMonth)) isThisMonth = true
          else if (call.data.includes('/')) {
            const [d, mo, y] = call.data.split('/')
            if (`${y}-${mo}` === currentMonth) isThisMonth = true
          }
        }
        if (isThisMonth) {
          const regs = call.registros_json || call.registros || []
          const reg = regs.find(r => String(r.membro_id) === String(member.id))
          if (reg && !reg.presente && (!reg.justificativa || reg.justificativa.trim() === '')) {
            unjustifiedCount++
            if (unjustifiedCount >= 2) return true // Retorna verdadeiro na primeira ocorrência encontrada
          }
        }
      }
    }
    return false
  }, [members, attendance])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-[200] glass">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Logo do Sistema"
                className="w-8 h-8 object-contain rounded-lg"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#007AFF] flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Music size={16} className="text-white" />
              </div>
            )}
            <h2 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">{title}</h2>
          </div>

          {/* Center Navigation */}
          <nav className="flex items-center gap-1">
            {pageItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                >
                  <Icon size={16} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchPlaceholder && (
              <div className="hidden lg:block relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="w-64 pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#3A3A3C] border-0 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:bg-white dark:focus:bg-[#48484A] focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all"
                />
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
              title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications */}
            <Link
              to="/membros?view=alertas"
              className="relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <Bell size={18} />
              {hasAlerts && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white/50 dark:ring-[#1C1C1E]/50" />
              )}
            </Link>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
              >
                <Avatar name={user?.name || 'Admin'} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{user?.name || 'Admin'}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-lg overflow-hidden animate-slide-down">
                  <div className="p-2 flex flex-col gap-1">
                    <Link
                      to="/configuracoes?section=perfil"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <Pencil size={16} />
                      Editar Perfil
                    </Link>
                    <Link
                      to="/configuracoes"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <Settings size={16} />
                      Configurações
                    </Link>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}