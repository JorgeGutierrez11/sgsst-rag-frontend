# Pulir chat con estética Clean Tech Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** mejorar la estética del chat de NormIA usando la paleta de la referencia Clean Tech / neumórfica suave, manteniendo la identidad funcional de una herramienta normativa.

**Architecture:** aplicar el cambio como una capa visual sobre la arquitectura existente: tokens globales de diseño, layout shell, sidebar desktop, navegación móvil, vista de consulta, composer, chips, mensajes Markdown y modal de fuentes. No cambiar el contrato de API ni la lógica funcional salvo clases/estructura mínima necesaria para lograr el diseño.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.7, Tailwind CSS v4, CSS variables HSL, Lucide icons, react-markdown.

## Global Constraints

- Usar la imagen como referencia estética, no copiar nombres ni contexto crypto.
- Mantener marca NormIA y copy en español.
- Usar los colores de la referencia como base visual: canvas `#F4F5F7`, cards `#FFFFFF`, verde menta primario `#00E599` / `#00D68F`, texto principal `#111827` y texto secundario `#6B7280`.
- Reforzar el estilo Clean Tech: canvas gris frío, cards blancas flotantes, radios 20–28px, sombras suaves, glow menta radial.
- No reintroducir sidebar móvil. Mobile sigue usando solo `BottomNav`.
- No cambiar API de consulta ni inventar respuestas.
- No agregar librerías nuevas.
- Respetar accesibilidad: foco visible, aria-labels, contraste suficiente, reduced motion.
- Verificar con `pnpm exec tsc --noEmit` antes de `pnpm build`.
- No incluir pasos de commit en este plan; el usuario hará los commits manualmente.

---

## Dirección visual objetivo

### Paleta

- Canvas: `#F4F5F7`.
- Card: `#FFFFFF`.
- Soft surface: `#EAEBED`.
- Accent primary: `#00E599`.
- Accent hover/strong: `#00D68F`.
- Texto principal: `#111827`.
- Texto secundario/muted: `#6B7280`.
- Borde sutil: `#E5E7EB`.
- Glow: `rgba(0, 229, 153, 0.25)` convertido a token HSL con alpha.

### Forma y profundidad

- Cards grandes: `rounded-[24px]` a `rounded-[28px]`.
- Composer: `rounded-[28px]` o `rounded-[32px]`.
- Chips/píldoras: `rounded-full`.
- Sombras: suaves, difusas, sin dramatismo.
- Glow: radial menta suave detrás del hero/composer.

### Layout

- Desktop: canvas general con padding `16px–20px`; sidebar y main como paneles flotantes independientes.
- Mobile: una sola columna, sin sidebar, bottom nav limpia y composer protagonista.
- Consulta empty state: hero centrado, glow menta, chips horizontales/flex-wrap y composer grande.
- Consulta con mensajes: mantener composer accesible, mensajes legibles y referencias claras.

---

## Estado actual verificado

- La UI ya usa Tailwind colocado en componentes en varias zonas.
- `components/layout/sidebar.tsx` es desktop-only con clases Tailwind.
- `components/layout/bottom-nav.tsx` es mobile-only.
- `features/consultation/components/consultation-composer.tsx` usa composer compacto tipo cápsula.
- `features/consultation/components/message-list.tsx` renderiza mensajes con burbujas y Markdown.
- `features/consultation/components/markdown-message.tsx` usa `react-markdown` + `remark-gfm`.
- `app/globals.css` aún conserva tokens, base y posibles restos/ayudas globales.

## File map

### Modificar

