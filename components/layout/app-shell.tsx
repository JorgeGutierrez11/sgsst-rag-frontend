'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Sidebar } from '@/components/layout/sidebar'
import { getRouteByPathname } from '@/shared/navigation.routes'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const activeRoute = getRouteByPathname(usePathname())

  return (
    <main className="app-shell">
      <Sidebar active={activeRoute.id} />
      <div className="main-column">
        {children}
        <BottomNav active={activeRoute.id} />
      </div>
    </main>
  )
}
