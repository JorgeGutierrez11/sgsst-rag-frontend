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
  const activeRoute = getRouteByPathname(usePathname() ?? '/')

  return (
    <main className="h-dvh overflow-hidden bg-capa-main p-3 md:p-4">
      <div className="mx-auto flex h-[calc(100dvh-24px)] max-w-360 gap-3 md:h-[calc(100dvh-32px)] md:gap-4">
        <Sidebar active={activeRoute.id} />
        <section className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-panel bg-capa-surface shadow-panel pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </section>
        <BottomNav active={activeRoute.id} />
      </div>
    </main>
  )
}
