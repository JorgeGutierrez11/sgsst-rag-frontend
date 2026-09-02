# Mejoras UI/UX y mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** endurecer la UI de NormIA para producción: mejor distribución móvil, navegación sin sidebar en móvil, estados accesibles, tipografía más legible y sistema visual más consistente.

**Architecture:** mantener la separación actual por `components/layout` y `features/*`. El layout desktop conserva sidebar; mobile usa únicamente `BottomNav`, eliminando el botón de menú y cualquier sidebar off-canvas móvil. Las mejoras visuales se concentran primero en `app/globals.css` y solo se tocan componentes cuando haga falta mejorar semántica, accesibilidad o navegación.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.7, Tailwind CSS v4, CSS custom properties, Client Components.

## Global Constraints

- Mobile no debe mostrar sidebar ni botón hamburguesa; el menú inferior es la navegación móvil única.
- Desktop puede conservar sidebar porque aporta orientación y jerarquía en pantallas grandes.
- No cambiar el flujo funcional de Home, Consulta o Diagnóstico salvo mejoras explícitas de UX.
- Mantener copy visible en español.
- No introducir librerías nuevas para estas mejoras.
- Mantener el CSS centralizado en `app/globals.css` por ahora; no abrir otro refactor de arquitectura visual todavía.
- Usar tokens semánticos antes de seguir regando colores hardcodeados.
- Todo control interactivo debe tener estado hover, active y focus-visible visible.
- Respetar `prefers-reduced-motion`.
- Verificar con `pnpm exec tsc --noEmit` antes de `pnpm build`.

---

## Estado actual verificado

- `components/layout/app-shell.tsx` mantiene `view` y `menuOpen` en estado local.
- `components/layout/top-bar.tsx` muestra botón hamburguesa móvil con `onMenu`.
- `components/layout/sidebar.tsx` recibe `open` y renderiza un sidebar que también se abre en móvil.
- `components/layout/bottom-nav.tsx` ya existe y cubre navegación principal móvil.
- `features/consultation/consultation-composer.tsx` no define `name` ni `autocomplete` en el input.
- `app/globals.css` concentra tokens, layout, responsive, tipografía y estados.
- La auditoría UI/UX detectó riesgos en safe-area móvil, colores hardcodeados, textos pequeños, estados interactivos, motion y contenido largo.

## File map

### Modificar

- `components/layout/app-shell.tsx`: eliminar estado `menuOpen`; navegación solo cambia `view`.
- `components/layout/top-bar.tsx`: quitar botón hamburguesa móvil y prop `onMenu`.
- `components/layout/sidebar.tsx`: eliminar prop `open`; sidebar solo desktop.
- `components/layout/bottom-nav.tsx`: mantener como navegación móvil única.
- `features/consultation/consultation-composer.tsx`: mejorar atributos del input.
- `features/consultation/message-list.tsx`: mejorar accesibilidad del typing y referencias si aplica.
- `features/diagnostic/diagnostic-view.tsx`: mejorar semántica del stepper y añadir “Atrás”.
- `app/globals.css`: tokens, tipografía, responsive mobile, safe-area, estados, reduced motion, wrapping.
- `app/layout.tsx`: limpiar metadata si se decide quitar `generator: 'v0.app'`.

### No modificar en esta fase

- No cambiar integración API de consulta.
- No mover estilos a módulos CSS.
- No crear rutas separadas todavía; URL state puede hacerse con query param si se decide en Task 7.
- No eliminar `BottomNav`.

---

## Task 1: simplificar navegación móvil quitando sidebar mobile

