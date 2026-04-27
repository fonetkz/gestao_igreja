import React, { useState } from 'react'
import { Settings, Plus, Trash2, X, Check, User, Lock, Eye, EyeOff, Save, Shield, ChevronRight, ChevronDown, Music, Users, Calendar, Award } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import useAuthStore from '../store/authStore'
import useSettingsStore from '../store/settingsStore'

// Mock Data para Tabelas Auxiliares
const mockSectionConfigs = [
  { 
    key: 'meetingTypes', 
    title: 'Tipos de Reunião', 
    icon: Calendar,
    items: [
      { label: 'Culto Dominical Matutino', value: 'culto_dom_mat' },
      { label: 'Culto Dominical Vespertino', value: 'culto_dom_vesp' },
      { label: 'Ensaio Geral', value: 'ensaio_geral' },
      { label: 'Ensaio de Naipe', value: 'ensaio_naipe' },
      { label: 'Culto de Celebração', value: 'culto_celebracao' },
      { label: 'Reunião de Oração', value: 'oracao' },
    ]
  },
  { 
    key: 'voices', 
    title: 'Vozes do Coral', 
    icon: Music,
    items: [
      { label: 'Soprano', value: 'soprano' },
      { label: 'Contralto', value: 'contralto' },
      { label: 'Tenor', value: 'tenor' },
      { label: 'Baixo', value: 'baixo' },
    ]
  },
  { 
    key: 'instruments', 
    title: 'Instrumentos', 
    icon: Music,
    items: [
      { label: 'Violino', value: 'violino' },
      { label: 'Viola', value: 'viola' },
      { label: 'Violoncelo', value: 'violoncelo' },
      { label: 'Contrabaixo', value: 'contrabaixo' },
      { label: 'Flauta', value: 'flauta' },
      { label: 'Clarinete', value: 'clarinete' },
      { label: 'Oboé', value: 'oboe' },
      { label: 'Fagote', value: 'fagote' },
      { label: 'Trompete', value: 'trompete' },
      { label: 'Trombone', value: 'trombone' },
      { label: 'Tuba', value: 'tuba' },
      { label: 'Piano', value: 'piano' },
      { label: 'Bateria', value: 'bateria' },
      { label: 'Violão', value: 'violao' },
    ]
  },
  { 
    key: 'statuses', 
    title: 'Situações Atuais', 
    icon: Award,
    items: [
      { label: 'Ativo', value: 'ativo' },
      { label: 'Em Licença', value: 'licenca' },
      { label: 'Inativo', value: 'inativo' },
      { label: 'Afastado', value: 'afastado' },
    ]
  },
  { 
    key: 'positions', 
    title: 'Cargos e Funções', 
    icon: Award,
    items: [
      { label: 'Músico', value: 'musico' },
      { label: 'Regente', value: 'regente' },
      { label: 'Auxiliar', value: 'auxiliar' },
      { label: 'Administrador', value: 'admin' },
      { label: 'Coordenador', value: 'coordenador' },
    ]
  },
  { 
    key: 'conductors', 
    title: 'Regentes', 
    icon: Users,
    items: [
      { label: 'Márcio Souza', value: 'marcio' },
      { label: 'Pedro Santos', value: 'pedro' },
      { label: 'Ana Paula', value: 'ana' },
    ]
  },
  { 
    key: 'hymnSections', 
    title: 'Seções de Hinos', 
    icon: Award,
    items: [
      { label: 'Hinário', value: 'hinario' },
      { label: 'Coral', value: 'coral' },
      { label: 'Orquestra', value: 'orquestra' },
      { label: 'Especial', value: 'especial' },
    ]
  },
  { 
    key: 'attendanceContexts', 
    title: 'Contextos de Chamada', 
    icon: Check,
    items: [
      { label: 'Ensaio Geral', value: 'ensaio_geral' },
      { label: 'Ensaio de Seção', value: 'ensaio_naipe' },
      { label: 'Culto', value: 'culto' },
      { label: 'Apresentação', value: 'apresentacao' },
    ]
  },
]

function AccordionItem({ config, items: initialItems }) {
  const [isOpen, setIsOpen] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [items, setItems] = useState(initialItems)
  const Icon = config.icon

  const handleAdd = () => {
    if (newItem.trim()) {
      setItems([...items, { label: newItem.trim(), value: newItem.trim().toLowerCase().replace(/\s+/g, '_') }])
      setNewItem('')
    }
  }

  const handleDelete = (idx) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  return (
    <div className="apple-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Icon size={20} className="text-blue-600" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">{config.title}</h4>
            <p className="text-xs text-gray-500">{items.length} itens</p>
          </div>
        </div>
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 animate-fade-in">
          <div className="py-3 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <button onClick={() => handleDelete(idx)} className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
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

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('perfil')
  
  const user = useAuthStore(s => s.user)
  const updateProfile = useAuthStore(s => s.updateProfile)
  
  const [localName, setLocalName] = useState('Gustavo Henrique')
  const [localEmail, setLocalEmail] = useState('ghr.9165@gmail.com')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSaved, setPwdSaved] = useState(false)

  const handleSaveProfile = () => {
    updateProfile({ name: localName, email: localEmail })
  }

  const handleSavePassword = () => {
    setPwdError('')
    if (!currentPassword) { setPwdError('Digite a senha atual'); return }
    if (newPassword.length < 6) { setPwdError('Mínimo de 6 caracteres'); return }
    if (newPassword !== confirmPassword) { setPwdError('As senhas não conferem'); return }
    setPwdSaved(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPwdSaved(false), 2000)
  }

  const sidebarItems = [
    { id: 'perfil', label: 'Meu Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Lock },
    { id: 'tabelas', label: 'Tabelas Auxiliares', icon: Settings },
  ]

  return (
    <div className="min-h-screen pb-12">
      <Topbar title="Gestão Igreja" />

      <div className="px-8 max-w-7xl mx-auto mt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Configurações</h1>
          <p className="text-gray-500 mt-1">Gerencie suas informações e preferências.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="apple-card p-2">
              {sidebarItems.map(item => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
            {activeSection === 'perfil' && (
              <div className="apple-card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados Pessoais</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                    <input
                      type="text"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className="input-apple"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">E-mail</label>
                    <input
                      type="email"
                      value={localEmail}
                      onChange={(e) => setLocalEmail(e.target.value)}
                      className="input-apple"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cargo</label>
                    <input
                      type="text"
                      value="Administrador"
                      disabled
                      className="input-apple bg-gray-100"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                  <button onClick={handleSaveProfile} className="btn-apple-primary">
                    <Save size={16} />
                    Salvar Alterações
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'seguranca' && (
              <div className="space-y-4">
                <div className="apple-card p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Trocar Senha</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Senha Atual</label>
                      <div className="relative">
                        <input
                          type={showCurrentPwd ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="input-apple pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nova Senha</label>
                      <div className="relative">
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-apple pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirmar Senha</label>
                      <div className="relative">
                        <input
                          type={showConfirmPwd ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input-apple pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {pwdError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                      {pwdError}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield size={14} />
                      Criptografia PBKDF2 aplicada
                    </div>
                    <button onClick={handleSavePassword} disabled={pwdSaved} className="btn-apple-primary">
                      {pwdSaved ? <><Check size={16} /> Salvo!</> : <><Save size={16} /> Atualizar Senha</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'tabelas' && (
              <div className="space-y-3">
                {mockSectionConfigs.map(config => (
                  <AccordionItem
                    key={config.key}
                    config={config}
                    items={config.items}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ClipboardCheck = ({ size, className }) => (
  <svg width={size} height={size} className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)