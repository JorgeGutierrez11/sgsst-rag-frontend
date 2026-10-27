'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/layout/bottom-nav'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Sidebar } from '@/components/layout/sidebar'
import { getRouteByPathname } from '@/shared/navigation.routes'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const activeRoute = getRouteByPathname(usePathname() ?? '/')

  return (
    <main className="h-dvh overflow-hidden bg-capa-surface p-0 md:bg-capa-main md:p-4">
      <div className="mx-auto flex h-dvh max-w-360 flex-col md:h-[calc(100dvh-32px)] md:flex-row md:gap-4">
        <MobileHeader />
        <Sidebar active={activeRoute.id} />
        <section className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-none bg-capa-surface shadow-none pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] md:rounded-panel md:pb-0 md:shadow-panel">
          {children}
        </section>
        <BottomNav active={activeRoute.id} />
      </div>
    </main>
  )
}
