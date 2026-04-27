import React, { useState } from 'react'
import {
  Settings, Plus, Pencil, Trash2, X, Check, Music, Users, Calendar, Award,
  ChevronRight, ChevronDown, User, Lock, Eye, EyeOff, Save, Shield,
  Activity, Mic2, BookOpen, ClipboardCheck, ArrowRight
} from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import useSettingsStore from '../store/settingsStore'
import useAuthStore from '../store/authStore'

/* ========== Categorias para Tipos de Reunião ========== */
const categoryOptions = [
  { value: 'normal', label: 'Reunião Normal' },
  { value: 'oracao', label: 'Reunião de Oração' },
  { value: 'especial', label: 'Reunião Especial' },
]

/* ========== Configs das seções CRUD ========== */
const sectionConfigs = [
  {
    key: 'meetingTypes',
    title: 'Tipos de Reunião',
    subtitle: 'Configure os tipos de cultos e reuniões disponíveis',
    icon: Calendar,
    color: 'bg-blue-600',
    bgLight: 'bg-blue-50',
    hasCategory: true,
  },
  {
    key: 'attendanceContexts',
    title: 'Contextos de Chamada',
    subtitle: 'Finalidade e motivo da lista de presenças',
    icon: ClipboardCheck,
    color: 'bg-cyan-600',
    bgLight: 'bg-cyan-50',
    hasCategory: false,
  },
  {
    key: 'statuses',
    title: 'Situações Atuais',
    subtitle: 'Status de vínculo do membro (Ativo, Licença, etc)',
    icon: Activity,
    color: 'bg-emerald-600',
    bgLight: 'bg-emerald-50',
    hasCategory: false,
  },
  {
    key: 'voices',
    title: 'Vozes do Coral',
    subtitle: 'Classificações vocais do departamento de canto',
    icon: Mic2,
    color: 'bg-pink-600',
    bgLight: 'bg-pink-50',
    hasCategory: false,
  },
  {
    key: 'instruments',
    title: 'Instrumentos',
    subtitle: 'Naipes e instrumentos utilizados pela orquestra',
    icon: Music,
    color: 'bg-indigo-600',
    bgLight: 'bg-indigo-50',
    hasCategory: false,
  },
  {
    key: 'hymnSections',
    title: 'Seções de Hinos',
    subtitle: 'Classificações no acervo (Hinário, Coral, Orquestra)',
    icon: BookOpen,
    color: 'bg-teal-600',
    bgLight: 'bg-teal-50',
    hasCategory: false,
  },
  {
    key: 'positions',
    title: 'Cargos e Funções',
    subtitle: 'Cargos e funções disponíveis (Músico, Admin, Auxiliar)',
    icon: Award,
    color: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    hasCategory: false,
  },
  {
    key: 'conductors',
    title: 'Regentes Associados',
    subtitle: 'Mestres de música disponíveis para as apresentações',
    icon: Users,
    color: 'bg-purple-600',
    bgLight: 'bg-purple-50',
    hasCategory: false,
  },
]

