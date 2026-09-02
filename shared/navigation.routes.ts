import { BarChart3, Home, MessageCircle, type LucideIcon } from 'lucide-react'

export type AppRouteId = 'home' | 'consulta' | 'diagnostico'

export type NavigationRoute = {
  id: AppRouteId
  label: string
  shortLabel: string
  href: '/' | '/consulta' | '/diagnostico'
  icon: LucideIcon
}

export const navigationRoutes: NavigationRoute[] = [
  { id: 'home', label: 'Inicio', shortLabel: 'Inicio', href: '/', icon: Home },
  { id: 'consulta', label: 'Consulta normativa', shortLabel: 'Consulta', href: '/consulta', icon: MessageCircle },
  { id: 'diagnostico', label: 'Diagnóstico', shortLabel: 'Diagnóstico', href: '/diagnostico', icon: BarChart3 },
]

export function getRouteByPathname(pathname: string): NavigationRoute {
  return navigationRoutes.find((route) => route.href === pathname) ?? navigationRoutes[0]
}
