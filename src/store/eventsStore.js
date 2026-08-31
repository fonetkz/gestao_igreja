import { create } from 'zustand'
import api from '../services/api'

const useEventsStore = create((set, get) => ({
  events: [],
  loading: false,

  fetchEvents: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/api/eventos')
      set({ events: data })
    } catch (error) {
      console.error('Erro ao buscar eventos', error)
    } finally {
      set({ loading: false })
    }
  },

  addEvent: async (evento) => {
    try {
      const { data } = await api.post('/api/eventos', evento)
      set((state) => ({ events: [...state.events, data] }))
      return data
    } catch (error) {
      console.error('Erro ao adicionar evento', error)
      throw error
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const { data } = await api.patch(`/api/eventos/${id}`, updates)
      set((state) => ({
        events: state.events.map(e => e.id === id ? data : e),
      }))
      return data
    } catch (error) {
      console.error('Erro ao atualizar evento', error)
      throw error
    }
  },

  removeEvent: async (id) => {
    try {
      await api.delete(`/api/eventos/${id}`)
      set((state) => ({
        events: state.events.filter(e => e.id !== id),
      }))
    } catch (error) {
      console.error('Erro ao remover evento', error)
      throw error
    }
  },
}))

export default useEventsStore
