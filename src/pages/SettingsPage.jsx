import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Check, User, Lock, Eye, EyeOff, Save, Shield, ChevronDown, Music, Users, Calendar, Award, Edit2, X, Loader2, Mail, AlertTriangle, CheckCircle } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import useAuthStore from '../store/authStore'
import useSettingsStore from '../store/settingsStore'
import api from '../services/api'

// ─── AccordionItem conectado ao settingsStore ───────────────────────────────
function AccordionItem({ listName, title, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')

  const items = useSettingsStore((s) => s[listName] || [])
  const addItem = useSettingsStore((s) => s.addItem)
  const removeItem = useSettingsStore((s) => s.removeItem)
  const updateItem = useSettingsStore((s) => s.updateItem)

  const handleAdd = () => {
    const trimmed = newLabel.trim()
    if (!trimmed) return
    addItem(listName, { label: trimmed, value: trimmed.toLowerCase().replace(/\s+/g, '_') })
    setNewLabel('')
  }

  const handleStartEdit = (item) => {
    setEditingId(item.id)
    setEditLabel(item.label)
  }

  const handleSaveEdit = (id) => {
    const trimmed = editLabel.trim()
    if (trimmed) updateItem(listName, id, { label: trimmed, value: trimmed.toLowerCase().replace(/\s+/g, '_') })
    setEditingId(null)
  }

  return (
    <div className="apple-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Icon size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{items.length} itens</p>
          </div>
        </div>
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
          <div className="py-3 space-y-2">
            {items.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-3">Nenhum item cadastrado</p>
            )}
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                {editingId === item.id ? (
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                    className="flex-1 bg-white dark:bg-gray-600 border border-blue-400 rounded-lg px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                )}
                <div className="flex items-center gap-1 ml-2">
                  {editingId === item.id ? (
                    <button onClick={() => handleSaveEdit(item.id)} className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                      <Check size={14} />
                    </button>
                  ) : (
                    <button onClick={() => handleStartEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                  )}
                  <button onClick={() => removeItem(listName, item.id)} className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Novo item..."
              className="input-apple flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} className="btn-apple-primary px-3">
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Seção de configurações auxiliares ─────────────────────────────────────
const sectionConfigs = [
  { listName: 'meetingTypes', title: 'Tipos de Reunião', icon: Calendar },
  { listName: 'hymnTypes', title: 'Tipos de Hinos', icon: Music },
  { listName: 'voices', title: 'Vozes do Coral', icon: Music },
  { listName: 'instruments', title: 'Instrumentos', icon: Music },
  { listName: 'statuses', title: 'Situações do Integrante', icon: Award },
  { listName: 'positions', title: 'Cargos e Funções', icon: Award },
  { listName: 'conductors', title: 'Regentes', icon: Users },
  { listName: 'hymnSections', title: 'Seções de Hinos', icon: Award },
  { listName: 'attendanceContexts', title: 'Contextos de Chamada', icon: Check },
]

// ─── Página principal ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('perfil')

  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const updateCredentials = useAuthStore((s) => s.updateCredentials)
  const passwordHash = useAuthStore((s) => s.passwordHash)

  const [localName, setLocalName] = useState(user?.name || '')
  const [localEmail, setLocalEmail] = useState(user?.email || '')
  const [profileSaved, setProfileSaved] = useState(false)
  const [showEmailCodeInput, setShowEmailCodeInput] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [emailCodeError, setEmailCodeError] = useState('')
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSaved, setPwdSaved] = useState(false)

  const [isForgotPwdMode, setIsForgotPwdMode] = useState(false)
  const [pwdResetCode, setPwdResetCode] = useState('')
  const [isPwdLoading, setIsPwdLoading] = useState(false)

  const handleSaveProfile = async () => {
    if (!localName.trim() || !localEmail.trim()) return

    if (localEmail !== user?.email) {
      setIsEmailLoading(true)
      try {
        await api.post('/api/auth/solicitar-troca-email', { new_email: localEmail })
        setShowEmailCodeInput(true)
        setEmailCodeError('')
      } catch (err) {
        console.error(err)
        alert('Erro ao solicitar troca de e-mail.')
      } finally {
        setIsEmailLoading(false)
      }
    } else {
      await updateProfile({ name: localName, email: localEmail })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    }
  }

  const handleConfirmEmailChange = async () => {
    if (!emailCode.trim()) {
      setEmailCodeError('Digite o código recebido.')
      return
    }
    setIsEmailLoading(true)
    try {
      const res = await api.post('/api/auth/confirmar-troca-email', { token: emailCode })
      await updateProfile({ name: localName, email: res.data.new_email })
      setShowEmailCodeInput(false)
      setEmailCode('')
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch (err) {
      setEmailCodeError(err.response?.data?.detail || 'Código inválido ou expirado.')
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleRequestPwdReset = async () => {
    setIsPwdLoading(true)
    try {
      await api.post('/api/auth/esqueci-senha', { email: user?.email })
      setIsForgotPwdMode(true)
      setPwdError('')
      setPwdResetCode('')
    } catch (err) {
      setPwdError('Erro ao solicitar recuperação. Verifique sua conexão.')
    } finally {
      setIsPwdLoading(false)
    }
  }

  const handleSavePassword = async () => {
    setPwdError('')
    if (newPassword.length < 6) { setPwdError('A nova senha deve ter pelo menos 6 caracteres'); return }
    if (newPassword !== confirmPassword) { setPwdError('As senhas não conferem'); return }

    setIsPwdLoading(true)
    try {
      if (isForgotPwdMode) {
        if (!pwdResetCode.trim()) { setPwdError('Digite o código recebido no e-mail'); setIsPwdLoading(false); return }
        await api.post('/api/auth/redefinir-senha', { token: pwdResetCode, new_password: newPassword })
        await updateCredentials(user?.email || localEmail, newPassword)
      } else {
        if (!currentPassword) { setPwdError('Digite a senha atual'); setIsPwdLoading(false); return }
        if (currentPassword !== (passwordHash || 'choir2024')) { setPwdError('Senha atual incorreta'); setIsPwdLoading(false); return }
        await updateCredentials(user?.email || localEmail, newPassword)
      }
      setPwdSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwdResetCode('')
      setIsForgotPwdMode(false)
      setTimeout(() => setPwdSaved(false), 2000)
    } catch (err) {
      setPwdError(err.response?.data?.detail || 'Erro ao alterar a senha. Verifique o código e tente novamente.')
    } finally {
      setIsPwdLoading(false)
    }
  }

  const sidebarItems = [
    { id: 'perfil', label: 'Meu Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Lock },
    { id: 'tabelas', label: 'Tabelas Auxiliares', icon: Award },
  ]

  return (
    <div className="min-h-screen pb-12 bg-[#F5F5F7] dark:bg-[#1C1C1E]">
      <Topbar title="Gestão Igreja" />

      <div className="px-8 max-w-7xl mx-auto mt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Configurações</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas informações e preferências do sistema.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="apple-card p-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                      ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/30'
                      }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 animate-fade-in">

            {/* ── Perfil ── */}
            {activeSection === 'perfil' && (
              <div className="apple-card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Dados Pessoais</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label-uppercase mb-2 block">Nome Completo</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        className="input-apple pl-10"
                        placeholder="Seu nome completo"
                        disabled={showEmailCodeInput}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-uppercase mb-2 block">E-mail de Acesso</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={localEmail}
                        onChange={(e) => setLocalEmail(e.target.value)}
                        className="input-apple pl-10 pr-28"
                        placeholder="seu@email.com"
                        disabled={showEmailCodeInput}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {localEmail === user?.email ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                            <CheckCircle size={12} /> Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider animate-pulse">
                            <AlertTriangle size={12} /> Não Salvo
                          </span>
                        )}
                      </div>
                    </div>
                    {localEmail !== user?.email && !showEmailCodeInput && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                        Clique em "Salvar Alterações" para iniciar a verificação deste novo e-mail.
                      </p>
                    )}
                  </div>

                  {showEmailCodeInput && (
                    <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-2xl mt-6 animate-slide-up relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#007AFF]"></div>
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 hidden sm:flex">
                          <Mail size={20} className="text-[#007AFF] dark:text-blue-400" />
                        </div>
                        <div className="flex-1 w-full">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                            Verifique seu novo e-mail
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Enviamos um código de segurança para <strong className="text-gray-900 dark:text-white">{localEmail}</strong>.
                            Por favor, insira o código abaixo para confirmar a titularidade.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              placeholder="Ex: A1B2C3D4"
                              value={emailCode}
                              onChange={(e) => setEmailCode(e.target.value.toUpperCase())}
                              className="input-apple flex-1 uppercase tracking-[0.2em] font-mono text-center sm:text-left text-lg py-2.5"
                              maxLength={8}
                              autoComplete="one-time-code"
                              name="email-verification-code"
                              autoCorrect="off"
                              spellCheck={false}
                            />
                            <button
                              onClick={handleConfirmEmailChange}
                              disabled={isEmailLoading}
                              className="btn-apple-primary px-8 py-2.5 whitespace-nowrap flex justify-center items-center"
                            >
                              {isEmailLoading ? <><Loader2 size={18} className="animate-spin mr-2" /> Verificando</> : 'Confirmar Código'}
                            </button>
                          </div>
                          {emailCodeError && (
                            <div className="mt-3 text-sm text-red-500 flex items-center gap-1.5 font-medium animate-fade-in">
                              <AlertTriangle size={14} /> {emailCodeError}
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setShowEmailCodeInput(false)
                              setLocalEmail(user?.email || '')
                              setEmailCodeError('')
                              setEmailCode('')
                            }}
                            className="text-sm text-[#007AFF] dark:text-blue-400 mt-4 font-semibold hover:underline"
                          >
                            Cancelar e manter e-mail atual
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="label-uppercase mb-2 block">Nível de Acesso</label>
                    <div className="relative">
                      <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value="Administrador Principal"
                        disabled
                        className="input-apple pl-10 opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </div>
                {!showEmailCodeInput && (
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button onClick={handleSaveProfile} disabled={isEmailLoading} className="btn-apple-primary">
                      {isEmailLoading ? <><Loader2 size={16} className="animate-spin" /> Processando...</> : profileSaved ? <><Check size={16} /> Salvo!</> : <><Save size={16} /> Salvar Alterações</>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Segurança ── */}
            {activeSection === 'seguranca' && (
              <div className="apple-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Lock size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Segurança da Conta</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Atualize suas credenciais de acesso.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {!isForgotPwdMode ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="label-uppercase block">Senha Atual</label>
                        <button onClick={handleRequestPwdReset} disabled={isPwdLoading} className="text-xs font-bold text-[#007AFF] dark:text-blue-400 hover:underline">
                          {isPwdLoading ? 'Aguarde...' : 'Esqueci a senha atual'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showCurrentPwd ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="input-apple pl-10 pr-10"
                          placeholder="••••••••"
                          disabled={isPwdLoading}
                          autoComplete="current-password"
                        />
                        <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-2xl animate-slide-up relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#007AFF]"></div>
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 hidden sm:flex">
                          <Shield size={20} className="text-[#007AFF] dark:text-blue-400" />
                        </div>
                        <div className="flex-1 w-full">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Recuperação Autorizada</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Enviamos um código para <strong className="text-gray-900 dark:text-white">{user?.email}</strong>. Digite-o abaixo e crie sua nova senha.
                          </p>
                          <input
                            type="text"
                            placeholder="EX: A1B2C3D4"
                            value={pwdResetCode}
                            onChange={(e) => setPwdResetCode(e.target.value.toUpperCase())}
                            className="input-apple uppercase tracking-[0.2em] font-mono text-center text-lg py-2.5 mb-2 w-full sm:max-w-[250px]"
                            maxLength={8}
                            disabled={isPwdLoading}
                            autoComplete="one-time-code"
                            name="password-reset-code"
                            autoCorrect="off"
                            spellCheck={false}
                          />
                          <button onClick={() => { setIsForgotPwdMode(false); setPwdError(''); setPwdResetCode('') }} className="block text-sm text-[#007AFF] dark:text-blue-400 mt-2 font-semibold hover:underline">
                            Lembrei minha senha atual
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div>
                      <label className="label-uppercase mb-2 block">Nova Senha</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-apple pl-10 pr-10"
                          placeholder="••••••••"
                          disabled={isPwdLoading}
                          autoComplete="new-password"
                        />
                        <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label-uppercase mb-2 block">Confirmar Nova Senha</label>
                      <div className="relative">
                        <CheckCircle size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${newPassword && newPassword === confirmPassword ? 'text-green-500' : 'text-gray-400'}`} />
                        <input
                          type={showConfirmPwd ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input-apple pl-10 pr-10"
                          placeholder="••••••••"
                          disabled={isPwdLoading}
                          autoComplete="new-password"
                        />
                        <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {pwdError && (
                  <div className="mt-5 text-sm text-red-500 flex items-center gap-1.5 font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-800/30 animate-fade-in">
                    <AlertTriangle size={16} /> {pwdError}
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Shield size={14} />
                    Criptografia PBKDF2 aplicada
                  </div>
                  <button onClick={handleSavePassword} disabled={isPwdLoading || pwdSaved} className="btn-apple-primary px-8 py-2.5">
                    {isPwdLoading ? <><Loader2 size={16} className="animate-spin mr-2" /> Processando...</> : pwdSaved ? <><Check size={16} className="mr-2" /> Salvo!</> : <><Save size={16} className="mr-2" /> Atualizar Senha</>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Tabelas Auxiliares ── */}
            {activeSection === 'tabelas' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Personalize as opções disponíveis nos formulários do sistema. Todas as alterações são salvas automaticamente.
                </p>
                {sectionConfigs.map((cfg) => (
                  <AccordionItem key={cfg.listName} {...cfg} />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}