import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('gestao_igreja_user') || 'null'),
  token: localStorage.getItem('gestao_igreja_token') || null,
  isAuthenticated: !!localStorage.getItem('gestao_igreja_token'),

  get isAdmin() {
    const user = get().user
    return user?.papel === 'admin'
  },

  login: async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      })

      localStorage.setItem('gestao_igreja_token', data.token)
      localStorage.setItem('gestao_igreja_user', JSON.stringify(data.user))
      sessionStorage.setItem('gestao_igreja_pwd', password)

      set({ user: data.user, token: data.token, isAuthenticated: true })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.detail || 'E-mail ou senha incorretos.'
      return { success: false, error: msg }
    }
  },

  logout: () => {
    localStorage.removeItem('gestao_igreja_token')
    localStorage.removeItem('gestao_igreja_user')
    sessionStorage.removeItem('gestao_igreja_pwd')
    set({ user: null, token: null, isAuthenticated: false })
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      const userData = { id: data.id, nome: data.nome, email: data.email, papel: data.papel, contexto_padrao: data.contexto_padrao ?? null }
      localStorage.setItem('gestao_igreja_user', JSON.stringify(userData))
      set({ user: userData })
      return userData
    } catch {
      return null
    }
  },

  updateProfile: async (updates) => {
    if (updates.nome) {
      const { data } = await api.post('/api/auth/profile', { nome: updates.nome })
      const state = get()
      const updatedUser = { ...(state.user || {}), nome: data.nome }
      localStorage.setItem('gestao_igreja_user', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    } else {
      const state = get()
      const updatedUser = { ...(state.user || {}), ...updates }
      localStorage.setItem('gestao_igreja_user', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    }
  },

  updateCredentials: async (email, newPassword) => {
    const state = get()
    const updatedUser = { ...(state.user || {}), email }
    localStorage.setItem('gestao_igreja_user', JSON.stringify(updatedUser))
    sessionStorage.setItem('gestao_igreja_pwd', newPassword)
    set({ user: updatedUser })
    return { success: true }
  },
}))

export default useAuthStore