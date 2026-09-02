# Routing real de Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** reemplazar la navegación por query param (`/?view=consulta`) con rutas reales de Next.js (`/consulta`, `/diagnostico`), manteniendo la app como frontend que solo consume API externa.

**Architecture:** Next.js debe encargarse del routing por carpetas. `AppShell` pasa a ser layout visual compartido y deja de decidir qué vista renderizar; cada ruta renderiza su feature page. La app no gestionará backend propio: cualquier dato dinámico seguirá viniendo de clientes HTTP hacia la API existente o futura.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.7, Client Components donde haya interacción, Tailwind CSS v4, Fetch API para consumo externo.

## Global Constraints

- No crear lógica de backend, base de datos, persistencia server-side ni API routes internas para esta fase.
- La consulta normativa debe seguir consumiendo la API externa; no reintroducir mocks ni respuestas inventadas.
- Mantener copy visible en español.
- Mobile debe seguir usando `BottomNav` como navegación principal; desktop conserva `Sidebar`.
- Las URLs objetivo son `/`, `/consulta` y `/diagnostico`.
- El estado activo de navegación debe derivarse del pathname, no de query params ni estado local duplicado.
- Verificar con `pnpm exec tsc --noEmit` antes de `pnpm build` cuando pnpm esté disponible.

---

## Estado actual verificado

- `app/page.tsx` renderiza `<AppShell />` para la única ruta real `/`.
- `components/layout/app-shell.tsx` es Client Component y usa `useRouter` + `useSearchParams` para mapear `/?view=consulta` y `/?view=diagnostico`.
- `AppShell` contiene la selección condicional de vistas: `HomeView`, `ConsultationView` o `DiagnosticView`.
- `Sidebar`, `BottomNav` y `HomeView` reciben `onNavigate: (view: AppView) => void`.
- `shared/navigation.types.ts` define `AppView = 'home' | 'consulta' | 'diagnostico'`.
- No hay scripts de test/lint/typecheck configurados en `package.json`; solo `dev`, `build` y `start`.

## File map

### Crear

- `app/(main)/layout.tsx`: layout compartido para las páginas principales.
- `app/(main)/page.tsx`: página home en la ruta `/`.
- `app/(main)/consulta/page.tsx`: página de consulta en `/consulta`.
- `app/(main)/diagnostico/page.tsx`: página de diagnóstico en `/diagnostico`.
- `shared/navigation.routes.ts`: definición central de rutas, labels e ids de navegación.

### Modificar

- `app/page.tsx`: eliminar o mover su responsabilidad a `app/(main)/page.tsx`.
- `components/layout/app-shell.tsx`: convertirlo en wrapper de layout con `children`; quitar `useRouter`, `useSearchParams`, `Suspense`, `toAppView` y render condicional de features.
- `components/layout/sidebar.tsx`: navegar con rutas reales mediante `Link` o recibir links ya resueltos.
- `components/layout/bottom-nav.tsx`: navegar con rutas reales mediante `Link` o recibir links ya resueltos.
- `features/home/home-view.tsx`: reemplazar `onNavigate` por links reales a `/consulta` y `/diagnostico`.
- `shared/navigation.types.ts`: mantener solo si aporta tipo compartido; si queda redundante, reemplazarlo por tipos derivados de `navigation.routes.ts`.

### No modificar en esta fase

- No cambiar el contrato ni endpoint del cliente HTTP de consulta.
- No crear `app/api/*`.
- No introducir autenticación, sesiones, base de datos, server actions ni middleware.
- No rediseñar visualmente las vistas salvo ajustes mínimos necesarios por navegación.

---

## Task 1: centralizar rutas reales de navegación

**Files:**
- Create: `shared/navigation.routes.ts`
- Modify: `shared/navigation.types.ts` si queda duplicado

**Interfaces:**
- Consumes: vistas actuales `home`, `consulta`, `diagnostico`.
- Produces: `AppRouteId`, `NavigationRoute`, `navigationRoutes`, `getRouteByPathname(pathname)`.

