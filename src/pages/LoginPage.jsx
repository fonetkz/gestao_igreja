import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Globe, Sun, Moon } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isCodeValidated, setIsCodeValidated] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        if ('gestao_igreja_theme' in localStorage) {
          return localStorage.getItem('gestao_igreja_theme') === 'dark'
        }
        return false
      }
    } catch (e) {
      return false
    }
    return false
  })

  // Sincroniza o tema na montagem e sempre que isDarkMode mudar
  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      localStorage.setItem('gestao_igreja_theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('gestao_igreja_theme', 'light')
    }
  }, [isDarkMode])

  const login = useAuthStore((s) => s.login)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const fetchRememberedEmail = async () => {
      try {
        const { data } = await api.get('/api/config/remembered_email')
        const parsed = JSON.parse(data.valor_json || '{}')
        if (parsed && parsed.email) {
          setEmail(parsed.email)
          setRememberMe(true)
        }
      } catch (err) {
        // Primeira vez ou não configurado no banco, apenas ignora
      }
    }
    fetchRememberedEmail()
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      localStorage.setItem('gestao_igreja_theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('gestao_igreja_theme', 'light')
    }
  }, [isDarkMode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }

    setLoading(true)

    // Simula delay de rede
    await new Promise((r) => setTimeout(r, 800))

    const result = await login(email, password)
    if (result.success) {
      try {
        await api.put('/api/config/remembered_email', {
          valor: { email: rememberMe ? email : '' }
        })
      } catch (err) {
        console.error('Erro ao salvar preferência de e-mail no banco', err)
      }
      navigate('/dashboard')
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!recoveryEmail) {
      setError('Digite seu endereço de e-mail.')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/auth/esqueci-senha', { email: recoveryEmail })
      setMessage(response.data.message || 'E-mail de recuperação enviado com sucesso!')
      setIsCodeSent(true)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Este e-mail não consta na base de dados. Por favor, verifique.')
      } else {
        setError('Ocorreu um erro ao enviar o e-mail. Tente novamente mais tarde.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleValidateCode = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!resetToken) {
      setError('Preencha o código recebido.')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/validar-token', { token: resetToken })
      setMessage('Código validado! Agora crie sua nova senha.')
      setIsCodeValidated(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Código inválido ou expirado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!newPassword || !confirmPassword) {
      setError('Preencha a nova senha e a confirmação.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/redefinir-senha', { token: resetToken, new_password: newPassword })
      setMessage('Senha alterada com sucesso! Redirecionando para o login...')
      setTimeout(() => {
        setIsForgotPasswordMode(false)
        setIsCodeSent(false)
        setIsCodeValidated(false)
        setResetToken('')
        setNewPassword('')
        setConfirmPassword('')
        setMessage('')
      }, 2500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Código inválido ou expirado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ===== Left Panel — 60% ===== */}
      <div
        className="hidden lg:flex lg:w-[60%] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f1647 0%, #1E2A78 40%, #2E3E9A 100%)',
        }}
      >
        {/* Animated Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/30 mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/20 mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />

        {/* Background architectural pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 80px,
                  rgba(255,255,255,0.1) 80px,
                  rgba(255,255,255,0.1) 82px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 80px,
                  rgba(255,255,255,0.08) 80px,
                  rgba(255,255,255,0.08) 82px
                )
              `,
            }}
          />
          {/* Window-like rectangles */}
          <div className="absolute top-[15%] left-[10%] w-40 h-56 border border-white/20 rounded-sm bg-white/5" />
          <div className="absolute top-[15%] left-[35%] w-40 h-56 border border-white/20 rounded-sm bg-white/5" />
          <div className="absolute top-[15%] right-[15%] w-40 h-56 border border-white/20 rounded-sm bg-white/5" />
        </div>

        {/* Gradient overlay from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151D5A]/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 w-full">
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[3px] text-blue-300 mb-3">
              Sistema de Gestão
            </p>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Gestão Igreja
            </h1>
            <p className="text-blue-200 text-base leading-relaxed">
              Gerencie membros, programações e chamadas de forma simples, moderna e eficiente.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Right Panel — 40% ===== */}
      <div className="flex-1 lg:w-[40%] bg-slate-50 dark:bg-[#0a0f1c] relative flex flex-col transition-colors duration-300 overflow-hidden">
        {/* Subtle Dotted Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.1 }} />

        <div className="flex-1 flex items-center justify-center px-8 py-12 relative z-10">
          <div className="w-full max-w-sm">
            {/* Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/80 border border-white/40 dark:border-slate-700/50 p-10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-80" />
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {isForgotPasswordMode ? 'Recuperar Senha' : 'Bem-vindo de volta'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                {isForgotPasswordMode
                  ? (isCodeSent ? (isCodeValidated ? 'Crie uma nova senha segura e confirme para finalizar.' : 'Digite o código que enviamos para o seu e-mail.') : 'Digite o e-mail associado à sua organização para receber o código de recuperação.')
                  : 'Acesse o painel da sua organização'}
              </p>

              {isForgotPasswordMode ? (
                isCodeSent ? (
                  !isCodeValidated ? (
                    <form onSubmit={handleValidateCode} className="space-y-6">
                      <div>
                        <label className="label-uppercase" htmlFor="reset-token">
                          Código de Verificação
                        </label>
                        <input
                          id="reset-token"
                          type="text"
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                          placeholder="Ex: A1B2C3D4"
                          className="input-base mt-1 font-mono uppercase tracking-widest dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                          autoComplete="off"
                          disabled={loading}
                          maxLength={8}
                        />
                      </div>

                      {/* Error & Message */}
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg px-4 py-2.5 text-sm text-danger dark:text-red-400 animate-slide-up">
                          {error}
                        </div>
                      )}

                      {message && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 animate-slide-up">
                          {message}
                        </div>
                      )}

                      <div className="pt-2 flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          {loading ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            'Validar Código'
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPasswordMode(false)
                            setIsCodeSent(false)
                            setIsCodeValidated(false)
                            setResetToken('')
                            setNewPassword('')
                            setConfirmPassword('')
                            setError('')
                            setMessage('')
                          }}
                          className="w-full btn-ghost py-3"
                        >
                          Voltar para o Login
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                      <div>
                        <label className="label-uppercase" htmlFor="new-password">
                          Nova Senha
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="input-base mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                          autoComplete="new-password"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="label-uppercase" htmlFor="confirm-password">
                          Confirmar Nova Senha
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="input-base mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                          autoComplete="new-password"
                          disabled={loading}
                        />
                      </div>

                      {/* Error & Message */}
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg px-4 py-2.5 text-sm text-danger dark:text-red-400 animate-slide-up">
                          {error}
                        </div>
                      )}

                      {message && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 animate-slide-up">
                          {message}
                        </div>
                      )}

                      <div className="pt-2 flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          {loading ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            'Salvar Nova Senha'
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPasswordMode(false)
                            setIsCodeSent(false)
                            setIsCodeValidated(false)
                            setResetToken('')
                            setNewPassword('')
                            setConfirmPassword('')
                            setError('')
                            setMessage('')
                          }}
                          className="w-full btn-ghost py-3"
                        >
                          Voltar para o Login
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    {/* Recovery Email */}
                    <div>
                      <label className="label-uppercase" htmlFor="recovery-email">
                        Endereço de E-mail
                      </label>
                      <input
                        id="recovery-email"
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="admin@igreja.com"
                        className="input-base mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>

                    {/* Error & Message */}
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg px-4 py-2.5 text-sm text-danger dark:text-red-400 animate-slide-up">
                        {error}
                      </div>
                    )}

                    {message && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 animate-slide-up">
                        {message}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        {loading ? (
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          'Enviar Código'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPasswordMode(false)
                          setError('')
                          setMessage('')
                        }}
                        className="w-full btn-ghost py-3"
                      >
                        Voltar para o Login
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="label-uppercase" htmlFor="login-email">
                      Endereço de E-mail
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@igreja.com"
                      className="input-base mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="label-uppercase" htmlFor="login-password">
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPasswordMode(true)
                          setError('')
                          setMessage('')
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF] hover:text-[#0062CC] transition-colors"
                      >
                        Esqueceu?
                      </button>
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-base mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      autoComplete="current-password"
                    />
                    <div className="mt-3 flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 dark:bg-slate-900 text-primary focus:ring-primary transition-colors cursor-pointer"
                        />
                        <span className="text-sm text-gray-500 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Lembrar meu e-mail</span>
                      </label>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg px-4 py-2.5 text-sm text-danger dark:text-red-400 animate-slide-up">
                      {error}
                    </div>
                  )}

                  {/* Message */}
                  {message && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 animate-slide-up">
                      {message}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl
                             flex items-center justify-center gap-2 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <>
                        Entrar
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Request Access */}
              {!isForgotPasswordMode && (
                <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
                  Novo por aqui?{' '}
                  <a
                    href="https://wa.me/5517991825818?text=Olá%20gostaria%20de%20solicitar%20meu%20acesso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 dark:text-white hover:text-[#007AFF] dark:hover:text-blue-400 transition-colors inline-block"
                  >
                    Solicitar Acesso
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-4 text-gray-500 dark:text-slate-500">
          <span className="text-[11px] font-medium uppercase tracking-[2px]">
            © 2026 Gestão Igreja
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-slate-400"
              title="Alternar Tema"
            >
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <Shield size={16} className="text-gray-400 dark:text-slate-600" />
            <Globe size={16} className="text-gray-400 dark:text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
