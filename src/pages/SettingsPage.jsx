import React, { useState } from 'react'
import { Plus, Trash2, Check, User, Lock, Eye, EyeOff, Save, Shield, ChevronDown, Music, Users, Calendar, Award, Edit2, X } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import useAuthStore from '../store/authStore'
import useSettingsStore from '../store/settingsStore'

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
  { listName: 'statuses', title: 'Situações de Membro', icon: Award },
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

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSaved, setPwdSaved] = useState(false)

  const handleSaveProfile = async () => {
    await updateProfile({ name: localName, email: localEmail })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleSavePassword = async () => {
    setPwdError('')
    if (!currentPassword) { setPwdError('Digite a senha atual'); return }
    if (currentPassword !== (passwordHash || 'choir2024')) { setPwdError('Senha atual incorreta'); return }
    if (newPassword.length < 6) { setPwdError('A nova senha deve ter pelo menos 6 caracteres'); return }
    if (newPassword !== confirmPassword) { setPwdError('As senhas não conferem'); return }
    await updateCredentials(localEmail, newPassword)
    setPwdSaved(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPwdSaved(false), 2000)
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
                    <label className="label-uppercase mb-2 block">Nome</label>
                    <input
                      type="text"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className="input-apple"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="label-uppercase mb-2 block">E-mail</label>
                    <input
                      type="email"
                      value={localEmail}
                      onChange={(e) => setLocalEmail(e.target.value)}
                      className="input-apple"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="label-uppercase mb-2 block">Cargo</label>
                    <input
                      type="text"
                      value="Administrador"
                      disabled
                      className="input-apple opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button onClick={handleSaveProfile} className="btn-apple-primary">
                    {profileSaved ? <><Check size={16} /> Salvo!</> : <><Save size={16} /> Salvar Alterações</>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Segurança ── */}
            {activeSection === 'seguranca' && (
              <div className="apple-card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Trocar Senha</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Senha Atual', val: currentPassword, set: setCurrentPassword, show: showCurrentPwd, toggle: () => setShowCurrentPwd(!showCurrentPwd) },
                    { label: 'Nova Senha', val: newPassword, set: setNewPassword, show: showNewPwd, toggle: () => setShowNewPwd(!showNewPwd) },
                    { label: 'Confirmar Nova Senha', val: confirmPassword, set: setConfirmPassword, show: showConfirmPwd, toggle: () => setShowConfirmPwd(!showConfirmPwd) },
                  ].map(({ label, val, set, show, toggle }) => (
                    <div key={label}>
                      <label className="label-uppercase mb-2 block">{label}</label>
                      <div className="relative">
                        <input
                          type={show ? 'text' : 'password'}
                          value={val}
                          onChange={(e) => set(e.target.value)}
                          className="input-apple pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={toggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pwdError && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-800/30">
                    {pwdError}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Shield size={14} />
                    Dados armazenados com segurança
                  </div>
                  <button onClick={handleSavePassword} disabled={pwdSaved} className="btn-apple-primary">
                    {pwdSaved ? <><Check size={16} /> Salvo!</> : <><Save size={16} /> Atualizar Senha</>}
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