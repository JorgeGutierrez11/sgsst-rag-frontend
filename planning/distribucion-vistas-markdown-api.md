# Distribución de vistas y Markdown de API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** mejorar la distribución vertical de las vistas centrales para que el contenido base quepa en la altura de pantalla estándar y renderizar Markdown recibido desde la API en respuestas de consulta.

**Architecture:** mantener la arquitectura actual por `components/layout` y `features/*`. La distribución se resuelve en CSS con `100dvh`, variables de altura, `clamp()` y scroll interno solo donde el contenido puede crecer. El Markdown se encapsula en un componente pequeño de la feature de consulta para que `MessageList` no mezcle parsing, estilos y estructura de mensajes.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.7, Tailwind CSS v4, CSS custom properties, `react-markdown`, `remark-gfm`.

## Global Constraints

- La pantalla base no debería requerir scroll para ver el contenido principal en tamaños estándar.
- Usar `100dvh`, no depender solo de `100vh`, por barras dinámicas en mobile.
- En pantallas pequeñas o contenido largo, permitir scroll interno controlado; no cortar contenido.
- No romper la navegación móvil con `BottomNav`.
- No reintroducir sidebar móvil.
- Las respuestas de la API pueden incluir Markdown con títulos, negrita, listas y tablas.
- Renderizar Markdown solo para mensajes del asistente; los mensajes del usuario deben seguir como texto simple.
- No habilitar HTML crudo desde Markdown. NO usar `rehypeRaw`.
- Mantener copy visible en español.
- Verificar con `pnpm exec tsc --noEmit` antes de `pnpm build`.

---

## Estado actual verificado

- `components/layout/app-shell.tsx` renderiza `Sidebar`, `TopBar`, vista activa y `BottomNav`.
- La navegación ya está respaldada por `?view=home|consulta|diagnostico`.
- `features/consultation/message-list.tsx` imprime `message.content` como texto plano.
- `features/consultation/consultation.types.ts` define `ConsultationMessage.content` como `string`, compatible con Markdown.
- `features/consultation/consultation-view.tsx` ya consume API real mediante `queryConsultation` y guarda `response.answer` en `content`.
- `features/diagnostic/diagnostic-view.tsx` tiene stepper y botón “Atrás”.
- Los estilos globales siguen centralizados en `app/globals.css`.
- `package.json` todavía no incluye `react-markdown` ni `remark-gfm`.

## File map

### Crear

- `features/consultation/markdown-message.tsx`: render seguro de Markdown para respuestas del asistente.

### Modificar

- `package.json`: agregar `react-markdown` y `remark-gfm`.
- `pnpm-lock.yaml`: actualizar con pnpm.
- `features/consultation/message-list.tsx`: usar Markdown solo para mensajes assistant.
- `app/globals.css`: layout vertical, alturas estándar, scroll interno, estilos Markdown y tablas.
- `features/home/home-view.tsx`: ajustar estructura solo si el CSS necesita clases adicionales para compactar distribución.
- `features/diagnostic/diagnostic-view.tsx`: ajustar estructura solo si el contenido no cabe bien en pantallas estándar.

### No modificar

- No cambiar el contrato de API.
- No cambiar `ConsultationQueryResponse.answer`; sigue siendo `string`.
- No introducir sanitizers extra si no se habilita HTML crudo.
- No meter Markdown en los mensajes del usuario.

---

## Restricciones de pantalla objetivo

Usar estas alturas como referencia de QA manual:

- Mobile pequeño: `360x640`.
- Mobile moderno: `390x844`.
- Tablet vertical: `768x1024`.
- Laptop común: `1366x768`.
- Desktop: `1440x900`.

Regla: Home y Diagnóstico deberían mostrar su contenido base sin scroll en esas alturas. Consulta puede tener scroll interno en mensajes cuando existe conversación, pero el header, composer y navegación deben permanecer accesibles.

---

## Task 1: instalar render Markdown seguro

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: respuesta `answer: string` de la API.
- Produces: dependencias para render Markdown CommonMark + GitHub Flavored Markdown.

