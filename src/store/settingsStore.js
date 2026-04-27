import { create } from 'zustand'
import api from '../services/api'

// Valores Padrão (Fallback)
const defaultSettings = {
  churchName: 'Igreja Evangélica Central',
  adminName: 'Maestro Ricardo',
  meetingTypes: [
    { id: 1, value: 'culto_dominical_matutino', label: 'Culto Dominical Matutino', category: 'normal' },
    { id: 2, value: 'culto_dominical_vespertino', label: 'Culto Dominical Vespertino', category: 'normal' },
    { id: 3, value: 'culto_dominical_noturno', label: 'Culto Dominical Noturno', category: 'normal' },
    { id: 4, value: 'reuniao_oracao', label: 'Reunião de Oração', category: 'oracao' },
    { id: 5, value: 'reuniao_especial', label: 'Reunião Especial', category: 'especial' },
    { id: 6, value: 'culto_santa_ceia', label: 'Culto de Santa Ceia', category: 'especial' },
  ],
  hymnSections: [
    { id: 1, value: 'hinario', label: 'Hinário' },
    { id: 2, value: 'coral', label: 'Coral' },
    { id: 3, value: 'orquestra', label: 'Orquestra' },
    { id: 4, value: 'especial', label: 'Especial' },
  ],
  attendanceContexts: [
    { id: 1, value: 'Ensaio Geral', label: 'Ensaio Geral' },
    { id: 2, value: 'Culto de Domingo', label: 'Culto de Domingo' },
    { id: 3, value: 'Culto de Ensino', label: 'Culto de Ensino' },
    { id: 4, value: 'Apresentação Especial', label: 'Apresentação Especial' },
  ],
  statuses: [
    { id: 1, value: 'Ativo', label: 'Ativo' },
    { id: 2, value: 'Licença', label: 'Em Licença' },
    { id: 3, value: 'Desativado', label: 'Desativado' },
  ],
  voices: [
    { id: 1, value: 'Soprano', label: 'Soprano' },
    { id: 2, value: 'Contralto', label: 'Contralto' },
    { id: 3, value: 'Tenor', label: 'Tenor' },
    { id: 4, value: 'Baixo', label: 'Baixo' },
  ],
  instruments: [
    { id: 5, value: 'Violino I', label: 'Violino I' },
    { id: 6, value: 'Violino II', label: 'Violino II' },
    { id: 7, value: 'Viola', label: 'Viola' },
    { id: 8, value: 'Cello', label: 'Cello' },
    { id: 9, value: 'Contrabaixo', label: 'Contrabaixo' },
    { id: 10, value: 'Flauta', label: 'Flauta' },
    { id: 11, value: 'Clarinete', label: 'Clarinete' },
    { id: 12, value: 'Oboé', label: 'Oboé' },
    { id: 13, value: 'Trompete', label: 'Trompete' },
    { id: 14, value: 'Trombone', label: 'Trombone' },
    { id: 15, value: 'Trompa', label: 'Trompa' },
    { id: 16, value: 'Tímpano', label: 'Tímpano' },
    { id: 17, value: 'Piano', label: 'Piano' },
    { id: 18, value: 'Órgão', label: 'Órgão' },
  ],
  positions: [
    { id: 1, value: 'maestro', label: 'Maestro' },
    { id: 2, value: 'admin', label: 'Admin' },
    { id: 3, value: 'regente', label: 'Regente' },
    { id: 4, value: 'solista', label: 'Solista' },
    { id: 5, value: 'instrumentista', label: 'Instrumentista' },
  ],
  conductors: [
    { id: 1, value: 'Maestro Ricardo', label: 'Maestro Ricardo' },
    { id: 2, value: 'Dir. Ana Paula', label: 'Dir. Ana Paula' },
  ]
}

const useSettingsStore = create((set, get) => ({
  ...defaultSettings,
  isLoaded: false,

  // Carregar do Banco de Dados
  fetchSettings: async () => {
    try {
      const { data } = await api.get('/api/config/global_settings')
      const parsed = JSON.parse(data.valor_json || '{}')
      if (Object.keys(parsed).length > 0) {
        set({ ...defaultSettings, ...parsed, isLoaded: true }) // Mescla com defaults caso o banco seja antigo
      } else {
        set({ isLoaded: true })
        get().saveToDatabase() // Salva o padrão no banco
      }
    } catch (error) {
      if (error.response?.status === 404) {
        set({ isLoaded: true })
        get().saveToDatabase() // Primeira execução
      } else {
        console.error("Erro ao buscar configurações", error)
      }
    }
  },

  // Salvar estado atual no Banco de Dados
  saveToDatabase: async () => {
    try {
      const state = get()
      const payload = {
        churchName: state.churchName,
        adminName: state.adminName,
        meetingTypes: state.meetingTypes,
        attendanceContexts: state.attendanceContexts,
        statuses: state.statuses,
        hymnSections: state.hymnSections,
        voices: state.voices,
        instruments: state.instruments,
        positions: state.positions,
        conductors: state.conductors
      }
      await api.put('/api/config/global_settings', { valor: payload })
    } catch (error) {
      console.error("Erro ao persistir configurações", error)
    }
  },

  // Adicionar item
  addItem: (listName, item) => {
    const { [listName]: list } = get()
    const maxId = list.length > 0 ? Math.max(...list.map(i => i.id)) : 0
    const newItem = { ...item, id: maxId + 1 }
    set({ [listName]: [...list, newItem] })
    get().saveToDatabase()
    return newItem
  },

  // Atualizar item
  updateItem: (listName, id, updates) => {
    set(state => ({
      [listName]: state[listName].map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
    get().saveToDatabase()
  },

  // Remover item
  removeItem: (listName, id) => {
    set(state => ({
      [listName]: state[listName].filter(item => item.id !== id),
    }))
    get().saveToDatabase()
  },

  // Atualizar campo simples (churchName, adminName, etc.)
  updateField: (key, value) => {
    set({ [key]: value })
    get().saveToDatabase()
  },
}))

export default useSettingsStore
