import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('gestao_igreja_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('gestao_igreja_token'),
  passwordHash: null,

  fetchAuthConfig: async () => {
    try {
      const { data } = await api.get('/api/config/auth_settings')
      const parsed = JSON.parse(data.valor_json || '{}')
      if (parsed.user) {
        set({ user: parsed.user, passwordHash: parsed.passwordHash || 'admin123' })
        // Atualiza o cache local para refletir no carregamento imediato
        if (get().isAuthenticated) {
          localStorage.setItem('gestao_igreja_user', JSON.stringify(parsed.user))
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Inicializa admin padrão no banco
        get().saveToDatabase()
      }
    }
  },

  saveToDatabase: async () => {
    try {
      const state = get()
      // Caso não tenha user no state (pq ele deslogou antes de criar), forçamos um
      const currentUser = state.user || {
        id: 1, name: 'Maestro Ricardo', email: 'admin@igreja.com', role: 'Super Admin'
      }
      await api.put('/api/config/auth_settings', {
        valor: { user: currentUser, passwordHash: state.passwordHash || 'admin123' }
      })
    } catch (error) {
      console.error("Erro ao salvar credenciais", error)
    }
  },

  login: async (email, password) => {
    await get().fetchAuthConfig() // Garante os dados mais novos
    const state = get()
    const storedUser = state.user || { email: 'admin@igreja.com' }

    // Na primeira vez ou se não existir, criamos fallback
    const validEmail = storedUser.email || 'admin@igreja.com'
    const validPassword = state.passwordHash || 'admin123'

    if (email === validEmail && password === validPassword) {
      const authenticatedUser = { ...storedUser, email: validEmail }
      localStorage.setItem('gestao_igreja_token', 'mock-jwt-token-2024')
      localStorage.setItem('gestao_igreja_user', JSON.stringify(authenticatedUser))
      set({ user: authenticatedUser, isAuthenticated: true })
      return { success: true }
    }
    return { success: false, error: 'E-mail ou senha incorretos. Verifique e tente novamente.' }
  },

  logout: () => {
    localStorage.removeItem('gestao_igreja_token')
    // Não removemos mais o user_cache completamente, apenas bloqueamos acesso
    // para que a pessoa não perca o último email digitado no login
    set({ isAuthenticated: false })
  },

  // Atualizar perfil
  updateProfile: async (updates) => {
    const state = get()
    const updatedUser = { ...(state.user || {}), ...updates }

    localStorage.setItem('gestao_igreja_user', JSON.stringify(updatedUser))
    set({ user: updatedUser })
    await get().saveToDatabase()
  },

  // Atualizar credenciais
  updateCredentials: async (email, newPassword) => {
    const state = get()
    const updatedUser = { ...(state.user || {}), email }

    localStorage.setItem('gestao_igreja_user', JSON.stringify(updatedUser))
    set({ user: updatedUser, passwordHash: newPassword })
    await get().saveToDatabase()
    return { success: true }
  },
}))

export default useAuthStore