- [ ] **Step 1: agregar dependencias**

Run:
```bash
pnpm add react-markdown remark-gfm
```

Expected:
- `package.json` incluye `react-markdown` y `remark-gfm`.
- `pnpm-lock.yaml` queda actualizado.

- [ ] **Step 2: confirmar que no se instaló parser innecesario de HTML**

Run:
```bash
grep -n "rehype-raw\|rehypeRaw" package.json pnpm-lock.yaml
```

Expected: sin salida. No necesitamos HTML crudo; Markdown basta.

- [ ] **Step 3: commit sugerido**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add markdown rendering dependencies"
```

---

## Task 2: crear componente Markdown encapsulado

**Files:**
- Create: `features/consultation/markdown-message.tsx`

**Interfaces:**
- Consumes: `content: string`.
- Produces: `<MarkdownMessage content={message.content} />`.

- [ ] **Step 1: crear `MarkdownMessage`**

Use:
```tsx
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownMessageProps = {
  content: string
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="markdown-message">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  )
}
```

Expected:
- No usar `rehypeRaw`.
- No usar `dangerouslySetInnerHTML`.
- El componente solo renderiza Markdown; no conoce roles ni referencias.

- [ ] **Step 2: revisar responsabilidad única**

Expected:
- `MarkdownMessage` no hace fetch.
- `MarkdownMessage` no decide si el mensaje es del usuario o asistente.
- `MarkdownMessage` no renderiza referencias.

- [ ] **Step 3: commit sugerido**

```bash
git add features/consultation/markdown-message.tsx
git commit -m "feat: add markdown message renderer"
```

---

## Task 3: usar Markdown solo para respuestas del asistente

**Files:**
- Modify: `features/consultation/message-list.tsx`

**Interfaces:**
- Consumes: `MarkdownMessage`.
- Produces: mensajes assistant con Markdown; mensajes user como texto plano.

- [ ] **Step 1: importar renderer**

Add:
```tsx
import { MarkdownMessage } from '@/features/consultation/markdown-message'
```

- [ ] **Step 2: reemplazar render de contenido**

Replace:
```tsx
{message.content}
```

With:
```tsx
{message.role === 'assistant' ? (
  <MarkdownMessage content={message.content} />
) : (
  <p className="plain-message">{message.content}</p>
)}
```

Expected:
- La pregunta del usuario no se interpreta como Markdown.
- La respuesta de API sí soporta `# título`, `**negrita**`, listas y tablas.

- [ ] **Step 3: mantener referencias separadas del Markdown**

Keep references block after content:
```tsx
{message.references && message.references.length > 0 && (
  <div className="references">
    ...
  </div>
)}
```

Expected: referencias del contrato API siguen siendo UI propia, no Markdown mezclado.

---

## Task 4: estilizar Markdown y tablas dentro del chat

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `.markdown-message`, `.message-bubble`, `.plain-message`.
- Produces: Markdown legible dentro de burbujas sin romper mobile.

- [ ] **Step 1: agregar estilos base Markdown**

Add near consultation/message styles:
```css
.plain-message,
.markdown-message {
  margin: 0;
  color: inherit;
}

.markdown-message > *:first-child {
  margin-top: 0;
}

.markdown-message > *:last-child {
  margin-bottom: 0;
}

.markdown-message p,
.markdown-message ul,
.markdown-message ol,
.markdown-message blockquote,
.markdown-message table {
  margin: 0 0 12px;
}

.markdown-message h1,
.markdown-message h2,
.markdown-message h3 {
  margin: 14px 0 8px;
  color: var(--text-strong);
  font-weight: 800;
  line-height: 1.2;
  text-wrap: balance;
}

.markdown-message h1 {
  font-size: 1.15rem;
}

.markdown-message h2 {
  font-size: 1.05rem;
}

.markdown-message h3 {
  font-size: 1rem;
}

.markdown-message strong {
  color: var(--text-strong);
  font-weight: 800;
}

.markdown-message ul,
.markdown-message ol {
  padding-left: 1.2rem;
}

.markdown-message li + li {
  margin-top: 6px;
}
```

