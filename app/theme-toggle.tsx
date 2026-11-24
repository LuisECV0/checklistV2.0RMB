'use client'

import { useEffect, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const THEME_STORAGE_KEY = 'rmb-sateci-theme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)
  const transitionTimeout = useRef<number | null>(null)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))

    return () => {
      if (transitionTimeout.current !== null) {
        window.clearTimeout(transitionTimeout.current)
      }
    }
  }, [])

  function toggleTheme() {
    const nextIsDark = !isDark
    const root = document.documentElement

    root.classList.add('theme-transition')
    root.classList.toggle('dark', nextIsDark)

    if (transitionTimeout.current !== null) {
      window.clearTimeout(transitionTimeout.current)
    }

    transitionTimeout.current = window.setTimeout(() => {
      root.classList.remove('theme-transition')
      transitionTimeout.current = null
    }, 320)

    window.localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light')
    setIsDark(nextIsDark)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      aria-pressed={isDark}
      title={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:bg-secondary hover:text-primary ${className}`}
    >
      {isDark ? (
        <Sun key="sun" size={18} className="rmb-theme-icon" />
      ) : (
        <Moon key="moon" size={18} className="rmb-theme-icon" />
      )}
    </button>
  )
}
