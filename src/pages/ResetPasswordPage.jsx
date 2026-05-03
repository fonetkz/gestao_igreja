import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle, Shield, Globe, Eye, EyeOff } from 'lucide-react'
import api from '../services/api'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição ausente. Solicite a redefinição novamente.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token ausente. Use o link enviado para o seu e-mail.')
      return
    }

    if (!password || !confirmPassword) {
      setError('Preencha todos os campos.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      await api.post('/api/auth/redefinir-senha', {
        token,
        new_password: password
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocorreu um erro ao redefinir a senha.')
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
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.1) 80px, rgba(255,255,255,0.1) 82px),
                repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.08) 80px, rgba(255,255,255,0.08) 82px)
              `,
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#151D5A]/80 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-center px-16 py-12 w-full">
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[3px] text-blue-300 mb-3">
              Recuperação de Acesso
            </p>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Nova Senha
            </h1>
            <p className="text-blue-200 text-base leading-relaxed mb-16">
              Crie uma senha forte e segura para proteger as informações da sua organização.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Right Panel — 40% ===== */}
      <div className="flex-1 lg:w-[40%] bg-[#F5F5F7] dark:bg-[#1C1C1E] flex flex-col transition-colors duration-300">
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Redefinir Senha</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
                Digite sua nova senha de acesso
              </p>

              {success ? (
                <div className="text-center py-6 animate-fade-in">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Senha alterada!</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                    Sua senha foi redefinida com sucesso. Redirecionando para o login...
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-apple-primary w-full"
                  >
                    Fazer Login Agora
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nova Senha */}
                  <div>
                    <label className="label-uppercase" htmlFor="new-password">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-base mt-1 pr-10 dark:bg-slate-900 dark:border-slate-700 dark:text-white w-full"
                        autoComplete="new-password"
                        disabled={loading || !token}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div>
                    <label className="label-uppercase" htmlFor="confirm-password">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-base mt-1 pr-10 dark:bg-slate-900 dark:border-slate-700 dark:text-white w-full"
                        autoComplete="new-password"
                        disabled={loading || !token}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg px-4 py-2.5 text-sm text-red-500 dark:text-red-400 animate-slide-up">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !token}
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
                        Redefinir Senha
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
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
            <Shield size={16} className="text-gray-400 dark:text-slate-600" />
            <Globe size={16} className="text-gray-400 dark:text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
