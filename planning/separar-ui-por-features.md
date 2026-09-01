# Plan de implementación: separar la UI por features

> Estado: ejecutado. Este documento queda como historial de la refactorización; verificar el código actual antes de usarlo como plan activo.

> Objetivo: reducir la complejidad de `components/chatty-app.tsx` antes de integrar api real, moviendo vistas, layout y tipos a módulos pequeños con responsabilidades claras.

## Contexto verificado

- La app es un único proyecto Next.js en la raíz.
- Antes del refactor, `app/page.tsx` renderizaba `components/chatty-app.tsx`; después del refactor debe apuntar al layout shell actual.
- Antes del refactor, `components/chatty-app.tsx` concentraba navegación, layout, home, consulta, diagnóstico, estado del chat y estado del diagnóstico.
- La UI actual está en español; mantener copy visible en español salvo requisito contrario.
- No hay scripts de `lint`, `test` ni `typecheck`; `pnpm build` no basta para tipos porque `next.config.mjs` ignora errores TypeScript.

## Estructura objetivo

```txt
app/
  page.tsx
components/
  layout/
    app-shell.tsx
    bottom-nav.tsx
    brand-mark.tsx
    sidebar.tsx
    top-bar.tsx
  ui/
features/
  consultation/
    consultation-view.tsx
    consultation-composer.tsx
    consultation.types.ts
    examples.ts
    message-list.tsx
  diagnostic/
    diagnostic-view.tsx
    diagnostic.types.ts
  home/
    home-view.tsx
shared/
  navigation.types.ts
```

## Principios de corte

- `components/layout/*`: estructura común de la app, navegación y marca.
- `features/home/*`: solo pantalla inicial y accesos hacia features.
- `features/consultation/*`: estado y presentación de consulta normativa.
- `features/diagnostic/*`: flujo del diagnóstico guiado.
- `shared/navigation.types.ts`: tipo compartido `AppView = 'home' | 'consulta' | 'diagnostico'` para no acoplar features entre sí.
- Mantener `components/chatty-app.tsx` temporalmente como orquestador pequeño o reemplazarlo por `components/layout/app-shell.tsx` importado desde `app/page.tsx`.

## Tareas

### 1. Extraer tipos compartidos de navegación

**Crear**
- `shared/navigation.types.ts`

**Contenido esperado**
```ts
export type AppView = 'home' | 'consulta' | 'diagnostico'
```

**Verificación**
- `components/chatty-app.tsx` deja de declarar `type View` localmente.

### 2. Extraer layout común

**Crear**
- `components/layout/brand-mark.tsx`
- `components/layout/top-bar.tsx`
- `components/layout/bottom-nav.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/app-shell.tsx`

**Mover responsabilidades**
- `BrandMark` -> `brand-mark.tsx`
- `TopBar` -> `top-bar.tsx`
- `BottomNav` -> `bottom-nav.tsx`
- `<aside className="sidebar...">` -> `sidebar.tsx`
- Estado global `view` y `menuOpen` -> `app-shell.tsx`

**Interfaces objetivo**
```ts
// top-bar.tsx
type TopBarProps = {
  title?: string
  onMenu?: () => void
}

// bottom-nav.tsx
type BottomNavProps = {
  active: AppView
  onNavigate: (view: AppView) => void
}

// sidebar.tsx
type SidebarProps = {
  active: AppView
  open: boolean
  onNavigate: (view: AppView) => void
}
```

**Verificación**
- `app-shell.tsx` renderiza `HomeView`, `ConsultationView` y `DiagnosticView`.
- `app/page.tsx` puede importar `AppShell` directamente o seguir importando un `ChattyApp` delgado que solo retorna `<AppShell />`.

### 3. Extraer feature Home

**Crear**
- `features/home/home-view.tsx`

**Mover**
- `HomeView` completo desde `components/chatty-app.tsx`.

**Interfaz objetivo**
```ts
import type { AppView } from '@/shared/navigation.types'

type HomeViewProps = {
  onNavigate: (view: AppView) => void
}
```

**Verificación**
- Los botones “Empezar a consultar”, “Consulta normativa” y “Diagnóstico guiado” siguen navegando a la vista correcta.

### 4. Extraer feature Consultation

**Crear**
- `features/consultation/consultation.types.ts`
- `features/consultation/examples.ts`
- `features/consultation/message-list.tsx`
- `features/consultation/consultation-composer.tsx`
- `features/consultation/consultation-view.tsx`