- `app/globals.css`: ajustar tokens de color/sombra/radio para la nueva estética.
- `tailwind.config.ts`: exponer sombras/radios/glows si aún no están.
- `components/layout/app-shell.tsx`: convertir el canvas en layout de paneles flotantes.
- `components/layout/sidebar.tsx`: estilo card neumórfica desktop.
- `components/layout/top-bar.tsx`: topbar flotante/simple según nuevo main panel.
- `components/layout/bottom-nav.tsx`: adaptar a cápsula móvil flotante.
- `features/consultation/consultation-view.tsx`: hero state y distribución del chat.
- `features/consultation/components/consultation-composer.tsx`: input box grande inspirado en referencia.
- `features/consultation/components/message-list.tsx`: burbujas más limpias y consistentes con el nuevo diseño.
- `features/consultation/components/chunk-modal.tsx`: modal con misma estética.
- `features/home/home-view.tsx`: alinear cards/chips con la estética general.
- `features/diagnostic/diagnostic-view.tsx`: alinear cards/stepper con la estética general.

### No modificar

- Cliente API de consulta.
- Tipos de request/response.
- Render Markdown seguro sin HTML crudo.
- Navegación mobile-only con `BottomNav`.

---

## Task 1: ajustar tokens visuales Clean Tech

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Consumes: tokens actuales `capa`, `brand`, `txt`, `borde`, `status`.
- Produces: sistema visual más cercano a la referencia sin hardcodear colores por componente.

- [ ] **Step 1: ajustar tokens base usando la paleta de referencia**

Use this direction in `:root`:
```css
:root {
  --bg-main: 220 16% 96%; /* #F4F5F7 */
  --bg-surface: 0 0% 100%;
  --bg-soft: 220 5% 92%; /* #EAEBED */
  --bg-muted: 160 72% 94%;

  --brand-primary: 160 100% 45%; /* #00E599 */
  --brand-dark: 160 100% 42%; /* #00D68F */
  --brand-light: 160 100% 92%;
  --brand-text: 0 0% 100%;

  --borde-light: 220 13% 91%; /* #E5E7EB */
  --borde-gray: 220 12% 86%;
  --borde-strong: 220 10% 76%;

  --txt-main: 221 39% 11%; /* #111827 */
  --txt-bold: 222 47% 8%;
  --txt-medium: 215 16% 35%;
  --txt-muted: 220 9% 46%; /* #6B7280 */
  --txt-subtle: 215 12% 56%;

  --glow-primary: 160 100% 45%;
  --shadow-soft: 220 20% 35%;
  --shadow-brand: 160 100% 45%;
  --radius-panel: 28px;
  --radius-card: 24px;
  --radius-control: 18px;
}
```

Expected: el fondo general usa la referencia `#F4F5F7`, las superficies usan blanco, y el acento principal queda en el rango `#00E599` / `#00D68F`.

- [ ] **Step 2: exponer radios/sombras en Tailwind**

In `tailwind.config.ts`, ensure:
```ts
borderRadius: {
  panel: 'var(--radius-panel)',
  card: 'var(--radius-card)',
  control: 'var(--radius-control)',
},
boxShadow: {
  panel: '0 18px 48px hsl(var(--shadow-soft) / 0.10)',
  soft: '0 10px 25px hsl(var(--shadow-soft) / 0.08)',
  glow: '0 0 0 8px hsl(var(--shadow-brand) / 0.08), 0 18px 60px hsl(var(--shadow-brand) / 0.22)',
}
```

Expected: componentes usan `rounded-panel`, `rounded-card`, `shadow-panel`, `shadow-glow`.

---

## Task 2: convertir shell desktop en paneles flotantes

**Files:**
- Modify: `components/layout/app-shell.tsx`
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/top-bar.tsx`

**Interfaces:**
- Consumes: `Sidebar`, `TopBar`, vista activa.
- Produces: layout desktop con canvas gris y paneles blancos redondeados.

- [ ] **Step 1: ajustar canvas del shell**

In `AppShell`, target:
```tsx
<main className="min-h-dvh bg-capa-main p-3 md:p-4">
  <div className="mx-auto flex min-h-[calc(100dvh-24px)] max-w-[1440px] gap-3 md:min-h-[calc(100dvh-32px)] md:gap-4">
    <Sidebar active={activeRoute.id} />
    <section className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-panel bg-capa-surface shadow-panel">
      <TopBar title={activeRoute.label} />
      {children}
    </section>
  </div>
  <BottomNav active={activeRoute.id} />
