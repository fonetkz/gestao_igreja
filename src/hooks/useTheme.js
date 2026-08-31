import { useState, useEffect, useCallback } from 'react'

// Mantenha esta chave sincronizada com o script anti-flash em index.html.
export const THEME_STORAGE_KEY = 'gestao_igreja_theme'

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark') return true
    if (stored === 'light') return false
    // Sem preferência salva ainda: respeita o tema do sistema operacional,
    // igual ao script inline em index.html que evita o flash antes do React montar.
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

/**
 * Estado de tema claro/escuro compartilhado por toda a aplicação.
 * Centraliza a leitura/escrita do localStorage e a aplicação da classe
 * `dark` no <html> para evitar que cada tela reimplemente essa lógica
 * (e diverja em qual chave usa ou em qual é o fallback).
 */
export default function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light')
    } catch {
      // localStorage indisponível (modo privado, etc.) — tema segue funcionando nesta sessão.
    }
  }, [isDarkMode])

  const toggleDarkMode = useCallback(() => setIsDarkMode((prev) => !prev), [])

  return [isDarkMode, toggleDarkMode]
}
