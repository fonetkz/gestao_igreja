import { create } from 'zustand'
import api from '../services/api'

const safeParseJson = (jsonStr, defaultValue = []) => {
  try {
    if (!jsonStr) return defaultValue
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? parsed : defaultValue
  } catch {
    return defaultValue
  }
}

const useHymnsStore = create((set, get) => ({
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
        hinos_json: safeParseJson(p.hinos_json)
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
    const lower = term.toLowerCase()
    return hymns.filter(h =>
      (h.titulo || '').toLowerCase().includes(lower) ||
      (h.numero || '').includes(term) ||
      (h.tonalidade || '').toLowerCase().includes(lower)
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
    if (todayProgram.includes(hymnId)) return
    set({ todayProgram: [...todayProgram, hymnId] })
  },

  setTodayProgram: (hinos) => {
    set({ todayProgram: hinos })
  },

  removeFromTodayProgram: (hymnId) => {
    set((state) => ({
      todayProgram: state.todayProgram.filter(id => id !== hymnId),
    }))
  },

  reorderTodayProgram: (newOrder) => {
    set({ todayProgram: newOrder })
  },

  updateProgramacao: async (progId, data_culto, tipo_culto, responsavel) => {
    try {
      const { todayProgram } = get()
      const payload = {
        data: data_culto,
        tipo_culto,
        responsavel,
        status: 'confirmado',
        hinos_json: JSON.stringify(todayProgram)
      }
      const { data } = await api.patch(`/api/programacoes/${progId}`, payload)

      const updatedEntry = {
        ...data,
        hinos_json: safeParseJson(data.hinos_json)
      }

      set((state) => ({
        programHistory: state.programHistory.map(p => p.id === progId ? updatedEntry : p),
        todayProgram: [],
      }))

      const { data: hymnsData } = await api.get('/api/hinos')
      set({ hymns: hymnsData.map(h => ({ ...h, hinos_json: safeParseJson(h.hinos_json) })) })
    } catch (err) {
      console.error('Erro ao atualizar programação:', err)
      throw err
    }
  },

  deleteProgramacao: async (progId) => {
    console.log('deleteProgramacao called, progId:', progId)
    try {
      const response = await api.delete(`/api/programacoes/${progId}`, { data: {} })
      console.log('Delete response status:', response.status)
      set((state) => ({
        programHistory: state.programHistory.filter(p => p.id !== progId),
      }))
      const { data: programacoes } = await api.get('/api/programacoes')
      
      const safeParse = (js, defVal = []) => {
        if (!js) return defVal
        if (Array.isArray(js)) return js
        try {
          const parsed = JSON.parse(js)
          return Array.isArray(parsed) ? parsed : defVal
        } catch {
          return defVal
        }
      }
      
      const ultimaDataPorHino = {}
      for (const prog of programacoes) {
        const hinos_ids = safeParse(prog.hinos_json)
        const dataCulto = prog.data
        for (const hinoId of hinos_ids) {
          if (!ultimaDataPorHino[hinoId] || dataCulto > ultimaDataPorHino[hinoId]) {
            ultimaDataPorHino[hinoId] = dataCulto
          }
        }
      }
      
      const { data: hymnsData } = await api.get('/api/hinos')
      const hinosAtualizados = hymnsData.map(h => {
        const novaData = ultimaDataPorHino[h.id] || null
        return { ...h, data_ultima_apresentacao: novaData, hinos_json: safeParseJson(h.hinos_json) }
      })
      set({ hymns: hinosAtualizados })
    } catch (err) {
      console.error('Erro ao excluir programação:', err)
      alert('Erro ao excluir programação: ' + (err.response?.data?.detail || err.message))
      throw err
    }
  },

  confirmTodayProgram: async (data_culto, tipo_culto, responsavel) => {
    try {
      const { todayProgram } = get()
      const payload = {
        data: data_culto,
        tipo_culto,
        responsavel,
        status: 'confirmado',
        hinos_json: JSON.stringify(todayProgram)
      }
      const { data } = await api.post('/api/programacoes', payload)
      
      const newEntry = {
        ...data,
        hinos_json: safeParseJson(data.hinos_json)
      }

      set((state) => ({
        programHistory: [newEntry, ...state.programHistory],
        todayProgram: [],
      }))

      const { data: hymnsData } = await api.get('/api/hinos')
      set({ hymns: hymnsData.map(h => ({ ...h, hinos_json: safeParseJson(h.hinos_json) })) })
    } catch (error) {
      console.error('Erro ao confirmar programação', error)
      throw error
    }
  },

  // Obter hino por ID
  getHymnById: (id) => {
    const { hymns } = get()
    return hymns.find(h => h.id === id)
  },

  // Estatísticas
  getTotalHymns: () => get().hymns.length,
  
  getUniqueKeys: () => {
    const { hymns } = get()
    return new Set(hymns.filter(h => h.tonalidade).map(h => h.tonalidade)).size
  },
}))

export default useHymnsStore