- [ ] **Step 1: crear `shared/navigation.routes.ts`**

Use:
```ts
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
```

Expected:
- Los paths quedan definidos en un solo lugar.
- `Sidebar` y `BottomNav` no mantienen arrays duplicados.
- Los labels largos y cortos permiten desktop/mobile sin lógica repetida.

- [ ] **Step 2: decidir qué hacer con `shared/navigation.types.ts`**

Si ningún import lo necesita después de migrar, eliminarlo. Si se quiere preservar compatibilidad temporal, reemplazarlo por:
```ts
export type { AppRouteId as AppView } from '@/shared/navigation.routes'
```

- [ ] **Step 3: commit sugerido**

```bash
git add shared/navigation.routes.ts shared/navigation.types.ts
git commit -m "refactor: define next navigation routes"
```

---

## Task 2: convertir `AppShell` en layout compartido

**Files:**
- Modify: `components/layout/app-shell.tsx`

**Interfaces:**
- Consumes: `children: React.ReactNode`, rutas desde `navigation.routes.ts`.
- Produces: layout común con sidebar, topbar, contenido central y bottom nav.

- [ ] **Step 1: reemplazar control por query param**

Use:
```tsx
'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { getRouteByPathname } from '@/shared/navigation.routes'

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const activeRoute = getRouteByPathname(usePathname())

  return (
    <main className="app-shell">
      <Sidebar active={activeRoute.id} />
      <div className="main-column">
        <TopBar title={activeRoute.id === 'home' ? 'NormIA' : activeRoute.label} />
        {children}
        <BottomNav active={activeRoute.id} />
      </div>
    </main>
  )
}
```

Expected:
- No existe `useRouter`.
- No existe `useSearchParams`.
- No existe `toAppView`.
- No existe render condicional de `HomeView`, `ConsultationView` o `DiagnosticView` dentro de `AppShell`.

- [ ] **Step 2: confirmar responsabilidad nueva**

Expected:
- `AppShell` solo responde a: “¿cuál ruta está activa?” y “¿cómo envuelvo la página?”.
- Las páginas de Next responden a: “¿qué feature renderizo?”.

- [ ] **Step 3: commit sugerido**

```bash
git add components/layout/app-shell.tsx
git commit -m "refactor: make app shell route-driven"
```

---

## Task 3: migrar navegación visual a links reales

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/bottom-nav.tsx`

**Interfaces:**
- Consumes: `active: AppRouteId` y `navigationRoutes`.
- Produces: navegación accesible basada en `<Link href="...">`.

- [ ] **Step 1: actualizar `Sidebar`**

Use:
```tsx
import Link from 'next/link'
import { Bot } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { navigationRoutes, type AppRouteId } from '@/shared/navigation.routes'

type SidebarProps = {
  active: AppRouteId
}