</main>
```

Expected:
- Desktop se ve como dos cards flotantes.
- Mobile sigue una columna, sin sidebar.
- Main content ya no se siente pegado al canvas.

- [ ] **Step 2: convertir sidebar en card independiente**

Target class:
```tsx
<aside className="relative hidden w-[276px] overflow-hidden rounded-panel border border-white/70 bg-capa-surface p-4 shadow-panel md:flex md:flex-col">
```

Add decorative glow at bottom:
```tsx
<div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_center,hsl(var(--glow-primary)/0.28),transparent_68%)] blur-2xl" aria-hidden="true" />
```

Expected: sidebar conserva funcionalidad pero se acerca a la tarjeta izquierda de referencia.

- [ ] **Step 3: simplificar topbar para main panel**

Target:
```tsx
<header className="flex items-center justify-between px-4 py-4 md:px-6">
```

Expected: sin borde pesado; topbar respira dentro del panel principal.

---

## Task 3: mejorar navegación lateral y bottom nav

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/bottom-nav.tsx`

**Interfaces:**
- Consumes: `navigationRoutes`.
- Produces: navegación más premium, clara y táctil.

- [ ] **Step 1: estilo sidebar links como pills suaves**

Use active link style:
```tsx
'flex min-w-0 items-center gap-3 rounded-full bg-capa-main px-3.5 py-3 text-left text-[13px] font-bold text-txt-bold shadow-sm transition wrap-anywhere'
```

Use inactive link style:
```tsx
'flex min-w-0 items-center gap-3 rounded-full px-3.5 py-3 text-left text-[13px] text-txt-muted transition hover:bg-capa-main hover:text-txt-bold wrap-anywhere'
```

Expected: navegación más parecida a píldoras suaves, sin perder legibilidad.

- [ ] **Step 2: agregar botón “Nueva consulta” si aporta al chat**

If the app has a way to reset conversation, add a top action. If not, do not fake behavior.

Recommended for now:
```md
No agregar “Nueva consulta” hasta que exista una función real para limpiar conversación o crear conversación nueva.
```

Expected: no botones decorativos sin comportamiento. Esto importa: UI bonita que miente es peor que UI simple.

- [ ] **Step 3: convertir bottom nav en cápsula flotante mobile**

Target:
```tsx
<nav className="fixed inset-x-4 bottom-3 z-40 grid min-h-16 grid-cols-3 rounded-full border border-white/70 bg-capa-surface/95 px-3 py-2 shadow-panel backdrop-blur md:hidden" aria-label="Navegación principal">
```

Expected:
- Mobile conserva bottom nav.
- Se siente como objeto flotante, no barra pegada al borde.
- Respeta `env(safe-area-inset-bottom)` si ya se usa; si no, añadir `bottom-[calc(12px+env(safe-area-inset-bottom))]`.

---

## Task 4: rediseñar empty state de consulta como hero Clean Tech

**Files:**
- Modify: `features/consultation/consultation-view.tsx`

**Interfaces:**
- Consumes: `consultationExamples`, `send(example)`, estado `messages.length`.
- Produces: estado inicial del chat inspirado en la referencia.

- [ ] **Step 1: crear hero central con glow menta**