**Files:**
- Modify: `components/layout/app-shell.tsx`
- Modify: `components/layout/top-bar.tsx`
- Modify: `components/layout/sidebar.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `AppView`, `TopBar`, `Sidebar`, `BottomNav` existentes.
- Produces: desktop con sidebar; mobile solo con bottom nav.

- [ ] **Step 1: eliminar `menuOpen` de `AppShell`**

In `components/layout/app-shell.tsx`, replace the stateful menu logic with:
```tsx
export function AppShell() {
  const [view, setView] = useState<AppView>('home')

  return (
    <main className="app-shell">
      <Sidebar active={view} onNavigate={setView} />
      <div className="main-column">
        <TopBar title={viewTitles[view]} />
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
```

Expected:
- No existe `menuOpen`.
- No existe función `navigate` solo para cerrar menú.
- `BottomNav` sigue visible en mobile.

- [ ] **Step 2: quitar prop `onMenu` y botón hamburguesa de `TopBar`**

In `components/layout/top-bar.tsx`, use:
```tsx
type TopBarProps = {
  title?: string
}

export function TopBar({ title = 'NormIA' }: TopBarProps) {
  return (
    <header className="topbar">
      <Link href="/" className="topbar-title">
        <BrandMark small /> <span>{title}</span>
      </Link>
      <button className="icon-button" aria-label="Configuración">
        <Settings2 size={18} />
      </button>
    </header>
  )
}
```

Expected:
- No queda clase `mobile-only` usada por TopBar.
- No queda `aria-label="Abrir menú"` porque ya no hay menú móvil.

- [ ] **Step 3: simplificar `SidebarProps`**

In `components/layout/sidebar.tsx`, change props to:
```ts
type SidebarProps = {
  active: AppView
  onNavigate: (view: AppView) => void
}
```

And render:
```tsx
<aside className="sidebar">
```

Expected:
- No existe prop `open`.
- No existen clases dinámicas `sidebar open`.

- [ ] **Step 4: ocultar sidebar completamente en mobile desde CSS**

In the mobile media query of `app/globals.css`, ensure:
```css
.sidebar {
  display: none;
}

.main-column {
  max-width: none;
  min-height: 100dvh;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
}

.bottom-nav {
  display: grid;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
}
```

Expected:
- No off-canvas sidebar mobile.
- No transform mobile sidebar.
- No overlay necesario porque no hay drawer.

- [ ] **Step 5: eliminar CSS muerto del menú móvil**

Remove mobile-only rules that only existed for the hamburger/off-canvas behavior:
```css
.mobile-only { ... }
.sidebar.open { ... }
.menu-line { ... }
```

Expected:
- `grep -R "mobile-only\|sidebar open\|menu-line" -n app components features` has no relevant output.

- [ ] **Step 6: commit sugerido**

```bash
git add components/layout/app-shell.tsx components/layout/top-bar.tsx components/layout/sidebar.tsx app/globals.css
git commit -m "refactor: use bottom navigation only on mobile"
```

---

## Task 2: mejorar distribución móvil y safe areas

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: clases existentes `.app-shell`, `.main-column`, `.page-pad`, `.bottom-nav`, `.composer-wrap`, `.chat-view`, `.diagnostic-view`, `.home-view`.
- Produces: mobile sin solapes entre contenido, composer y navegación inferior.

- [ ] **Step 1: usar viewport dinámico**

Update layout containers:
```css
.app-shell {
  min-height: 100dvh;
}
```

Expected: mobile no sufre saltos fuertes por barra del navegador.

- [ ] **Step 2: ajustar padding inferior móvil para composer + bottom nav**

Inside mobile media query, use:
```css
.chat-view {
  padding-bottom: calc(156px + env(safe-area-inset-bottom));
}

.composer-wrap {
  left: 16px;
  right: 16px;
  bottom: calc(76px + env(safe-area-inset-bottom));
}
```

Expected:
- El composer no tapa mensajes.
- El bottom nav no tapa el composer.
- El contenido sigue scrolleable.

- [ ] **Step 3: ajustar padding horizontal mobile**

Use:
```css
.page-pad {
  padding-left: clamp(16px, 5vw, 28px);
  padding-right: clamp(16px, 5vw, 28px);
}
```

Expected: mejor respiración en pantallas pequeñas sin desperdiciar ancho.

- [ ] **Step 4: evitar overflow horizontal**

Add:
```css
html,
body {
  overflow-x: hidden;
}
```

Expected: mensajes largos o cards no generan scroll horizontal.

- [ ] **Step 5: commit sugerido**

```bash
git add app/globals.css
git commit -m "style: improve mobile layout safe areas"
```

---

## Task 3: tokenizar colores y mejorar contraste

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: tokens existentes de Tailwind v4 y clases custom.
- Produces: base visual más mantenible y textos secundarios más legibles.

- [ ] **Step 1: agregar tokens semánticos en `:root` o `@theme inline` según estructura actual**

Add semantic custom properties near existing color tokens:
```css
:root {
  --surface: #ffffff;
  --surface-soft: #f5faf7;
  --surface-muted: #eef7f1;
  --text-strong: #17211b;
  --text-body: #36423b;
  --text-muted: #5f6b64;
  --text-subtle: #737f77;
  --brand-primary: #12c895;
  --brand-primary-strong: #0fa77d;
  --brand-primary-soft: #e7fbf4;
  --border-soft: rgba(18, 38, 27, 0.1);
  --focus-ring: rgba(18, 200, 149, 0.34);
  --danger: #b42318;
  --danger-soft: #fef3f2;
}
```

Expected: nuevos cambios usan tokens; no más colores sueltos para estados comunes.

- [ ] **Step 2: subir contraste de textos pequeños**

Replace low-contrast grays in classes like `.eyebrow`, `.feature-card small`, `.mini-note`, `.composer-wrap > p`, `.references p` with:
```css
color: var(--text-muted);
```

Expected: textos auxiliares siguen secundarios, pero no se ven lavados.

- [ ] **Step 3: usar token de error**

For `.error-message`, use:
```css
color: var(--danger);
background: var(--danger-soft);
```

Expected: error más claro y consistente.

- [ ] **Step 4: commit sugerido**

```bash
git add app/globals.css
git commit -m "style: add semantic color tokens"
```

---

## Task 4: mejorar tipografía y legibilidad

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: headings y textos existentes.
- Produces: jerarquía tipográfica más legible en mobile y respuestas largas.

- [ ] **Step 1: aplicar wrapping moderno a headings**

Add:
```css
h1,
h2,
h3 {
  text-wrap: balance;
}

p,
.lead,
.message-bubble {
  text-wrap: pretty;
}
```

Expected: menos viudas y cortes feos en títulos.

- [ ] **Step 2: subir tamaños mínimos demasiado pequeños**

Adjust these patterns:
```css
.eyebrow {
  font-size: 0.75rem;
}

.feature-card small,
.composer-wrap > p,
.references p,
.mini-note,
.nav-item span {
  font-size: 0.75rem;
}

.message-bubble {
  font-size: 0.9375rem;
  line-height: 1.55;
}
```

Expected:
- No texto funcional por debajo de 12px.
- Mensajes normativos largos se leen mejor.

- [ ] **Step 3: proteger contenido largo**

Add:
```css
.message-bubble,
.references button,
.feature-card,
.side-link,
.nav-item {
  min-width: 0;
  overflow-wrap: anywhere;
}
```

Expected: referencias largas no rompen layout.

- [ ] **Step 4: commit sugerido**

```bash
git add app/globals.css
git commit -m "style: improve typography readability"
```

---

## Task 5: estandarizar estados interactivos

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: clases existentes de botones/nav/cards.
- Produces: feedback claro para hover, active, disabled y focus-visible.

- [ ] **Step 1: definir focus visible consistente**

Use:
```css
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}
```

Expected: ningún control pierde foco visible.

- [ ] **Step 2: quitar outline débil del input si existe**

If `.composer input { outline: 0; }` exists, replace with:
```css
.composer:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px var(--focus-ring);
}