Expected: títulos y negritas se ven claros, pero no gigantes dentro de una burbuja.

- [ ] **Step 2: agregar soporte responsive para tablas**

Because Markdown tables can overflow mobile, add:
```css
.markdown-message table {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  border: 1px solid var(--border-soft);
  border-radius: 14px;
}

.markdown-message th,
.markdown-message td {
  min-width: 120px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-soft);
  text-align: left;
  vertical-align: top;
}

.markdown-message th {
  background: var(--surface-muted);
  color: var(--text-strong);
  font-weight: 800;
}

.markdown-message td {
  color: var(--text-body);
}
```

Expected: tablas no rompen el ancho; hacen scroll horizontal dentro de la burbuja si hace falta.

- [ ] **Step 3: proteger contenido largo**

Ensure these styles exist:
```css
.message-bubble,
.markdown-message,
.plain-message {
  min-width: 0;
  overflow-wrap: anywhere;
}
```

Expected: URLs, normas largas o celdas extensas no revientan el layout.

---

## Task 5: crear restricciones verticales estándar para vistas centrales

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `.app-shell`, `.main-column`, `.topbar`, `.page-pad`, `.home-view`, `.chat-view`, `.diagnostic-view`, `.bottom-nav`, `.composer-wrap`.
- Produces: vistas con altura útil calculada y scroll interno controlado.

- [ ] **Step 1: definir variables de layout**

Add near root/layout styles:
```css
:root {
  --topbar-height: 72px;
  --bottom-nav-height: 76px;
  --composer-height: 92px;
  --desktop-page-y: clamp(20px, 3vh, 36px);
  --mobile-page-y: clamp(14px, 2.5vh, 22px);
}
```

Expected: alturas no quedan como números mágicos regados por el CSS.

- [ ] **Step 2: hacer que columna central use altura de pantalla**

Use:
```css
.app-shell {
  min-height: 100dvh;
}

.main-column {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: var(--topbar-height) minmax(0, 1fr);
}
```

Expected: la vista activa recibe un área central clara debajo del topbar.

- [ ] **Step 3: estandarizar `page-pad` para altura útil**

Use:
```css
.page-pad {
  min-height: calc(100dvh - var(--topbar-height));
  padding-block: var(--desktop-page-y);
}
```

Expected: Home y Diagnóstico pueden centrar su contenido sin depender de scroll base.

- [ ] **Step 4: ajustar mobile por bottom nav**

Inside mobile media query:
```css
.main-column {
  grid-template-rows: var(--topbar-height) minmax(0, 1fr);
  padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
}

.page-pad {
  min-height: calc(100dvh - var(--topbar-height) - var(--bottom-nav-height) - env(safe-area-inset-bottom));
  padding-block: var(--mobile-page-y);
}
```

Expected: contenido base considera topbar + bottom nav + safe-area.

---

## Task 6: compactar Home para que quepa sin scroll base

**Files:**
- Modify: `app/globals.css`
- Modify: `features/home/home-view.tsx` only if class hooks are missing.

**Interfaces:**
- Consumes: `.home-view`, `.welcome-block`, `.action-grid`, `.feature-card`, `.trust-note`.
- Produces: Home verticalmente equilibrado en laptop y mobile estándar.

- [ ] **Step 1: centrar Home dentro de la altura útil**

Use:
```css
.home-view {
  display: grid;
  align-content: center;
  gap: clamp(18px, 3vh, 28px);
}
```

Expected: en pantallas altas no queda pegado arriba; en pantallas estándar no obliga scroll.

- [ ] **Step 2: reducir gaps excesivos con `clamp`**

Normalize:
```css
.welcome-block {
  gap: clamp(10px, 1.8vh, 18px);
}

.action-grid {
  gap: clamp(10px, 1.6vh, 16px);
}
```

Expected: el contenido respira sin volverse una columna demasiado larga.

- [ ] **Step 3: controlar tamaños de título**

