import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, LayoutDashboard, Search, ChevronDown, X, Users, Music, LogOut, Pencil, Settings } from 'lucide-react'
import Avatar from '../ui/Avatar'
import useAuthStore from '../../store/authStore'

const pageItems = [
  { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/membros', label: 'Membros', icon: Users },
  { to: '/programacao', label: 'Programação', icon: Music },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/conta', label: 'Conta', icon: Settings },
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
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF] flex items-center justify-center">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">{title}</h2>
          </div>

          {/* Center Navigation */}
          <nav className="flex items-center gap-1">
            {pageItems.slice(0, 4).map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.to) || 
                (item.to === '/conta' && location.pathname === '/conta')
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-64 pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all"
                />
              </div>
            )}

            {/* Notifications */}
            <Link
              to="/membros?view=alertas"
              className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              <Bell size={18} />
            </Link>

            {/* Settings */}
            <Link
              to="/configuracoes"
              className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              <Settings size={18} />
            </Link>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuClick}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <Avatar name={user?.name || 'Admin'} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name || 'Admin'}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-slide-down">
                  <div className="p-2 flex flex-col gap-1">
                    <Link 
                      to="/conta" 
                      onClick={() => setMenuOpen(false)} 
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil size={16} />
                      Editar Perfil
                    </Link>
                    <Link 
                      to="/configuracoes" 
                      onClick={() => setMenuOpen(false)} 
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} />
                      Configurações
                    </Link>
                    <div className="h-px bg-gray-100 my-1" />
                    <button 
                      onClick={() => { setMenuOpen(false); logout?.(); }} 
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
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