For the empty state, target structure:
```tsx
<div className="relative grid min-h-0 place-items-center overflow-hidden px-2 py-6">
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--glow-primary)/0.20),transparent_58%)]" aria-hidden="true" />
  <div className="relative grid w-full max-w-3xl justify-items-center gap-6 text-center">
    <div className="grid size-16 place-items-center rounded-full bg-brand-light text-brand-primary shadow-glow ring-8 ring-brand-primary/10">
      <MessageCircle size={28} />
    </div>
    <div className="grid gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-txt-muted">Consulta normativa</p>
      <h1 className="text-balance text-2xl font-extrabold tracking-[-0.04em] text-txt-bold md:text-3xl">
        Hola, soy <span className="text-brand-primary">NormIA</span>. ¿Cómo puedo ayudarte hoy?
      </h1>
    </div>
    ...chips...
  </div>
</div>
```

Expected: el chat inicial tiene foco visual y glow como la referencia.

- [ ] **Step 2: convertir chips de preguntas en píldoras premium**

Target chip class:
```tsx
className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-capa-surface px-3.5 py-2 text-xs font-semibold text-txt-medium shadow-sm transition hover:-translate-y-0.5 hover:text-brand-dark hover:shadow-soft active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
```

Expected: conservar preguntas directas, pero ahora se sienten como prompt chips.

- [ ] **Step 3: esconder intro duplicado cuando empty state ya tiene hero**

If `chat-intro`/top title duplicates hero, keep a compact header only when messages exist:
```tsx
{messages.length > 0 && (
  <div className="flex items-center gap-3">
    ...
  </div>
)}
```

Expected: estado inicial limpio; conversación con header contextual.

---

## Task 5: transformar composer en caja protagonista

**Files:**
- Modify: `features/consultation/components/consultation-composer.tsx`

**Interfaces:**
- Consumes: `input`, `loading`, `onInputChange`, `onSend`.
- Produces: input box grande, redondeado y con glow menta suave.

- [ ] **Step 1: cambiar cápsula simple por card input grande**

Target wrapper:
```tsx
<div className="sticky bottom-0 bg-linear-to-t from-capa-surface via-capa-surface to-transparent pt-4">
  <div className="rounded-[28px] border border-brand-primary/20 bg-capa-surface p-3 shadow-glow ring-4 ring-brand-primary/10 transition focus-within:border-brand-primary/50 focus-within:ring-brand-primary/20">
```

Expected: composer se parece al input central de referencia.

- [ ] **Step 2: usar textarea si se quiere mejor UX para preguntas largas**

Recommended:
```tsx
<textarea
  className="min-h-12 w-full resize-none bg-transparent px-2 py-2 text-sm text-txt-medium outline-0 placeholder:text-txt-subtle"
  aria-label="Escribe tu consulta"
  name="consultation-question"
  autoComplete="off"
  value={input}
  onChange={(event) => onInputChange(event.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Pregunta sobre normas, obligaciones, estándares mínimos o documentación…"
  rows={2}
/>
```

Keyboard behavior:
- Enter sends when not composing and `Shift` is not pressed.
- Shift+Enter inserts newline.

Expected: consultas normativas largas se escriben mejor. Esto SÍ mejora UX real.

- [ ] **Step 3: añadir toolbar inferior simple**

Use:
```tsx
<div className="flex items-center justify-between gap-3 pt-2">
  <div className="inline-flex items-center gap-1 rounded-full bg-capa-main p-1 text-xs font-semibold text-txt-muted">
    <span className="rounded-full bg-capa-surface px-3 py-1 shadow-sm">Normativa</span>
    <span className="px-2 py-1">Fuentes oficiales</span>
  </div>
  <button className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-xs font-bold text-brand-text transition hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0" ...>
    Enviar <Send size={16} />
  </button>
</div>
```

Expected: no botones falsos de adjuntos/auto si no existen. Se toma la estética, no la mentira funcional.

---

## Task 6: pulir mensajes, Markdown y referencias

**Files:**
- Modify: `features/consultation/components/message-list.tsx`
- Modify: `features/consultation/components/markdown-message.tsx`
- Modify: `features/consultation/components/chunk-modal.tsx`

**Interfaces:**
- Consumes: `ConsultationMessage`, `MarkdownMessage`, referencias/chunks.
- Produces: conversación más limpia, legible y consistente con la nueva estética.

