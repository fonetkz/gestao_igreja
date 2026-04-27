import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, LayoutDashboard, Search, ChevronDown, X, Users, Music, LayoutGrid, LogOut, Pencil, Settings } from 'lucide-react'
import Avatar from '../ui/Avatar'
import useAuthStore from '../../store/authStore'

const pageItems = [
  { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/membros', label: 'Membros', icon: Users },
  { to: '/programacao', label: 'Programação', icon: Music },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Topbar({ title = 'Gestão Igreja', searchPlaceholder, onSearch }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="relative z-50 px-4 sm:px-8 pt-4 pb-2">
      <div className="flex items-center justify-between px-4 py-2 mx-auto max-w-7xl rounded-2xl bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">{title}</h2>
        </div>

        {/* Tabs - Center */}
        <div className="flex items-center gap-1">
          {pageItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <Icon size={16} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Search Bar Flutuante */}
        {searchPlaceholder && (
          <div className="hidden md:block flex-1 max-w-sm mx-4">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
              {searchFocused ? (
                <X
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 z-10"
                  onClick={() => { document.querySelector('input')?.blur(); onSearch?.(''); }}
                />
              ) : (
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              )}
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border-0 rounded-xl text-sm font-medium dark:text-white
                           placeholder:text-slate-400 dark:placeholder:text-slate-500 
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Actions Pills */}
        <div className="flex items-center gap-1 pr-2">
          {/* Notifications */}
          <Link
            to="/membros?view=alertas"
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 relative"
          >
            <Bell size={18} />
          </Link>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1" />

          {/* Settings */}
          <Link
            to="/configuracoes"
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <Settings size={18} />
          </Link>

          {/* User Menu Pill */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleMenuClick}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 group"
            >
              <Avatar name={user?.name || 'Admin'} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {user?.role === 'DIRECTOR' || user?.role === 'Director' ? 'Admin' : (user?.role || 'Gestor')}
                </p>
              </div>
              <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu com Efeito Blur */}
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden animate-slide-down origin-top-left">
                <div className="p-2 flex flex-col gap-1">
                  <Link to="/configuracoes" onClick={() => setMenuOpen(false)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <Pencil size={16} />
                    Editar Perfil
                  </Link>
                  <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1 mx-2" />
                  <button onClick={() => { setMenuOpen(false); logout && logout(); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}