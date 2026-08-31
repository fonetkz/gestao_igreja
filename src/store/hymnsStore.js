import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

// Normalizar string removendo acentos para busca fuzzy
const normalizeStr = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const safeParseJson = (jsonStr, defaultValue = []) => {
  try {
    if (!jsonStr) return defaultValue
    const parsed = JSON.parse(jsonStr)
    return parsed
  } catch {
    return defaultValue
  }
}

const useHymnsStore = create(
  persist(
    (set, get) => ({
  hymns: [],
  programHistory: [],
  todayProgram: [],
  loading: false,

  fetchHymns: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/api/hinos')
      set({ hymns: data })
    } catch (error) {
      console.error('Erro ao buscar hinos', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchProgramHistory: async () => {
    try {
      const { data } = await api.get('/api/programacoes')
      const history = data.map(p => ({
        ...p,
        hinos_json: safeParseJson(p.hinos_json),
        layout_json: safeParseJson(p.layout_json, null)
      }))
      set({ programHistory: history })
    } catch (error) {
      console.error('Erro ao buscar histórico de programação', error)
    }
  },

  // Adicionar hino
  addHymn: async (hymn) => {
    try {
      const { data } = await api.post('/api/hinos', hymn)
      set((state) => ({ hymns: [...state.hymns, data] }))
      return data
    } catch (error) {
      console.error('Erro ao adicionar hino', error)
      throw error
    }
  },

  // Adicionar hino e já incluir na programação do dia
  addHymnToProgram: async (hymn) => {
    try {
      const newHymn = await get().addHymn(hymn)
      get().addToTodayProgram(newHymn.id)
      return newHymn
    } catch (error) {
      console.error('Erro ao adicionar hino à programação', error)
      throw error
    }
  },

  // Atualizar hino
  updateHymn: async (id, updates) => {
    try {
      const { data } = await api.patch(`/api/hinos/${id}`, updates)
      set((state) => ({
        hymns: state.hymns.map(h => h.id === id ? data : h),
      }))
    } catch (error) {
      console.error('Erro ao atualizar hino', error)
      throw error
    }
  },

  // Remover hino
  removeHymn: async (id) => {
    try {
      await api.delete(`/api/hinos/${id}`)
      set((state) => ({
        hymns: state.hymns.filter(h => h.id !== id),
      }))
    } catch (error) {
      console.error('Erro ao remover hino', error)
      throw error
    }
  },

  // Buscar hinos por termo
  searchHymns: (term) => {
    const { hymns } = get()
    if (!term) return hymns
    const lower = normalizeStr(term).toLowerCase()
    return hymns.filter(h =>
      normalizeStr(h.titulo || '').toLowerCase().includes(lower) ||
      (h.numero || '').includes(term) ||
      normalizeStr(h.tonalidade || '').toLowerCase().includes(lower)
    )
  },

  // Verificar se hino foi usado recentemente (< 30 dias)
  isRecentlyUsed: (hymnId) => {
    const { hymns } = get()
    const hymn = hymns.find(h => h.id === hymnId)
    if (!hymn?.data_ultima_apresentacao) return false
    const daysDiff = Math.floor((new Date() - new Date(hymn.data_ultima_apresentacao)) / (1000 * 60 * 60 * 24))
    return daysDiff < 30
  },

  // Dias desde último uso
  daysSinceLastUsed: (hymnId) => {
    const { hymns } = get()
    const hymn = hymns.find(h => h.id === hymnId)
    if (!hymn?.data_ultima_apresentacao) return null
    return Math.floor((new Date() - new Date(hymn.data_ultima_apresentacao)) / (1000 * 60 * 60 * 24))
  },

  // Programação do dia
  addToTodayProgram: (hymnId) => {
    const { todayProgram } = get()
    if (todayProgram.some(item => (typeof item === 'object' ? item.id === hymnId : item === hymnId))) return
    set({ todayProgram: [...todayProgram, hymnId] })
  },

  setTodayProgram: (hymns) => {
    set({ todayProgram: hymns })
  },

  removeFromTodayProgram: (hymnId) => {
    set((state) => ({
      todayProgram: state.todayProgram.filter(item => {
        const id = typeof item === 'object' ? item.id : item;
        return id !== hymnId;
      }),
    }))
  },

  reorderTodayProgram: (newOrder) => {
    set({ todayProgram: newOrder })
  },

  // Gerar layout padrão a partir da ordem de hinos da programação
  buildDefaultLayout: (programToSave, data_culto, tipo_culto) => {
    const { hymns } = get()
    const hymnsById = {}
    hymns.forEach(h => { hymnsById[h.id] = h })

    const sectionHymns = programToSave.map(item => {
      const id = typeof item === 'object' ? item.id : item
      const regente = typeof item === 'object' ? item.regente || '' : ''
      const rawSolista = typeof item === 'object' ? item.solista : ''
      const soloist = Array.isArray(rawSolista) ? rawSolista.join(', ') : (rawSolista || '')
      const hymn = hymnsById[id]
      if (!hymn) return null
      return {
        ...hymn, regente, soloist,
        showRegente: true, showNumber: true, showType: true, showSoloist: true
      }
    }).filter(Boolean)

    return {
      headerConfig: {
        imageUrl: '',
        title: 'Programação Musical',
        subtitle: tipo_culto || '',
        date: data_culto || '',
        location: '',
        logoHeight: 48,
      },
      sections: [
        { id: 'sec-abertura', name: 'Abertura', hymns: sectionHymns, observations: '' }
      ]
    }
  },

  // Buscar layout salvo no localStorage do print page
  getSavedLayoutFromPrint: (programToSave) => {
    try {
      const cache = JSON.parse(localStorage.getItem('hymnprint_last_layout') || '{}')
      const key = programToSave.map(item => {
        const id = typeof item === 'object' ? item.id : item
        const reg = typeof item === 'object' ? item.regente || '' : ''
        const rawSol = typeof item === 'object' ? item.solista : ''
        const sol = Array.isArray(rawSol) ? rawSol.join(', ') : (rawSol || '')
        return `${id}-${reg}-${sol}`
      }).join('|')
      const saved = cache[key]
      if (saved && saved.sections) {
        return { headerConfig: saved.headerConfig, sections: saved.sections }
      }
      return null
    } catch { return null }
  },

  confirmTodayProgram: async (data_culto, tipo_culto, responsavel, customProgram) => {
    try {
      const { todayProgram } = get()
      const programToSave = customProgram || todayProgram

      const savedLayout = get().getSavedLayoutFromPrint(programToSave)
      const layout = savedLayout || get().buildDefaultLayout(programToSave, data_culto, tipo_culto)

      const payload = {
        data: data_culto,
        tipo_culto,
        responsavel,
        status: 'confirmado',
        hinos_json: JSON.stringify(programToSave),
        layout_json: JSON.stringify(layout)
      }
      const { data } = await api.post('/api/programacoes', payload)

      const newEntry = {
        ...data,
        hinos_json: safeParseJson(data.hinos_json),
        layout_json: safeParseJson(data.layout_json, null)
      }

      set((state) => ({
        programHistory: [newEntry, ...state.programHistory],
        todayProgram: [],
      }))

      for (const item of programToSave) {
        const hymnId = typeof item === 'object' ? item.id : item;
        const hymn = get().getHymnById(hymnId)
        if (!hymn?.data_ultima_apresentacao || data_culto > hymn.data_ultima_apresentacao) {
          await get().updateHymn(hymnId, { data_ultima_apresentacao: data_culto })
        }
      }
      return data
    } catch (error) {
      console.error('Erro ao confirmar programação', error)
      throw error
    }
  },

  // Atualizar programação
  updateProgramacao: async (id, data_culto, tipo_culto, responsavel, customProgram) => {
    try {
      const { todayProgram } = get()
      const programToSave = customProgram || todayProgram

      const savedLayout = get().getSavedLayoutFromPrint(programToSave)
      const layout = savedLayout || get().buildDefaultLayout(programToSave, data_culto, tipo_culto)

      const payload = {
        data: data_culto,
        tipo_culto,
        responsavel,
        status: 'confirmado',
        hinos_json: JSON.stringify(programToSave),
        layout_json: JSON.stringify(layout)
      }
      const { data } = await api.patch(`/api/programacoes/${id}`, payload)

      const updatedEntry = {
        ...data,
        hinos_json: safeParseJson(data.hinos_json),
        layout_json: safeParseJson(data.layout_json, null)
      }

      set((state) => ({
        programHistory: state.programHistory.map(p => p.id === id ? updatedEntry : p),
        todayProgram: [],
      }))

      // Recarrega os hinos para atualizar as datas de última apresentação caso as datas mudem
      await get().fetchHymns()
    } catch (error) {
      console.error('Erro ao atualizar programação', error)
      throw error
    }
  },

  // Remover programação
  removeProgram: async (id) => {
    try {
      await api.delete(`/api/programacoes/${id}`)
      set((state) => ({
        programHistory: state.programHistory.filter(p => p.id !== id),
      }))

      // Recarrega os hinos para obter as datas de última apresentação recalculadas
      await get().fetchHymns()
    } catch (error) {
      console.error('Erro ao remover programação', error)
      throw error
    }
  },

  // Apelido para manter a compatibilidade com o ProgrammingPage.jsx
  deleteProgramacao: async (id) => get().removeProgram(id),

  // Salvar layout de impressão de uma programação
  saveProgramLayout: async (progId, layout) => {
    try {
      const { data } = await api.patch(`/api/programacoes/${progId}`, {
        layout_json: JSON.stringify(layout)
      })
      set((state) => ({
        programHistory: state.programHistory.map(p =>
          p.id === progId
            ? { ...p, layout_json: layout }
            : p
        )
      }))
      return true
    } catch (error) {
      console.error('Erro ao salvar layout de impressão', error)
      return false
    }
  },

  // Obter hino por ID
  getHymnById: (id) => {
    const { hymns } = get()
    return hymns.find(h => h.id === id)
  },

  // Atualizar regente/solista de um item na programação do dia
  updateTodayProgramItem: (id, updates) => {
    set(state => ({
      todayProgram: state.todayProgram.map(item => {
        const itemId = typeof item === 'object' ? item.id : item
        if (itemId !== id) return item
        const existing = typeof item === 'object' ? item : { id: item }
        return { ...existing, ...updates }
      })
    }))
  },

  // Estatísticas
  getTotalHymns: () => get().hymns.length,

  getUniqueKeys: () => {
    const { hymns } = get()
    return new Set(hymns.filter(h => h.tonalidade).map(h => h.tonalidade)).size
  },
    }),
    {
      name: 'gestao-igreja-today-program',
      partialize: (state) => ({ todayProgram: state.todayProgram }),
    }
  )
)

export default useHymnsStore
