'use client'

import { useState } from 'react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { ConsultationView } from '@/features/consultation/consultation-view'
import { DiagnosticView } from '@/features/diagnostic/diagnostic-view'
import { HomeView } from '@/features/home/home-view'
import type { AppView } from '@/shared/navigation.types'

const viewTitles: Record<AppView, string> = {
  home: 'ChattyAI',
  consulta: 'Consulta normativa',
  diagnostico: 'Diagnóstico',
}

export function AppShell() {
  const [view, setView] = useState<AppView>('home')
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = (nextView: AppView) => {
    setView(nextView)
    setMenuOpen(false)
  }

  return (
    <main className="app-shell">
      <Sidebar active={view} open={menuOpen} onNavigate={navigate} />
      <div className="main-column">
        <TopBar title={viewTitles[view]} onMenu={() => setMenuOpen((open) => !open)} />
        {view === 'home' ? (
          <HomeView onNavigate={setView} />
        ) : view === 'consulta' ? (
          <ConsultationView />
        ) : (
          <DiagnosticView />
        )}
        <BottomNav active={view} onNavigate={setView} />
      </div>
    </main>
  )
}
