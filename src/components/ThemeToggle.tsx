import { useEffect, useState } from 'react'
import './ThemeToggle.css'

const STORAGE_KEY = 'goal-tracker-theme'

type Theme = 'light' | 'dark' | 'jjk'

const THEMES: Theme[] = ['light', 'dark', 'jjk']
const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  jjk: 'JJK'
}
const THEME_ICONS: Record<Theme, string> = {
  light: '☀️',
  dark: '🌙',
  jjk: '⚡'
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'dark' || stored === 'light' || stored === 'jjk') return stored
  } catch {
    /* ignore */
  }
  return 'light'
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme())

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const cycleTheme = () => {
    setTheme((current) => {
      const currentIndex = THEMES.indexOf(current)
      const nextIndex = (currentIndex + 1) % THEMES.length
      return THEMES[nextIndex]
    })
  }

  const nextTheme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle-${theme}`}
      onClick={cycleTheme}
      aria-label={`Switch to ${THEME_LABELS[nextTheme]} mode`}
      title={`Current: ${THEME_LABELS[theme]} — Click for ${THEME_LABELS[nextTheme]}`}
    >
      <span className="theme-toggle-icon">{THEME_ICONS[theme]}</span>
      <span className="theme-toggle-label">{THEME_LABELS[theme]}</span>
    </button>
  )
}
