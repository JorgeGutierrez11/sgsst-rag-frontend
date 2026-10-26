'use client'

import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'

// The `dark` class on <html> is the single source of truth, so every mounted
// toggle (sidebar and mobile header) stays in sync.
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getIsDark() {
  return document.documentElement.classList.contains('dark')
}

function getServerIsDark() {
  return false
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, getServerIsDark)

  function toggleTheme() {
    const dark = !getIsDark()

    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Modo oscuro"
      aria-pressed={isDark}
      className="relative ml-4 inline-flex h-5 w-10 shrink-0 items-center rounded-full bg-brand-light p-0.5 before:absolute before:-inset-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
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
