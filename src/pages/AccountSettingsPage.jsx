import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Users, Settings, User, Mail, Lock, Eye, EyeOff, 
  Shield, Star, AlertCircle, Check, ChevronRight
} from 'lucide-react'
import Topbar from '../components/layout/Topbar'

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

  return (
    <div className="min-h-screen pb-12 bg-[#F5F5F7] dark:bg-[#1C1C1E]">
      <Topbar title="Gestão Igreja" />

      <div className="px-8 max-w-5xl mx-auto mt-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Gerenciamento da Conta</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas informações pessoais e de segurança.</p>
        </div>

        {/* Account Profile Card */}
        <div className="apple-card overflow-hidden">
          {/* Profile Identity Card */}
          <div className="flex items-center gap-5 p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#0051D4] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <User size={32} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gustavo Henrique</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Administrador Principal</p>
            </div>
          </div>

          {/* Data Fields Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column 1 - Fields */}
              <div className="space-y-4">
                {/* Display Name */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#3A3A3C]">
                  <label className="label-uppercase mb-2 block">Nome de Exibição</label>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900 dark:text-white">{localName}</span>
                    <button className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors">
                      <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#3A3A3C]">
                    <label className="label-uppercase mb-2 block">E-mail</label>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-gray-900 dark:text-white">{localEmail}</span>
                      <Mail size={18} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Email Verification Tooltip */}
                  <div 
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-20"
                    onMouseEnter={() => setShowEmailTooltip(true)}
                    onMouseLeave={() => setShowEmailTooltip(false)}
                  >
                    <button className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors">
                      <AlertCircle size={18} className="text-amber-500 dark:text-amber-400" />
                    </button>
                    {showEmailTooltip && (
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-64 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 shadow-lg animate-fade-in">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          Verificação Necessária: Se você alterar seu e-mail, enviaremos um código para confirmar a mudança.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role/Permission */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#3A3A3C]">
                  <label className="label-uppercase mb-2 block">Cargo/Permissão</label>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">Admin</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm shadow-amber-400/30">
                      <Star size={12} className="text-white fill-white" />
                      <span className="text-xs font-bold text-white">Admin</span>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#3A3A3C]">
                  <label className="label-uppercase mb-2 block">Telefone</label>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-900 dark:text-white">{localPhone}</span>
                    <button className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors">
                      <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 2 - Update Button */}
              <div className="flex flex-col justify-end">
                <button className="btn-apple-primary w-full py-4">
                  Atualizar Informações
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="apple-card overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Lock size={24} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Segurança da Conta</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Atualize suas credenciais de acesso.</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Password */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#3A3A3C]">
              <label className="label-uppercase mb-2 block">Senha Vigente</label>
              <div className="flex items-center justify-between">
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="flex-1 bg-transparent text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
                />
                <button
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors"
                >
                  {showCurrentPwd ? <EyeOff size={20} className="text-gray-400 dark:text-gray-500" /> : <Eye size={20} className="text-gray-400 dark:text-gray-500" />}
                </button>
              </div>
            </div>

            {/* New Password Section */}
            <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#1C1C1E]/50 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Criar nova senha</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* New Password */}
                <div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#3A3A3C]">
                    <label className="label-uppercase mb-2 block">Nova Senha</label>
                    <div className="flex items-center justify-between">
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="flex-1 bg-transparent text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors"
                      >
                        {showNewPwd ? <EyeOff size={20} className="text-gray-400 dark:text-gray-500" /> : <Eye size={20} className="text-gray-400 dark:text-gray-500" />}
                      </button>
                    </div>
                  </div>
                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            passwordStrength >= 75 ? 'bg-green-500' : passwordStrength >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {passwordStrength < 50 && 'Senha fraca'}
                        {passwordStrength >= 50 && passwordStrength < 75 && 'Senha moderada'}
                        {passwordStrength >= 75 && 'Senha forte'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#3A3A3C]">
                  <label className="label-uppercase mb-2 block">Confirmar Nova Senha</label>
                  <div className="flex items-center justify-between">
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="flex-1 bg-transparent text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors"
                    >
                      {showConfirmPwd ? <EyeOff size={20} className="text-gray-400 dark:text-gray-500" /> : <Eye size={20} className="text-gray-400 dark:text-gray-500" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Criptografia PBKDF2 aplicada.
                </span>
              </div>
              <button className="btn-apple-danger px-8 py-3">
                Confirmar Alterações de Segurança
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}