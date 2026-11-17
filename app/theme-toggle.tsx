'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const THEME_STORAGE_KEY = 'rmb-sateci-theme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    const nextIsDark = !isDark
    document.documentElement.classList.toggle('dark', nextIsDark)
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
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