**Tipos objetivo**
```ts
// consultation.types.ts
export type ConsultationMessage = {
  role: 'user' | 'assistant'
  content: string
  references?: string[]
}
```

**Cortes de responsabilidad**
- `examples.ts`: lista de preguntas sugeridas.
- `message-list.tsx`: render de mensajes, fuentes y estado `loading`.
- `consultation-composer.tsx`: input, botón de envío y manejo de Enter con composición IME.
- `consultation-view.tsx`: estado `messages`, `input`, `loading`, `error` y función `send`.

**Interfaz objetivo del composer**
```ts
type ConsultationComposerProps = {
  input: string
  loading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
}
```

**Verificación**
- Enviar ejemplo agrega mensaje del usuario, muestra loading y luego respuesta mock del asistente.
- El botón enviar se deshabilita con input vacío o mientras `loading` sea `true`.
- Enter envía, pero no durante composición IME.

### 5. Extraer feature Diagnostic

**Crear**
- `features/diagnostic/diagnostic.types.ts`
- `features/diagnostic/diagnostic-view.tsx`

**Tipos objetivo**
```ts
// diagnostic.types.ts
export type DiagnosticStep = 1 | 2 | 3 | 4
```

**Mover**
- `DiagnosticoView` completo, renombrado a `DiagnosticView`.
- Array de pasos dentro de `diagnostic-view.tsx` o como constante local del módulo.

**Verificación**
- El stepper mantiene los cuatro pasos: Empresa, Preguntas, Revisión, Resultado.
- “Repetir diagnóstico” vuelve al paso 1.

### 6. Reducir o eliminar `components/chatty-app.tsx`

**Opción recomendada**
- Cambiar `app/page.tsx` para importar `AppShell` desde `@/components/layout/app-shell`.
- Eliminar `components/chatty-app.tsx` si ya no tiene responsabilidad real.

**Opción conservadora**
- Dejar `components/chatty-app.tsx` como compatibilidad temporal:
```tsx
import { AppShell } from '@/components/layout/app-shell'

export default function ChattyApp() {
  return <AppShell />
}
```

**Criterio de decisión**
- Si no hay imports externos aparte de `app/page.tsx`, eliminarlo. Si se quiere una migración menos riesgosa, dejarlo delgado durante un commit y eliminarlo después.

### 7. Ajustar imports y estilos solo si hace falta

**Regla**
- No mover CSS todavía. `app/globals.css` puede seguir centralizando clases como `chat-view`, `diagnostic-view`, `bottom-nav`, `sidebar`, etc.

**Por qué**
- Separar estructura primero. Mover estilos al mismo tiempo aumenta riesgo y hace más difícil revisar el cambio.

**Verificación**
- No duplicar clases CSS.
- No renombrar clases salvo que el build obligue.

### 8. Verificación manual y técnica

**Comandos**
```bash
pnpm exec tsc --noEmit
pnpm build
```

**Notas**
- Si `pnpm` no está disponible, instalar/habilitar pnpm antes de verificar.
- `pnpm build` puede pasar aunque haya errores TypeScript; por eso `tsc --noEmit` va primero.

**Flujo manual mínimo**
- Abrir Home.
- Navegar a Consulta desde Home, sidebar y bottom nav.
- Enviar una consulta escrita.
- Enviar una consulta desde un chip de ejemplo.
- Navegar a Diagnóstico.
- Avanzar pasos 1 -> 4.
- Repetir diagnóstico.
- Volver a Home.

## Orden de commits sugerido

1. `refactor: extract shared navigation and layout shell`
2. `refactor: move home view into feature module`
3. `refactor: split consultation feature components`
4. `refactor: move diagnostic view into feature module`
5. `refactor: remove legacy chatty app wrapper`

## Fuera de alcance

- Integrar IA real.
- Cambiar diseño visual.
- Mover estilos fuera de `app/globals.css`.
- Agregar librerías de estado global.
- Crear rutas separadas de Next.js para cada vista.

## Criterio de aceptación

- Ningún componente nuevo debería mezclar layout global, navegación y lógica de feature.
- `components/chatty-app.tsx` queda eliminado o reducido a un wrapper trivial.
- La UI se comporta igual que antes desde la perspectiva del usuario.
- La verificación de tipos se ejecuta con `pnpm exec tsc --noEmit` cuando pnpm esté disponible.
