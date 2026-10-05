'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  function toggleTheme() {
    const dark = !document.documentElement.classList.contains('dark')

    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
    setIsDark(dark)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Modo oscuro"
      aria-pressed={isDark}
      className="relative ml-4 inline-flex h-5 w-10 shrink-0 items-center rounded-full bg-brand-light p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
    >
      <span
        className={`grid size-4 place-items-center rounded-full bg-brand-primary text-brand-text shadow-sm motion-safe:transition-transform motion-safe:duration-200 ${isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
      >
        {isDark ? (
          <Moon size={10} aria-hidden="true" />
        ) : (
          <Sun size={10} aria-hidden="true" />
        )}
      </span>
    </button>
  )
}