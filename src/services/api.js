import axios from 'axios'

const api = axios.create({
  // Em produção (servido pelo FastAPI), baseURL vazio usa a mesma origem.
  // Em dev (Vite :5173), o proxy no vite.config.js redireciona /api/* → FastAPI.
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('choir_deck_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('choir_deck_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
