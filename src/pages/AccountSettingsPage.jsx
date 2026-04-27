import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Users, Settings, User, Mail, Lock, Eye, EyeOff, 
  Shield, Star, AlertCircle, Check, ChevronRight
} from 'lucide-react'

export default function AccountSettingsPage() {
  const [localName, setLocalName] = useState('Gustavo Henrique Rocha Alves')
  const [localEmail, setLocalEmail] = useState('ghr.9165@gmail.com')
  const [localPhone, setLocalPhone] = useState('+55 (17) 99123-4567')
  const [showEmailTooltip, setShowEmailTooltip] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  const getPasswordStrength = () => {
    if (!newPassword) return 0
    let strength = 0
    if (newPassword.length >= 6) strength += 25
    if (newPassword.length >= 10) strength += 25
    if (/[A-Z]/.test(newPassword)) strength += 25
    if (/[0-9]/.test(newPassword)) strength += 25
    return strength
  }

  const passwordStrength = getPasswordStrength()

  const location = useLocation()
  const navItems = [
    { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { to: '/membros', label: 'Usuários', icon: Users },
    { to: '/configuracoes', label: 'Configurações', icon: Settings, active: true },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F0' }}>
      {/* Navigation Sidebar */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.active || location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5' 
                  : 'bg-white/40 backdrop-blur-md hover:bg-white/60'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              <span className={`text-sm font-medium ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-5xl space-y-8">
          
          {/* Account Profile Card - Frosted Glass */}
          <div 
            className="relative overflow-hidden rounded-[32px]"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.5),
                0 20px 60px -10px rgba(0, 0, 0, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `
            }}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6">
              <h1 className="text-3xl font-bold text-slate-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
                Gerenciamento da Conta
              </h1>
              <p className="mt-2 text-slate-500" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}>
                Gerencie suas informações pessoais e de segurança.
              </p>
            </div>

            {/* Profile Section */}
            <div className="px-8 pb-8">
              {/* Profile Identity Card */}
              <div 
                className="flex items-center gap-5 p-5 rounded-[24px] mb-8"
                style={{
                  background: 'rgba(0, 0, 0, 0.03)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-[20px] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #007AFF 0%, #0051D4 100%)',
                    boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)'
                  }}
                >
                  <User size={32} className="text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Gustavo Henrique</h2>
                  <p className="text-sm text-slate-500">Adminstrador Principal</p>
                </div>
              </div>

              {/* Data Fields Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column 1 - Fields */}
                <div className="space-y-4">
                  {/* Display Name */}
                  <div 
                    className="p-5 rounded-[20px]"
                    style={{
                      background: 'rgba(245, 245, 240, 0.6)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Nome de Exibição
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-slate-700">{localName}</span>
                      <button className="p-2 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <ChevronRight size={18} className="text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Email - with tooltip */}
                  <div className="relative">
                    <div 
                      className="p-5 rounded-[20px]"
                      style={{
                        background: 'rgba(245, 245, 240, 0.6)',
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        E-mail
                      </label>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-slate-700">{localEmail}</span>
                        <Mail size={18} className="text-slate-400" />
                      </div>
                    </div>
                    
                    {/* Email Verification Tooltip */}
                    <div 
                      className="absolute -right-2 top-1/2 -translate-y-1/2 z-20"
                      onMouseEnter={() => setShowEmailTooltip(true)}
                      onMouseLeave={() => setShowEmailTooltip(false)}
                    >
                      <button className="p-2 rounded-full hover:bg-slate-200/50 transition-colors">
                        <AlertCircle size={18} className="text-amber-500" />
                      </button>
                      {showEmailTooltip && (
                        <div 
                          className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-64 p-4 rounded-[16px] animate-fade-in"
                          style={{
                            background: '#E8F4FD',
                            boxShadow: '0 8px 32px rgba(0, 122, 255, 0.2)'
                          }}
                        >
                          <p className="text-sm text-blue-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                            Verificação Necessária: Se você alterar seu e-mail, enviaremos um código para confirmar a mudança.
                          </p>
                          <div 
                            className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-[12px]"
                            style={{ borderLeftColor: '#E8F4FD' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role/Permission */}
                  <div 
                    className="p-5 rounded-[20px]"
                    style={{
                      background: 'rgba(245, 245, 240, 0.6)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Cargo/Permissão
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-slate-700">Admin</span>
                      <div 
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #FFD60A 0%, #FFB800 100%)',
                          boxShadow: '0 2px 8px rgba(255, 214, 10, 0.4)'
                        }}
                      >
                        <Star size={12} className="text-white fill-white" />
                        <span className="text-xs font-bold text-white">Admin</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div 
                    className="p-5 rounded-[20px]"
                    style={{
                      background: 'rgba(245, 245, 240, 0.6)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Telefone
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-slate-700">{localPhone}</span>
                      <button className="p-2 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <ChevronRight size={18} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 2 - Update Button */}
                <div className="flex flex-col justify-end">
                  <button
                    className="w-full py-4 rounded-[16px] font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #007AFF 0%, #0051D4 100%)',
                      boxShadow: '0 8px 24px rgba(0, 122, 255, 0.35)'
                    }}
                  >
                    Atualizar Informações
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card - Frosted Glass */}
          <div 
            className="relative overflow-hidden rounded-[32px]"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.5),
                0 20px 60px -10px rgba(0, 0, 0, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `
            }}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FF3B30 0%, #D62626 100%)',
                    boxShadow: '0 4px 16px rgba(255, 59, 48, 0.3)'
                  }}
                >
                  <Lock size={24} className="text-white" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Segurança da Conta
                  </h1>
                  <p className="text-slate-500">
                    Atualize suas credenciais de acesso.
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-8 space-y-6">
              {/* Current Password */}
              <div 
                className="p-5 rounded-[20px]"
                style={{
                  background: 'rgba(245, 245, 240, 0.6)',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)'
                }}
              >
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Senha Vigente
                </label>
                <div className="flex items-center justify-between">
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="flex-1 bg-transparent text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="p-2 rounded-lg hover:bg-slate-200/50 transition-colors"
                  >
                    {showCurrentPwd ? <EyeOff size={20} className="text-slate-400" /> : <Eye size={20} className="text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* New Password Section */}
              <div 
                className="p-6 rounded-[24px]"
                style={{
                  background: 'rgba(0, 0, 0, 0.025)',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.03)'
                }}
              >
                <h3 className="text-lg font-semibold text-slate-700 mb-5">Criar nova senha</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* New Password */}
                  <div>
                    <div 
                      className="p-5 rounded-[20px]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Nova Senha
                      </label>
                      <div className="flex items-center justify-between">
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="flex-1 bg-transparent text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                        />
                        <button
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="p-2 rounded-lg hover:bg-slate-200/50 transition-colors"
                        >
                          {showNewPwd ? <EyeOff size={20} className="text-slate-400" /> : <Eye size={20} className="text-slate-400" />}
                        </button>
                      </div>
                    </div>
                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="mt-3 space-y-2">
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.06)' }}>
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${passwordStrength}%`,
                              background: passwordStrength >= 75 
                                ? 'linear-gradient(90deg, #34C759 0%, #30D158 100%)'
                                : passwordStrength >= 50
                                  ? 'linear-gradient(90deg, #FFD60A 0%, #FFB800 100%)'
                                  : 'linear-gradient(90deg, #FF3B30 0%, #D62626 100%)'
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">
                          {passwordStrength < 50 && 'Senha fraca'}
                          {passwordStrength >= 50 && passwordStrength < 75 && 'Senha moderada'}
                          {passwordStrength >= 75 && 'Senha forte'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div 
                    className="p-5 rounded-[20px]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Confirmar Nova Senha
                    </label>
                    <div className="flex items-center justify-between">
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="flex-1 bg-transparent text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                      />
                      <button
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="p-2 rounded-lg hover:bg-slate-200/50 transition-colors"
                      >
                        {showConfirmPwd ? <EyeOff size={20} className="text-slate-400" /> : <Eye size={20} className="text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-slate-400" />
                  <span className="text-sm text-slate-500">
                    A segurança é nossa prioridade. Criptografia PBKDF2 aplicada.
                  </span>
                </div>
                <button
                  className="px-8 py-4 rounded-[16px] font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #FF3B30 0%, #D62626 100%)',
                    boxShadow: '0 8px 24px rgba(255, 59, 48, 0.35)'
                  }}
                >
                  Confirmar Alterações de Segurança
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}