Use:
```css
.welcome-block h1 {
  font-size: clamp(2rem, 7vw, 3rem);
  line-height: 1.04;
}

.lead {
  max-width: 42rem;
}
```

Expected: título grande pero no empuja contenido fuera de viewport.

- [ ] **Step 4: QA de Home**

Check viewport sizes:
- `360x640`
- `390x844`
- `1366x768`

Expected: CTA, cards y trust note son visibles sin scroll inicial o con scroll mínimo solo en `360x640` si el navegador reduce altura útil.

---

## Task 7: compactar Diagnóstico para altura de pantalla

**Files:**
- Modify: `app/globals.css`
- Modify: `features/diagnostic/diagnostic-view.tsx` only if class hooks are missing.

**Interfaces:**
- Consumes: `.diagnostic-view`, `.view-heading`, `.stepper`, `.diagnostic-card`, `.diagnostic-back`.
- Produces: diagnóstico usable sin scroll base en pantallas estándar.

- [ ] **Step 1: distribuir diagnóstico como grid vertical**

Use:
```css
.diagnostic-view {
  display: grid;
  align-content: center;
  gap: clamp(12px, 2vh, 20px);
}
```

Expected: stepper, card y botón atrás caben mejor en laptop/mobile estándar.

- [ ] **Step 2: compactar heading del diagnóstico**

Use:
```css
.view-heading {
  gap: 6px;
}

.view-heading h1 {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
}

.view-heading p:not(.eyebrow) {
  max-width: 42rem;
}
```

Expected: heading claro sin dominar toda la pantalla.

- [ ] **Step 3: limitar altura de card con scroll interno solo si hace falta**

Use:
```css
.diagnostic-card {
  max-height: min(520px, calc(100dvh - var(--topbar-height) - 220px));
  overflow: auto;
}
```

Expected: en contenido futuro más largo, scrollea la card, no toda la pantalla.

- [ ] **Step 4: QA de Diagnóstico**

Manual flow:
1. Abrir `/?view=diagnostico`.
2. Revisar pasos 1, 2, 3 y 4 en `390x844` y `1366x768`.
3. Usar “Atrás”.

Expected: stepper, card y acciones principales quedan visibles.

---

## Task 8: ajustar Consulta con área de mensajes flexible

**Files:**
- Modify: `app/globals.css`
- Modify: `features/consultation/consultation-view.tsx` only if class hooks are missing.

**Interfaces:**
- Consumes: `.chat-view`, `.chat-intro`, `.empty-chat`, `.messages`, `.composer-wrap`.
- Produces: consulta que no exige scroll base antes de conversar y usa scroll interno para mensajes.

- [ ] **Step 1: convertir consulta en grid de pantalla**

Use:
```css
.chat-view {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: clamp(12px, 2vh, 18px);
  min-height: calc(100dvh - var(--topbar-height));
}
```

Expected: intro arriba, contenido flexible en medio, composer abajo.

- [ ] **Step 2: controlar empty state sin scroll base**

Use:
```css
.empty-chat {
  align-self: center;
  max-width: 680px;
  margin-inline: auto;
}
```

Expected: preguntas directas quedan centradas y visibles.

- [ ] **Step 3: hacer mensajes scrolleables internamente**

Use:
```css
.messages {
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}
```

Expected: cuando hay muchas respuestas, scrollea la lista de mensajes, no se pierde el composer.

- [ ] **Step 4: ajustar composer dentro del flujo o fijo según CSS actual**

Preferred direction:
```css
.composer-wrap {
  position: sticky;
  bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
}
```

Expected: composer sigue accesible sin tapar mensajes.

- [ ] **Step 5: mobile override para consulta**

Inside mobile media query:
```css
.chat-view {
  min-height: calc(100dvh - var(--topbar-height) - var(--bottom-nav-height) - env(safe-area-inset-bottom));
  padding-bottom: var(--mobile-page-y);
}
```

Expected: bottom nav no tapa el composer.

- [ ] **Step 6: QA de Consulta**

Manual flow:
1. Abrir `/?view=consulta`.
2. Ver empty state sin scroll base.
3. Enviar varias preguntas.
4. Confirmar que mensajes scrollean y composer sigue visible.