/* ========== Componente CRUD reutilizável ========== */
function SettingsSection({ config }) {
  const items = useSettingsStore(s => s[config.key])
  const addItem = useSettingsStore(s => s.addItem)
  const updateItem = useSettingsStore(s => s.updateItem)
  const removeItem = useSettingsStore(s => s.removeItem)

  const [showAddForm, setShowAddForm] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ label: '', category: 'normal' })
  const [deleteModal, setDeleteModal] = useState(null)

  const handleAdd = () => {
    if (!form.label.trim()) return
    const newItem = {
      label: form.label.trim(),
      value: form.label.trim().toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    }
    if (config.hasCategory) newItem.category = form.category
    addItem(config.key, newItem)
    setForm({ label: '', category: 'normal' })
    setShowAddForm(false)
  }

  const handleUpdate = (id) => {
    if (!form.label.trim()) return
    const updates = {
      label: form.label.trim(),
      value: form.label.trim().toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    }
    if (config.hasCategory) updates.category = form.category
    updateItem(config.key, id, updates)
    setEditingId(null)
    setForm({ label: '', category: 'normal' })
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({ label: item.label, category: item.category || 'normal' })
    setShowAddForm(false)
  }

  const handleDelete = () => {
    if (deleteModal) {
      removeItem(config.key, deleteModal)
      setDeleteModal(null)
    }
  }

  const getCategoryBadge = (category) => {
    const map = {
      normal: { label: 'Normal', variant: 'neutral' },
      oracao: { label: 'Oração', variant: 'primary' },
      especial: { label: 'Especial', variant: 'warning' },
    }
    const info = map[category] || map.normal
    return <Badge variant={info.variant}>{info.label}</Badge>
  }

  const Icon = config.icon

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div
        className="px-6 py-5 cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-white shadow-sm ${config.color}`}>
            <Icon size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{config.title}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{config.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
          <span className="hidden sm:inline-flex px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
          <button
            onClick={() => {
              setIsExpanded(true)
              setShowAddForm(true)
              setEditingId(null)
              setForm({ label: '', category: 'normal' })
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-500/20 dark:text-slate-300 dark:hover:text-blue-400 rounded-full text-sm font-bold transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronDown size={20} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 animate-slide-down">

          {showAddForm && (
            <div className="m-6 mb-2 p-5 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                  <Input
                    label="Nome da Opção"
                    placeholder="Digite o nome..."
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  />
                </div>
                {config.hasCategory && (
                  <div className="w-full sm:w-56">
                    <Select
                      label="Classificação"
                      options={categoryOptions}
                      value={form.category}
                      onChange={v => setForm(f => ({ ...f, category: v }))}
                    />
                  </div>
                )}
                <div className="flex gap-2 pt-2 sm:pt-0">
                  <Button size="md" icon={Check} onClick={handleAdd}>
                    Salvar
                  </Button>
                  <Button size="md" variant="ghost" icon={X} onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 pt-4">
            {items.length === 0 && !showAddForm && (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-700 border-dashed">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Nenhum item configurado</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Clique em "Adicionar" para criar a primeira opção.
                </p>
              </div>
            )}

            {items.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {editingId === item.id ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 animate-fade-in py-1">
                          <div className="flex-1">
                            <Input
                              value={form.label}
                              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                              placeholder="Nome..."
                            />
                          </div>
                          {config.hasCategory && (
                            <div className="w-full sm:w-56">
                              <Select
                                options={categoryOptions}
                                value={form.category}
                                onChange={v => setForm(f => ({ ...f, category: v }))}
                              />
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(item.id)}
                              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                            >
                              <Check size={18} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setForm({ label: '', category: 'normal' })
                              }}
                              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              <X size={18} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <span className="text-slate-400 dark:text-slate-500 font-medium text-sm w-5 text-right">{idx + 1}.</span>
                            <span className="text-[15px] font-semibold text-slate-900 dark:text-white tracking-tight">{item.label}</span>
                            {config.hasCategory && item.category && getCategoryBadge(item.category)}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteModal(item.id)}
                              className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                              title="Remover"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal open={!!deleteModal} onOpenChange={() => setDeleteModal(null)} title="Remover Item">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Tem certeza que deseja remover esta opção? Ações vinculadas a ela no passado poderão ficar
          sem referência visual no sistema. Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>
            Cancelar
          </Button>
          <Button variant="danger" icon={Trash2} onClick={handleDelete}>
            Confirmar Exclusão
          </Button>
        </div>
      </Modal>
    </div>
  )
}



function CredentialsSection() {
  const user = useAuthStore(s => s.user)
  const updateProfile = useAuthStore(s => s.updateProfile)
  const updateCredentials = useAuthStore(s => s.updateCredentials)

  const [localName, setLocalName] = useState(user?.name || '')
  const [localEmail, setLocalEmail] = useState(user?.email || '')
  const safeRole = user?.role === 'DIRECTOR' || user?.role === 'Director' ? 'Admin' : (user?.role || 'Super Admin')
  const [localRole, setLocalRole] = useState(safeRole)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [pwdSaved, setPwdSaved] = useState(false)
  const [pwdError, setPwdError] = useState('')

  const handleSaveProfile = () => {
    updateProfile({ name: localName, email: localEmail, role: localRole })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleSavePassword = () => {
    setPwdError('')
    if (!currentPassword) {
      setPwdError('Digite a senha atual')
      return
    }
    if (currentPassword !== 'choir2024') {
      setPwdError('Senha atual incorreta')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setPwdError('Mínimo de 6 caracteres na nova senha')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdError('A confirmação não confere com a nova senha')
      return
    }
    updateCredentials(localEmail, newPassword)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPwdSaved(true)
    setTimeout(() => setPwdSaved(false), 2000)
  }

  const profileChanged = localName !== (user?.name || '') || localEmail !== (user?.email || '') || localRole !== safeRole

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <User size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Perfil Administrativo</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Identificação do usuário da sessão</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Nome de Exibição"
              value={localName}
              onChange={e => setLocalName(e.target.value)}
            />
            <Input
              label="E-mail Associado"
              type="email"
              value={localEmail}
              onChange={e => setLocalEmail(e.target.value)}
            />
            <Input
              label="Cargo / Permissão"
              value={localRole}
              onChange={e => setLocalRole(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Badge className="badge-primary">
                {user?.role === 'DIRECTOR' || user?.role === 'Director' ? 'Admin' : (user?.role || 'Super Admin')}
              </Badge>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nível de Permissão</span>
            </div>
            <Button
              size="md"
              icon={profileSaved ? Check : Save}
              onClick={handleSaveProfile}
              disabled={!profileChanged && !profileSaved}
              variant={profileSaved ? 'neutral' : 'primary'}
            >
              {profileSaved ? 'Atualizado!' : 'Atualizar Perfil'}
            </Button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-red-500 text-white flex items-center justify-center shadow-sm">
              <Lock size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Segurança e Senhas</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Renovação de credenciais de acesso local
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-6">
          <div className="relative">
            <Input
              label="Senha Vigente"
              type={showCurrentPwd ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPwd(!showCurrentPwd)}
              className="absolute right-3 top-10 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 rounded-[20px] p-6 mt-4">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Criar nova senha</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input
                  label="Nova Senha Definida"
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-10 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Input
                  label="Confirmar Nova Senha"
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-10 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {pwdError && (
            <div className="flex items-center gap-3 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 animate-fade-in">
              <Shield size={18} />
              {pwdError}
            </div>
          )}

          {newPassword && (
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${newPassword.length >= 10
                    ? 'bg-emerald-500 w-full'
                    : newPassword.length >= 6
                      ? 'bg-amber-500 w-2/3'
                      : 'bg-red-500 w-1/3'
                    }`}
                />
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${newPassword.length >= 10
                  ? 'text-emerald-600'
                  : newPassword.length >= 6
                    ? 'text-amber-600'
                    : 'text-red-600'
                  }`}
              >
                {newPassword.length >= 10 ? 'Forte' : newPassword.length >= 6 ? 'Média' : 'Fraca'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Lock size={14} />
              Criptografia PBKDF2 aplicada automaticamente
            </p>
            <Button
              size="md"
              icon={pwdSaved ? Check : Lock}
              onClick={handleSavePassword}
              variant={pwdSaved ? 'neutral' : 'danger'}
            >
              {pwdSaved ? 'Senha Alterada' : 'Confirmar Mudança'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const tabs = [
  { id: 'tipos', label: 'Tabelas Auxiliares', icon: Settings },
  { id: 'acesso', label: 'Autenticação', icon: Lock },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('tipos')
  const churchName = useSettingsStore(s => s.churchName)
  const adminName = useSettingsStore(s => s.adminName)

  const navItems = [
    { id: 'tipos', icon: Settings, label: 'Tabelas Auxiliares', color: 'emerald', action: 'Gerenciar' },
    { id: 'acesso', icon: Lock, label: 'Autenticação', color: 'purple', action: 'Security' },
  ]

  return (
    <div className="min-h-screen pb-12">
      <Topbar title="Gestão Igreja" />
      <div className="px-4 sm:px-8 max-w-7xl mx-auto mt-8">
        <PageHeader
          label="Painel de Controle"
          title="Configurações"
          subtitle="Ajuste parâmetros globais, tabelas de domínio e credenciais do administrador."
        />

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                group text-left bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 
                transition-all duration-300 border 
                ${activeTab === item.id 
                  ? item.color === 'blue' ? 'border-blue-300 dark:border-blue-600 shadow-lg' 
                  : item.color === 'emerald' ? 'border-emerald-300 dark:border-emerald-600 shadow-lg'
                  : 'border-purple-300 dark:border-purple-600 shadow-lg'
                  : 'border-slate-100 dark:border-slate-700'
                }
              `}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${
                item.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25' 
                : item.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25'
                : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/25'
              }`}>
                <item.icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {item.label}
              </h3>
              <span className={`inline-flex items-center gap-1.5 font-medium text-sm ${
                item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' 
                : item.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-purple-600 dark:text-purple-400'
              }`}>
                {item.action} <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-10 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2.5 px-6 py-3 text-sm font-bold transition-colors duration-200 whitespace-nowrap
                  ${isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-md" />
                )}
              </button>
            )
          })}
        </div>

        <div className="animate-fade-in">
          {activeTab === 'tipos' && (
            <div className="animate-fade-in space-y-6">
              {sectionConfigs.map(config => (
                <SettingsSection key={config.key} config={config} />
              ))}
            </div>
          )}

          {activeTab === 'acesso' && <CredentialsSection />}
        </div>
      </div>
    </div>
  )
}