.composer input {
  outline: none;
}
```

Expected: el control compuesto muestra foco en el contenedor, no desaparece.

- [ ] **Step 3: agregar hover/active consistente**

Add or normalize:
```css
.primary-button:hover,
.send-button:hover,
.secondary-button:hover,
.example-chip:hover,
.feature-card:hover,
.icon-button:hover,
.nav-item:hover,
.side-link:hover {
  transform: translateY(-1px);
}

.primary-button:active,
.send-button:active,
.secondary-button:active,
.example-chip:active,
.feature-card:active,
.icon-button:active,
.nav-item:active,
.side-link:active {
  transform: translateY(0);
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}
```

Expected: todos los controles principales se sienten vivos y coherentes.

- [ ] **Step 4: commit sugerido**

```bash
git add app/globals.css
git commit -m "style: standardize interactive states"
```

---

## Task 6: respetar reduced motion

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: transiciones, hover transform, typing indicator y animaciones existentes.
- Produces: experiencia segura para usuarios sensibles al movimiento.

- [ ] **Step 1: agregar media query de reduced motion**

Add near the end of `app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }

  .primary-button:hover,
  .send-button:hover,
  .secondary-button:hover,
  .example-chip:hover,
  .feature-card:hover,
  .icon-button:hover,
  .nav-item:hover,
  .side-link:hover {
    transform: none;
  }
}
```

Expected: typing bounce y hover motion dejan de ser molestos con reduced motion.

- [ ] **Step 2: evitar `transition: all` si aparece**

Run:
```bash
grep -n "transition: all" app/globals.css
```

Expected: sin salida. Si aparece, reemplazar por propiedades concretas:
```css
transition: color 160ms ease, background-color 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
```

- [ ] **Step 3: commit sugerido**

```bash
git add app/globals.css
git commit -m "style: respect reduced motion preferences"
```

---

## Task 7: mejorar semántica y accesibilidad de consulta

**Files:**
- Modify: `features/consultation/consultation-composer.tsx`
- Modify: `features/consultation/message-list.tsx`

**Interfaces:**
- Consumes: `ConsultationComposerProps`, `ConsultationMessage`.
- Produces: input y mensajes más accesibles sin cambiar el flujo.

- [ ] **Step 1: añadir `name` y `autoComplete` al input**

In `consultation-composer.tsx`, update input:
```tsx
<input
  aria-label="Escribe tu consulta"
  name="consultation-question"
  autoComplete="off"
  value={input}
  onChange={(event) => onInputChange(event.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Escribe tu consulta…"
/>
```

Expected:
- Placeholder usa `…`, no `...`.
- El input tiene nombre.

- [ ] **Step 2: dar texto accesible al loading**

In `message-list.tsx`, inside the loading assistant row, add screen-reader text:
```tsx
<span className="sr-only">NormIA está preparando la respuesta.</span>
<div className="message-bubble typing" aria-hidden="true"><span /><span /><span /></div>
```

Expected: lector de pantalla no recibe solo puntos animados sin sentido.

- [ ] **Step 3: evitar referencias vacías**

Ensure condition is:
```tsx
{message.references && message.references.length > 0 && (
```

Expected: no se muestra “Fuentes consultadas” si la API devuelve `[]`.

- [ ] **Step 4: commit sugerido**

```bash
git add features/consultation/consultation-composer.tsx features/consultation/message-list.tsx
git commit -m "fix: improve consultation accessibility"
```

---

## Task 8: mejorar diagnóstico como flujo usable

**Files:**
- Modify: `features/diagnostic/diagnostic-view.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: estado local de paso en `DiagnosticView`.
- Produces: stepper más claro, navegación atrás y semántica básica.

- [ ] **Step 1: tipar función de retroceso**

Inside `DiagnosticView`, add:
```ts
const goBack = () => setStep((currentStep) => Math.max(1, currentStep - 1))
```

Expected: no baja de paso 1.

- [ ] **Step 2: agregar botón Atrás en pasos 2-4**

Render before or after the diagnostic card:
```tsx
{step > 1 && (
  <button className="secondary-button diagnostic-back" onClick={goBack}>
    Atrás
  </button>
)}
```

Expected: usuario puede corregir errores sin reiniciar todo.

- [ ] **Step 3: mejorar stepper con `aria-label` y `aria-current`**

Update stepper items:
```tsx
<div className="stepper" aria-label="Progreso del diagnóstico">
  {steps.map((label, index) => {
    const stepNumber = index + 1
    const isCurrent = stepNumber === step

    return (
      <div className={stepNumber <= step ? 'step active' : 'step'} key={label} aria-current={isCurrent ? 'step' : undefined}>
        <span>{stepNumber < step ? <Check size={14} /> : stepNumber}</span>
        <small>{label}</small>
      </div>
    )
  })}
</div>
```

Expected: progreso comunica paso actual.

- [ ] **Step 4: mejorar semántica de la primera pregunta**

Replace loose label around choices with:
```tsx
<fieldset className="diagnostic-fieldset">
  <legend>¿Cuántas personas trabajan en tu empresa?</legend>
  <div className="choice-grid">
    {['1 – 9', '10 – 49', '50 – 249', '250 o más'].map((choice) => (
      <button type="button" key={choice} onClick={() => setStep(2)}>{choice}</button>
    ))}
  </div>
</fieldset>
```

Expected: pregunta y opciones quedan agrupadas semánticamente.

- [ ] **Step 5: agregar estilos mínimos**

In `app/globals.css`, add:
```css
.diagnostic-fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}

.diagnostic-fieldset legend {
  margin-bottom: 12px;
  color: var(--text-body);
  font-weight: 700;
}

.diagnostic-back {
  align-self: flex-start;
  margin-bottom: 16px;
}
```

Expected: visual igual o mejor, pero semántica superior.

- [ ] **Step 6: commit sugerido**

```bash
git add features/diagnostic/diagnostic-view.tsx app/globals.css
git commit -m "feat: improve diagnostic navigation"
```

---

## Task 9: decidir navegación URL-backed sin romper el alcance

**Files:**
- Modify: `components/layout/app-shell.tsx`
- Modify: `features/home/home-view.tsx` if interface changes are needed
- Modify: `components/layout/bottom-nav.tsx` if interface changes are needed
- Modify: `components/layout/sidebar.tsx` if interface changes are needed

**Interfaces:**
- Consumes: `AppView`.
- Produces: navegación que sobrevive refresh/back y permite enlaces compartibles.

- [ ] **Step 1: escoger implementación simple**

Recommended for this app:
```md
Decision: use query param `?view=home|consulta|diagnostico` instead of creating route files now.
Reason: preserves single-page shell and avoids a routing refactor while fixing refresh/deep-link behavior.
```

Expected: si se prefiere rutas reales, convertir esta task en plan separado. No mezclar ambos enfoques.

- [ ] **Step 2: implementar lectura de query param**

In `app-shell.tsx`, import:
```ts
import { useRouter, useSearchParams } from 'next/navigation'
```

Add helper:
```ts
function toAppView(value: string | null): AppView {
  if (value === 'consulta' || value === 'diagnostico') return value
  return 'home'
}
```

Expected: valores inválidos caen a `home`.

- [ ] **Step 3: reemplazar estado local por URL como fuente de verdad**

Inside `AppShell`:
```tsx
const router = useRouter()
const searchParams = useSearchParams()
const view = toAppView(searchParams.get('view'))

const navigate = (nextView: AppView) => {
  router.push(nextView === 'home' ? '/' : `/?view=${nextView}`)
}
```

Expected: refresh conserva vista si URL tiene `view`.

- [ ] **Step 4: pasar `navigate` a todas las navegaciones**

Expected:
```tsx
<Sidebar active={view} onNavigate={navigate} />
<HomeView onNavigate={navigate} />
<BottomNav active={view} onNavigate={navigate} />
```

- [ ] **Step 5: probar manualmente back/refresh**

Expected:
- `/?view=consulta` abre Consulta.
- `/?view=diagnostico` abre Diagnóstico.
- Back del navegador vuelve a la vista anterior.

- [ ] **Step 6: commit sugerido**

```bash
git add components/layout/app-shell.tsx components/layout/bottom-nav.tsx components/layout/sidebar.tsx features/home/home-view.tsx
git commit -m "feat: persist active view in url"
```

---

## Task 10: limpiar expectativas rotas y metadata

**Files:**
- Modify: `components/layout/top-bar.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: UI actual sin pantalla de configuración.
- Produces: menos affordances falsas.

- [ ] **Step 1: decidir botón de configuración**

Recommended:
```md
Decision: hide settings button until settings exist.
Reason: an icon button without behavior creates a broken expectation.
```

Expected: si no hay pantalla de configuración, no mostrar el botón.

- [ ] **Step 2: quitar botón settings si no tiene funcionalidad**

In `top-bar.tsx`, remove:
```tsx
<button className="icon-button" aria-label="Configuración">
  <Settings2 size={18} />
</button>
```

Also remove:
```ts
import { Settings2 } from 'lucide-react'
```

Expected: TopBar no promete configuración inexistente.

- [ ] **Step 3: quitar generator heredado si se decide limpiar metadata**

In `app/layout.tsx`, remove:
```ts
generator: 'v0.app',
```

Expected: metadata queda alineada con producto propio.

- [ ] **Step 4: commit sugerido**

```bash
git add components/layout/top-bar.tsx app/layout.tsx
git commit -m "chore: remove inactive UI affordances"
```

---

## Task 11: verificación final

**Files:**
- Read: `app/globals.css`
- Read: `components/layout/*`
- Read: `features/consultation/*`
- Read: `features/diagnostic/*`

**Interfaces:**
- Consumes: todos los cambios anteriores.
- Produces: evidencia de que la UI mejora sin romper flujos.

- [ ] **Step 1: buscar CSS/props muertos del sidebar móvil**

Run:
```bash
grep -R "mobile-only\|menu-line\|sidebar open\|menuOpen\|onMenu" -n app components features
```

Expected: sin salida relevante.

- [ ] **Step 2: typecheck**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: exit code `0`.

- [ ] **Step 3: build**

Run:
```bash
pnpm build
```

Expected: build exitoso.

- [ ] **Step 4: QA manual desktop**

Checklist:
- Desktop muestra sidebar.
- Sidebar cambia Home, Consulta y Diagnóstico.
- TopBar no muestra hamburguesa.
- Bottom nav no aparece en desktop.
- Focus visible funciona con Tab.

- [ ] **Step 5: QA manual mobile**

Checklist:
- No aparece sidebar.
- No aparece botón hamburguesa.
- Bottom nav aparece como navegación única.
- Composer no tapa bottom nav.
- Bottom nav respeta safe-area.
- Consulta soporta respuesta larga sin scroll horizontal.
- Diagnóstico permite avanzar y volver atrás.

- [ ] **Step 6: QA motion/accessibility**

Checklist:
- Con reduced motion activo, desaparecen animaciones innecesarias.
- Input de consulta tiene `name` y `autocomplete`.
- Loading del chat tiene texto accesible.
- Stepper comunica paso actual.

- [ ] **Step 7: commit final sugerido**

```bash
git add app components features shared
git commit -m "feat: improve responsive ui ux"
```

---

## Criterio de aceptación

- En mobile no existe sidebar visual, off-canvas ni botón hamburguesa.
- En mobile la navegación principal es solo `BottomNav`.
- En desktop el sidebar sigue funcionando.
- La distribución móvil respeta `env(safe-area-inset-bottom)`.
- El composer no se solapa con bottom nav ni tapa mensajes importantes.
- Textos pequeños suben a tamaños legibles y mensajes largos no rompen layout.
- Estados hover, active y focus-visible son consistentes.
- La UI respeta `prefers-reduced-motion`.
- Consulta mejora accesibilidad de input/loading/referencias.
- Diagnóstico tiene navegación atrás y semántica de progreso mejorada.
- Si se implementa Task 9, refresh/back/deep-link funcionan con `?view=`.
- `pnpm exec tsc --noEmit` pasa.
- `pnpm build` pasa.

## Orden recomendado de implementación

1. Task 1: quitar sidebar mobile.
2. Task 2: arreglar distribución móvil y safe-area.
3. Task 5 + Task 6: estados interactivos y reduced motion.
4. Task 7: consulta accesible.
5. Task 8: diagnóstico usable.
6. Task 3 + Task 4: tokens y tipografía.
7. Task 10: limpiar affordances falsas.
8. Task 9: navegación en URL, si se quiere cerrar el problema de refresh/back en este ciclo.
9. Task 11: verificación final.

## Fuera de alcance

- Rediseño visual total.
- Dark mode.
- Nueva librería de componentes.
- Migrar todo a clases Tailwind inline.
- Streaming de respuesta de IA.
- Rutas separadas de Next por feature, salvo que se convierta en plan aparte.

## Riesgos

- Cambiar navegación a URL puede tocar más flujo que una mejora visual; si el tiempo es corto, hacerlo después de arreglar mobile.
- Tocar muchos estilos en un solo commit dificulta review. Mantener commits por tarea, no un “mega CSS commit”.
- Eliminar el sidebar móvil mejora claridad, pero obliga a que `BottomNav` sea impecable en contraste, hit target y safe-area. Si no, cambiamos duplicación por navegación pobre.
