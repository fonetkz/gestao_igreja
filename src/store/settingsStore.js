import { create } from 'zustand'
import api from '../services/api'

// Valores Padrão (Fallback)
const defaultSettings = {
  churchName: 'Igreja Apostólica',
  adminName: 'Elen Márcia',
  meetingTypes: [
    { id: 1, value: 'reuniao_normal', label: 'Reunião Normal', category: 'normal' },
    { id: 2, value: 'reuniao_especial', label: 'Reunião Especial', category: 'especial' },
    { id: 3, value: 'reuniao_oracao', label: 'Reunião de Oração', category: 'oracao' },
  ],
  hymnTypes: [
    { id: 1, value: 'gc', label: 'GC' },
    { id: 2, value: 'cs', label: 'CS' },
    { id: 3, value: 'oh', label: 'OH' },
    { id: 4, value: 'oc', label: 'OC' },
    { id: 5, value: 'sc', label: 'SC' },
    { id: 6, value: 'ocam', label: 'OCam' },
    { id: 7, value: 'hinario', label: 'Hinário' },
  ],
  hymnSections: [
    { id: 1, value: 'hinario', label: 'Hinário' },
    { id: 2, value: 'coral', label: 'Coral' },
    { id: 3, value: 'orquestra', label: 'Orquestra' },
    { id: 4, value: 'especial', label: 'Especial' },
  ],
  attendanceContexts: [
    { id: 1, value: 'Ensaio Geral', label: 'Ensaio Geral' },
    { id: 2, value: 'Ensaio Orquestra', label: 'Ensaio Orquestra' },
    { id: 3, value: 'Ensaio de Sexta', label: 'Ensaio de Sexta' },
  ],
  statuses: [
    { id: 1, value: 'Ativo', label: 'Ativo' },
    { id: 2, value: 'Licença', label: 'Licença' },
    { id: 3, value: 'Desativado', label: 'Inativo' },
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
    { id: 16, value: 'Sax Alto', label: 'Sax Alto' },
    { id: 17, value: 'Sax Tenor', label: 'Sax Tenor' },
    { id: 18, value: 'Sax Soprano', label: 'Sax Soprano' },
    { id: 19, value: 'Sax Reto', label: 'Sax Reto' },
    { id: 20, value: 'Fagote', label: 'Fagote' },
  ],
  positions: [
    { id: 1, value: 'regente_geral', label: 'Regente Geral' },
    { id: 2, value: 'regente_auxiliar', label: 'Regente Auxiliar' },
    { id: 3, value: 'corista', label: 'Corista' },
    { id: 4, value: 'musico', label: 'Músico' },
  ],
  conductors: [
    { id: 1, value: 'Elen Márcia', label: 'Elen Márcia' },
  ],
  printThemes: [
    {
      id: 1,
      name: 'Clássico (Padrão)',
      logoUrl: '',
      headerAlign: 'center',
      primaryColor: '#000000',
      showDate: true,
      showResponsible: true,
      showType: true,
      showConductor: true,
      compactMode: false
    }
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
        hymnTypes: state.hymnTypes,
        attendanceContexts: state.attendanceContexts,
        statuses: state.statuses,
        hymnSections: state.hymnSections,
        voices: state.voices,
        instruments: state.instruments,
        positions: state.positions,
        conductors: state.conductors,
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