- [ ] **Step 1: suavizar burbujas del asistente**

Assistant bubble target:
```tsx
'min-w-0 max-w-[min(88%,680px)] rounded-[22px] rounded-tl-md border border-white/70 bg-capa-surface px-4 py-3.5 text-sm leading-6 text-txt-medium shadow-sm wrap-anywhere md:max-w-[min(78%,680px)]'
```

User bubble target:
```tsx
'min-w-0 max-w-[min(86%,620px)] rounded-[22px] rounded-tr-md bg-brand-primary px-4 py-3.5 text-sm leading-6 text-brand-text shadow-sm wrap-anywhere md:max-w-[min(72%,620px)]'
```

Expected: menos “chat genérico”, más card suave.

- [ ] **Step 2: referencias como chips/cardlets**

Reference button target:
```tsx
className="mt-1 inline-flex max-w-full items-center gap-2 rounded-full border border-borde-light bg-capa-main px-3 py-1.5 text-left text-xs font-medium text-txt-muted transition hover:border-brand-primary/40 hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-60 wrap-anywhere"
```

Expected: fuentes consultadas se ven como elementos accionables, no texto perdido.

- [ ] **Step 3: Markdown más editorial**

In `MarkdownMessage`, tune headings/tables:
- Headings: más compactos, `font-bold`, `text-txt-bold`.
- Tables: fondo blanco, border soft, header `bg-capa-main`.
- Blockquote: borde verde menta suave.

Expected: respuestas normativas con tablas se ven profesionales.

- [ ] **Step 4: modal de chunk con estética panel**

Update modal container to:
```tsx
className="flex max-h-[calc(90dvh-var(--bottom-nav-height))] w-full max-w-[680px] flex-col rounded-panel border border-white/70 bg-capa-surface shadow-panel md:max-h-[80dvh]"
```

Expected: modal consistente con panel principal.

---

## Task 7: alinear Home y Diagnóstico con el nuevo lenguaje visual

**Files:**
- Modify: `features/home/home-view.tsx`
- Modify: `features/diagnostic/diagnostic-view.tsx`

**Interfaces:**
- Consumes: diseño Clean Tech ya aplicado al chat.
- Produces: experiencia consistente entre vistas.

- [ ] **Step 1: Home con cards más neumórficas**

Update Home cards to use:
```tsx
rounded-card border border-white/70 bg-capa-surface shadow-soft hover:shadow-panel
```

Expected: Home no se siente de otro producto.

- [ ] **Step 2: Home hero con glow sutil**

Add decorative background only if it does not distract:
```tsx
<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--glow-primary)/0.14),transparent_62%)]" aria-hidden="true" />
```

Expected: continuidad visual con chat.

- [ ] **Step 3: Diagnóstico con card panel**

Update diagnostic card to use:
```tsx
rounded-card border border-white/70 bg-capa-surface shadow-panel
```

Step circles active:
```tsx
bg-brand-primary text-brand-text shadow-[0_0_0_6px_hsl(var(--brand-primary)/0.10)]
```

Expected: diagnóstico se siente parte del mismo sistema.

---

## Task 8: revisar responsive mobile específico del nuevo diseño

**Files:**
- Modify: affected components only if needed.

**Interfaces:**
- Consumes: shell, chat hero, composer, bottom nav.
- Produces: diseño bonito sin romper usabilidad móvil.

- [ ] **Step 1: comprobar mobile 360x640**

Expected:
- No sidebar.
- Hero no empuja composer fuera de vista.
- Chips hacen wrap o scroll horizontal sin romper layout.
- Bottom nav no tapa composer.

- [ ] **Step 2: comprobar mobile 390x844**

Expected:
- Glow visible pero no dominante.
- Composer tiene espacio suficiente para escribir.
- Mensajes largos hacen scroll interno.

