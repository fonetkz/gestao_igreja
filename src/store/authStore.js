import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('choir_deck_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('choir_deck_token'),
  passwordHash: null,

  fetchAuthConfig: async () => {
    try {
      const { data } = await api.get('/api/config/auth_settings')
      const parsed = JSON.parse(data.valor_json || '{}')
      if (parsed.user) {
        set({ user: parsed.user, passwordHash: parsed.passwordHash || 'choir2024' })
        // Atualiza o cache local para refletir no carregamento imediato
        if (get().isAuthenticated) {
          localStorage.setItem('choir_deck_user', JSON.stringify(parsed.user))
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
        id: 1, name: 'Maestro Ricardo', email: 'email@email.com', role: 'Super Admin'
      }
      await api.put('/api/config/auth_settings', {
        valor: { user: currentUser, passwordHash: state.passwordHash || 'choir2024' }
      })
    } catch (error) {
      console.error("Erro ao salvar credenciais", error)
    }
  },

  login: async (email, password) => {
    await get().fetchAuthConfig() // Garante os dados mais novos
    const state = get()
    const storedUser = state.user || { email: 'email@email.com' }

    // Na primeira vez ou se não existir, criamos fallback
    const validEmail = storedUser.email || 'email@email.com'
    const validPassword = state.passwordHash || 'choir2024'

    if (email === validEmail && password === validPassword) {
      const authenticatedUser = { ...storedUser, email: validEmail }
      localStorage.setItem('choir_deck_token', 'mock-jwt-token-2024')
      localStorage.setItem('choir_deck_user', JSON.stringify(authenticatedUser))
      set({ user: authenticatedUser, isAuthenticated: true })
      return { success: true }
    }
    return { success: false, error: 'E-mail ou senha incorretos. Verifique e tente novamente.' }
  },

  logout: () => {
    localStorage.removeItem('choir_deck_token')
    // Não removemos mais o user_cache completamente, apenas bloqueamos acesso
    // para que a pessoa não perca o último email digitado no login
    set({ isAuthenticated: false })
  },

  // Atualizar perfil
  updateProfile: async (updates) => {
    const state = get()
    const updatedUser = { ...(state.user || {}), ...updates }

    localStorage.setItem('choir_deck_user', JSON.stringify(updatedUser))
    set({ user: updatedUser })
    await get().saveToDatabase()
  },

  // Atualizar credenciais
  updateCredentials: async (email, newPassword) => {
    const state = get()
    const updatedUser = { ...(state.user || {}), email }

    localStorage.setItem('choir_deck_user', JSON.stringify(updatedUser))
    set({ user: updatedUser, passwordHash: newPassword })
    await get().saveToDatabase()
    return { success: true }
  },
}))

export default useAuthStore
