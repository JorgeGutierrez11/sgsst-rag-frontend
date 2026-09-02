'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { ConsultationView } from '@/features/consultation/consultation-view'
import { DiagnosticView } from '@/features/diagnostic/diagnostic-view'
import { HomeView } from '@/features/home/home-view'
import type { AppView } from '@/shared/navigation.types'

const viewTitles: Record<AppView, string> = {
  home: 'NormIA',
  consulta: 'Consulta normativa',
  diagnostico: 'Diagnóstico',
}

export function AppShell() {
  return (
    <Suspense fallback={null}>
      <AppShellContent />
    </Suspense>
  )
}

function AppShellContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = toAppView(searchParams.get('view'))

  const navigate = (nextView: AppView) => {
    router.push(nextView === 'home' ? '/' : `/?view=${nextView}`)
  }

  return (
    <main className="app-shell">
      <Sidebar active={view} onNavigate={navigate} />
      <div className="main-column">
        <TopBar title={viewTitles[view]} />
        {view === 'home' ? (
          <HomeView onNavigate={navigate} />
        ) : view === 'consulta' ? (
          <ConsultationView />
        ) : (
          <DiagnosticView />
        )}
        <BottomNav active={view} onNavigate={navigate} />
      </div>
    </main>
  )
}

function toAppView(value: string | null): AppView {
  if (value === 'consulta' || value === 'diagnostico') return value

  return 'home'
}