export function Sidebar({ active }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandMark small />
        <strong>Norm<span>IA</span></strong>
      </div>
      <nav>
        {navigationRoutes.map(({ id, label, href, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            className={active === id ? 'side-link active' : 'side-link'}
            aria-current={active === id ? 'page' : undefined}
          >
            <Icon size={17} /> {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="mini-note">
          <Bot size={16} />
          <span>Tu asistente de confianza</span>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: actualizar `BottomNav`**

Use:
```tsx
import Link from 'next/link'
import { navigationRoutes, type AppRouteId } from '@/shared/navigation.routes'

type BottomNavProps = {
  active: AppRouteId
}

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {navigationRoutes.map(({ id, shortLabel, href, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          className={active === id ? 'nav-item active' : 'nav-item'}
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon size={19} />
          <span>{shortLabel}</span>
        </Link>
      ))}
    </nav>
  )
}
```

Expected:
- No hay `onNavigate` en navegación principal.
- Los enlaces tienen URLs reales y funcionan sin handlers manuales.
- `aria-current="page"` se mantiene.

- [ ] **Step 3: revisar CSS existente para botones vs links**

Expected:
- Si `.side-link` o `.nav-item` asumían `<button>`, ajustar `text-decoration`, `display`, `color`, `border` o `appearance` en `app/globals.css` solo si visualmente se rompe.
- No cambiar el diseño más allá de conservar la apariencia actual.

- [ ] **Step 4: commit sugerido**

```bash
git add components/layout/sidebar.tsx components/layout/bottom-nav.tsx app/globals.css
git commit -m "refactor: use links for primary navigation"
```

---

## Task 4: crear rutas por carpetas en `app/`

**Files:**
- Create: `app/(main)/layout.tsx`
- Create: `app/(main)/page.tsx`
- Create: `app/(main)/consulta/page.tsx`
- Create: `app/(main)/diagnostico/page.tsx`
- Modify/Delete: `app/page.tsx`

**Interfaces:**
- Consumes: `AppShell`, `HomeView`, `ConsultationView`, `DiagnosticView`.
- Produces: rutas reales `/`, `/consulta`, `/diagnostico`.

- [ ] **Step 1: crear route group layout**

Use `app/(main)/layout.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>
}
```

- [ ] **Step 2: crear home page real**

Use `app/(main)/page.tsx`:
```tsx
import { HomeView } from '@/features/home/home-view'

export default function HomePage() {
  return <HomeView />
}
```

- [ ] **Step 3: crear consulta page real**

Use `app/(main)/consulta/page.tsx`:
```tsx
import { ConsultationView } from '@/features/consultation/consultation-view'

export default function ConsultationPage() {
  return <ConsultationView />
}
```

- [ ] **Step 4: crear diagnóstico page real**

Use `app/(main)/diagnostico/page.tsx`:
```tsx
import { DiagnosticView } from '@/features/diagnostic/diagnostic-view'

export default function DiagnosticPage() {
  return <DiagnosticView />
}
```

- [ ] **Step 5: eliminar o vaciar `app/page.tsx` sin duplicar ruta**

Expected:
- No pueden coexistir `app/page.tsx` y `app/(main)/page.tsx` como dos páginas para `/`.
- La opción preferida es mover la responsabilidad a `app/(main)/page.tsx` y eliminar `app/page.tsx`.

- [ ] **Step 6: commit sugerido**

```bash
git add app components/layout/app-shell.tsx
git rm app/page.tsx
git commit -m "refactor: add next app routes"
```

---

## Task 5: reemplazar navegación interna de Home por links

**Files:**
- Modify: `features/home/home-view.tsx`

**Interfaces:**
- Consumes: rutas `/consulta` y `/diagnostico`.
- Produces: `HomeView` sin prop `onNavigate`.

- [ ] **Step 1: quitar props de `HomeView`**

Use:
```tsx
import Link from 'next/link'
import { ArrowUp, Check, ChevronRight, ClipboardList, MessageCircle } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'

export function HomeView() {
  return (
    <section className="home-view page-pad">
      <div className="welcome-block">
        <BrandMark />
        <p className="eyebrow">Asistente inteligente para tu empresa</p>
        <h1>Hola, soy <span>NormIA</span></h1>
        <p className="lead">Consulta normativa, entiende tus obligaciones y toma decisiones con más claridad.</p>
        <Link className="primary-button" href="/consulta">
          Empezar a consultar <ArrowUp size={17} />
        </Link>
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">Todo en un solo lugar</p>
          <h2>¿En qué puedo ayudarte?</h2>
        </div>
      </div>

      <div className="action-grid">
        <Link className="feature-card" href="/consulta">
          <span className="feature-icon green"><MessageCircle size={21} /></span>
          <span><strong>Consulta normativa</strong><small>Pregunta sobre legislación y obligaciones</small></span>
          <ChevronRight size={18} />
        </Link>
        <Link className="feature-card" href="/diagnostico">
          <span className="feature-icon blue"><ClipboardList size={21} /></span>
          <span><strong>Diagnóstico guiado</strong><small>Evalúa el estado actual de tu empresa</small></span>
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="trust-note"><Check size={15} /> Respuestas fundamentadas en fuentes oficiales</div>
    </section>
  )
}
```

- [ ] **Step 2: revisar CSS para anchors con clases de botón/card**

Expected:
- `.primary-button` y `.feature-card` deben verse igual en `<a>` que en `<button>`.
- Si aparecen subrayados o colores heredados incorrectos, ajustar en `app/globals.css`.

- [ ] **Step 3: commit sugerido**

```bash
git add features/home/home-view.tsx app/globals.css
git commit -m "refactor: link home actions to next routes"
```

---

## Task 6: limpiar referencias al routing anterior

**Files:**
- Modify/Delete: archivos que importen `AppView`, `onNavigate`, `useSearchParams` o `/?view=`

**Interfaces:**
- Consumes: resultado de tasks anteriores.
- Produces: codebase sin navegación por query param.

- [ ] **Step 1: buscar referencias obsoletas**

Run:
```bash
rg "onNavigate|AppView|useSearchParams|useRouter|view=|toAppView" app components features shared
```

Expected:
- No debe aparecer `useSearchParams` ni `view=` para navegación principal.
- `useRouter` solo puede existir si otro flujo real lo necesita; no para tabs de vista.
- `onNavigate` no debe existir para navegación principal.

- [ ] **Step 2: eliminar imports y tipos muertos**

Expected:
- No quedan imports desde `shared/navigation.types.ts` salvo compatibilidad temporal justificada.
- No quedan arrays duplicados de navegación en `Sidebar` y `BottomNav`.

- [ ] **Step 3: commit sugerido**

```bash
git add app components features shared
git commit -m "chore: remove query-param navigation leftovers"
```

---

## Task 7: verificar comportamiento y restricción frontend-only

**Files:**
- No debería requerir cambios si las tasks previas están correctas.

**Interfaces:**
- Consumes: rutas implementadas.
- Produces: evidencia de que Next routing funciona y que no se agregó backend propio.

- [ ] **Step 1: ejecutar typecheck**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected:
- PASS.
- Si pnpm no está instalado, registrar el bloqueo y no sustituirlo por `next build` como prueba de tipos, porque `next.config.mjs` ignora errores TypeScript.

- [ ] **Step 2: ejecutar build**

Run:
```bash
pnpm build
```

Expected:
- PASS.

- [ ] **Step 3: prueba manual de rutas**

Run:
```bash
pnpm dev
```

Abrir:
```txt
http://localhost:3000/
http://localhost:3000/consulta
http://localhost:3000/diagnostico
```

Expected:
- `/` muestra Home.
- `/consulta` muestra Consulta normativa.
- `/diagnostico` muestra Diagnóstico.
- Sidebar desktop y BottomNav mobile marcan la ruta activa.
- Recargar cada URL conserva la vista correcta.

- [ ] **Step 4: confirmar que no se creó backend propio**

Run:
```bash
rg "app/api|route.ts|server action|use server" app features components shared
```

Expected:
- No aparece nueva API route interna para consulta.
- La consulta sigue usando cliente HTTP hacia API externa.

- [ ] **Step 5: registrar evidencia de verificación**

```bash
git status --short
```

Expected:
- Si no hay cambios pendientes, dejar la evidencia de typecheck/build/prueba manual en el PR o en la tarea.
- No crear commits vacíos solo para registrar verificación.

---

## Self-review checklist

- [ ] Las rutas reales son `/`, `/consulta` y `/diagnostico`.
- [ ] No quedan URLs `/?view=...` para navegación principal.
- [ ] `AppShell` no decide qué feature renderizar.
- [ ] `Sidebar`, `BottomNav` y acciones de Home usan `<Link>`.
- [ ] No se agregó backend propio ni API routes internas.
- [ ] La integración existente con API externa de consulta se mantiene.
- [ ] El build no se toma como prueba suficiente de tipos; usar `pnpm exec tsc --noEmit`.