- [ ] **Step 3: ajustar chips si ocupan demasiado**

Recommended mobile pattern:
```tsx
<div className="flex max-w-full gap-2 overflow-x-auto pb-1 md:flex-wrap md:justify-center md:overflow-visible">
```

Expected: chips no obligan scroll vertical innecesario en mobile.

---

## Task 9: accesibilidad y reducción de movimiento

**Files:**
- Modify: changed components if needed.
- Read: `app/globals.css`.

**Interfaces:**
- Consumes: nuevos glows, sombras, hover y composer.
- Produces: UI pulida sin sacrificar accesibilidad.

- [ ] **Step 1: verificar foco visible**

Expected:
- Sidebar links, bottom nav, chips, send button y referencias muestran foco visible.
- Ningún input usa `outline-0` sin foco en contenedor.

- [ ] **Step 2: verificar contrastes**

Expected:
- Texto `text-txt-muted` sigue legible sobre `bg-capa-surface` y `bg-capa-main`.
- Verde menta con texto blanco se usa solo en botones con suficiente peso/tamaño.

- [ ] **Step 3: reduced motion**

Expected:
- Glows estáticos permitidos.
- Animaciones/hover transform respetan media query global.
- Typing indicator no resulta problemático con reduced motion.

---

## Task 10: verificación final técnica y visual

**Files:**
- Read: `app/globals.css`
- Read: `tailwind.config.ts`
- Read: changed components.

**Interfaces:**
- Consumes: todos los cambios visuales.
- Produces: evidencia de que el rediseño no rompió flujos.

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

- [ ] **Step 3: QA visual desktop**

Check:
- Panel principal blanco flotante.
- Sidebar card independiente.
- Glow menta visible en consulta empty state.
- Composer grande y protagonista.
- Mensajes y referencias siguen legibles.

- [ ] **Step 4: QA visual mobile**

Check:
- No sidebar.
- Bottom nav flotante tipo cápsula.
- Composer no se solapa.
- Chips no rompen ancho.
- No hay scroll horizontal.

- [ ] **Step 5: QA funcional**

Check:
- Navegar Home / Consulta / Diagnóstico.
- Enviar pregunta escrita.
- Enviar chip.
- Renderizar Markdown con tabla.
- Abrir/cerrar modal de referencia.

---

## Criterio de aceptación

- La consulta inicial se parece a la referencia en intención visual: hero centrado, glow menta, chips y composer protagonista.
- NormIA conserva identidad propia; no aparecen textos/elementos crypto como Market Radar, wallet, bots oficiales falsos o perfil decorativo.
- La paleta visible se alinea con la referencia: `#F4F5F7`, `#FFFFFF`, `#EAEBED`, `#00E599`, `#00D68F`, `#111827`, `#6B7280`.
- Desktop usa paneles flotantes con radios grandes y sombras suaves.
- Mobile mantiene bottom nav como única navegación.
- Composer mejora visualmente y soporta preguntas largas si se migra a textarea.
- Preguntas directas se mantienen como chips.
- Mensajes Markdown, referencias y modal mantienen legibilidad.
- Colores salen de tokens, no de hex hardcodeados en cada componente.
- Foco, contraste y reduced motion se conservan.
- `pnpm exec tsc --noEmit` pasa.
- `pnpm build` pasa.

## Riesgos

- Copiar demasiados elementos de la referencia puede convertir NormIA en un dashboard que no corresponde al producto. Evitar acciones falsas como avatar, wallet, Market Radar o bots oficiales.
- El verde brillante puede perder contraste con texto blanco si se usa en texto pequeño. Usarlo con peso alto o ajustar a `brand-dark` para texto.
- El composer grande mejora estética, pero en móvil puede comerse altura. QA en `360x640` es obligatorio.
- Glows y sombras deben ser sutiles; si compiten con el contenido normativo, el diseño está fallando. La información manda, el glow acompaña.