---

## Task 9: verificar Markdown con ejemplos reales

**Files:**
- No code changes expected unless bugs appear.

**Interfaces:**
- Consumes: API local `http://127.0.0.1:8000/api/v1/query`.
- Produces: evidencia de que la UI soporta Markdown real.

- [ ] **Step 1: probar respuesta con título y negrita**

Use API/backend response containing:
```md
## Estándares mínimos

La empresa debe cumplir **7 estándares mínimos** según su tamaño y nivel de riesgo.
```

Expected: título y negrita se renderizan visualmente.

- [ ] **Step 2: probar respuesta con tabla**

Use API/backend response containing:
```md
| Criterio | Aplicación |
| --- | --- |
| Trabajadores | 8 |
| Riesgo | I |
| Estándares | Grupo de diez o menos trabajadores |
```

Expected: tabla se renderiza y no rompe mobile; si excede ancho, tiene scroll horizontal interno.

- [ ] **Step 3: confirmar que HTML crudo no se ejecuta**

Use API/backend response containing:
```md
<script>alert('xss')</script>
```

Expected: no se ejecuta JavaScript. Si se muestra texto escapado, está bien.

---

## Task 10: verificación final técnica y responsive

**Files:**
- Read: `package.json`
- Read: `app/globals.css`
- Read: `features/consultation/*`
- Read: `features/home/home-view.tsx`
- Read: `features/diagnostic/diagnostic-view.tsx`

**Interfaces:**
- Consumes: todos los cambios anteriores.
- Produces: prueba mínima de que el cambio no rompió UI ni build.

- [ ] **Step 1: typecheck**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: exit code `0`.

- [ ] **Step 2: build**

Run:
```bash
pnpm build
```

Expected: build exitoso.

- [ ] **Step 3: revisar dependencias instaladas**

Run:
```bash
grep -n "react-markdown\|remark-gfm" package.json
```

Expected: ambas dependencias aparecen.

- [ ] **Step 4: QA responsive estándar**

Check manually:
- `360x640`: puede necesitar scroll mínimo solo si el navegador reduce altura útil, pero no debe haber contenido tapado.
- `390x844`: Home y Diagnóstico sin scroll base; Consulta con mensajes internos.
- `768x1024`: distribución centrada, sin espacios muertos exagerados.
- `1366x768`: contenido central visible sin scroll base.
- `1440x900`: contenido no queda pegado arriba; se mantiene centrado.

- [ ] **Step 5: QA de no regresión mobile nav**

Expected:
- No aparece sidebar móvil.
- `BottomNav` sigue usable.
- Composer y bottom nav no se solapan.

---

## Criterio de aceptación

- Home cabe de base en la altura útil de pantallas estándar.
- Diagnóstico cabe de base en la altura útil de pantallas estándar.
- Consulta mantiene intro/composer/navegación accesibles; los mensajes largos usan scroll interno.
- No hay sidebar móvil ni botón hamburguesa reintroducido.
- `answer` de API se renderiza como Markdown para mensajes assistant.
- Mensajes del usuario se renderizan como texto plano.
- Markdown soporta títulos, negrita, listas y tablas.
- Tablas Markdown no rompen mobile; usan overflow horizontal interno.
- No se habilita HTML crudo ni `dangerouslySetInnerHTML`.
- `pnpm exec tsc --noEmit` pasa.
- `pnpm build` pasa.

## Riesgos

- “Sin scroll” no puede ser absoluto: si el usuario tiene zoom alto, texto muy largo, teclado abierto o una pantalla muy baja, debe existir scroll controlado. Lo correcto es diseñar para no necesitar scroll en el estado base, no prohibir scroll.
- Las tablas Markdown pueden ser anchas por naturaleza. La solución sana es scroll horizontal interno dentro de la burbuja, no achicar texto hasta hacerlo ilegible.
- `react-markdown` agrega bundle al cliente. Aceptable porque solo se usa en consulta; no importarlo globalmente ni en layout.
