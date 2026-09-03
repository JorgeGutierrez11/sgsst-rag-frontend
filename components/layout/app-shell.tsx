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
    <main className="flex min-h-dvh bg-capa-main">
      <Sidebar active={activeRoute.id} />
      <div className="mx-auto grid min-h-dvh w-full min-w-0 max-w-255 flex-1 grid-rows-[minmax(0,1fr)] pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] md:pb-0">
        {children}
        <BottomNav active={activeRoute.id} />
      </div>
    </main>
  )
}
