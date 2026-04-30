import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Music, Settings, HelpCircle, LogOut } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/membros', label: 'Integrantes', icon: Users },
  { to: '/programacao', label: 'Programação', icon: Music },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#1C1C1E] border-r border-gray-200 dark:border-gray-700/50 flex flex-col z-40 shadow-sm transition-colors duration-300">
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-xl flex items-center justify-center shadow-md">
            <Music size={20} className="text-white dark:text-gray-900" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Gestão Igreja</h1>
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-gray-400 dark:text-gray-500 mt-0.5">
              Gestão
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'nav-item-active nav-item dark:bg-gray-700/50 dark:text-white'
                : 'nav-item dark:text-gray-400 dark:hover:bg-gray-700/30 dark:hover:text-gray-200'
            }
          >
            <item.icon size={18} strokeWidth={2.2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700/50 space-y-1">
        <button className="nav-item w-full justify-between dark:text-gray-400 dark:hover:bg-gray-700/30 dark:hover:text-gray-200">
          <div className="flex items-center gap-3">
            <HelpCircle size={18} strokeWidth={2.2} />
            <span>Suporte</span>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
        >
          <LogOut size={18} strokeWidth={2.2} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
