# Limpieza del proyecto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** limpiar artefactos generados, resolver la mezcla de package managers y decidir qué código/dependencias realmente pertenecen al proyecto.

**Architecture:** este cambio no modifica comportamiento de producto. Primero elimina basura segura, luego resuelve decisiones de tooling, y por último limpia código/dependencias sospechosas solo cuando su uso esté verificado.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.7, Tailwind CSS v4, pnpm como intención del proyecto.

## Global Constraints

- Mantener pnpm como package manager oficial si no hay una decisión explícita en contra.
- No confiar solo en `pnpm build`: `next.config.mjs` ignora errores TypeScript.
- Ejecutar `pnpm exec tsc --noEmit` antes de `pnpm build` cuando pnpm esté disponible.
- No eliminar `next-env.d.ts`.
- No tocar `.codegraph/.gitignore`.
- No mover ni reestructurar features durante esta limpieza.
- No eliminar `components/ui/button.tsx` ni sus dependencias sin verificar que no se quieren conservar como base shadcn/base-nova.

---

## Estado detectado

### Limpieza segura

- `tsconfig.tsbuildinfo`: cache incremental de TypeScript; no debe versionarse.
- `.next/`: artefacto generado por Next.js; ya está ignorado.
- `node_modules/`: dependencias instaladas localmente; ya está ignorado.
- `components/chatty-app.tsx`: ya no tiene referencias activas después del refactor por features; su eliminación es correcta si sigue apareciendo como borrado.

### Sospechoso, requiere decisión

- `package-lock.json`: convive con `pnpm-lock.yaml`; esto mezcla npm y pnpm.
- `components/ui/button.tsx`: no está usado por la app actual.
- `lib/utils.ts`: solo parece usado por `components/ui/button.tsx`.
- Dependencias posiblemente arrastradas solo por el botón:
  - `@base-ui/react`
  - `class-variance-authority`
  - `clsx`
  - `tailwind-merge`
- `.atl/`: contiene artefactos de agente/herramienta; decidir si se versiona o se ignora.
- `planning/separar-ui-por-features.md`: plan histórico ya ejecutado; actualizar, archivar o conservar como historial.

## File map

### Modificar

- `.gitignore`: agregar `tsconfig.tsbuildinfo` si no existe.
- `package.json`: remover dependencias solo si se elimina el botón y se confirma que no hay más usos.
- `pnpm-lock.yaml`: actualizar únicamente mediante pnpm después de cambiar dependencias.
- `planning/separar-ui-por-features.md`: marcar como ejecutado o mover a un archivo de historial si se decide mantenerlo.

### Eliminar si aplica

- `tsconfig.tsbuildinfo`
- `package-lock.json`
- `components/ui/button.tsx`
- `lib/utils.ts`

### No tocar

- `next-env.d.ts`
- `.codegraph/.gitignore`
- `.next/` y `node_modules/` salvo limpieza local de espacio.

---

## Task 1: fijar pnpm como única fuente de instalación

**Files:**
- Delete: `package-lock.json`
- Keep: `pnpm-lock.yaml`
- Read: `package.json`

**Interfaces:**
- Consumes: decisión del proyecto de usar pnpm.
- Produces: un solo lockfile oficial para instalaciones reproducibles.

- [ ] **Step 1: confirmar que `pnpm-lock.yaml` existe**

Run:
```bash
test -f pnpm-lock.yaml && test -f package.json
```

Expected: exit code `0`.

- [ ] **Step 2: confirmar que `package-lock.json` existe antes de borrarlo**

Run:
```bash
test -f package-lock.json
```

Expected: exit code `0`. Si no existe, marcar esta tarea como ya resuelta.

- [ ] **Step 3: eliminar el lockfile de npm**

Run:
```bash
rm package-lock.json
```

Expected: `package-lock.json` ya no existe.

- [ ] **Step 4: verificar que queda un solo lockfile de package manager**

Run:
```bash
ls package-lock.json pnpm-lock.yaml 2>/dev/null
```

Expected: la salida muestra `pnpm-lock.yaml` y no muestra `package-lock.json`.

- [ ] **Step 5: commit sugerido**

```bash
git add package-lock.json pnpm-lock.yaml package.json
git commit -m "chore: use pnpm lockfile only"
```

---

## Task 2: ignorar y eliminar cache incremental de TypeScript

**Files:**
- Modify: `.gitignore`
- Delete: `tsconfig.tsbuildinfo`

**Interfaces:**
- Consumes: `tsconfig.json` usa `incremental: true`.
- Produces: el cache de TypeScript deja de aparecer como archivo suelto.

- [ ] **Step 1: revisar si `.gitignore` ya ignora el cache**

Run:
```bash
grep -n "tsconfig.tsbuildinfo" .gitignore
```

Expected: si no hay salida, agregarlo en el siguiente paso.

- [ ] **Step 2: agregar el cache a `.gitignore` si falta**

Add this line to `.gitignore`:
```gitignore
tsconfig.tsbuildinfo
```

Expected: `.gitignore` contiene exactamente una entrada para `tsconfig.tsbuildinfo`.

- [ ] **Step 3: eliminar el cache local si existe**

Run:
```bash
rm -f tsconfig.tsbuildinfo
```

Expected: `test ! -f tsconfig.tsbuildinfo` pasa.

- [ ] **Step 4: verificar estado**

Run:
```bash
git status --short --ignored
```

Expected: `tsconfig.tsbuildinfo` no aparece como archivo pendiente de commit.

- [ ] **Step 5: commit sugerido**

```bash
git add .gitignore
git commit -m "chore: ignore TypeScript incremental cache"
```

---

## Task 3: decidir si conservar el botón shadcn/base-nova

**Files:**
- Read: `components/ui/button.tsx`
- Read: `lib/utils.ts`
- Read: `components.json`
- Read: `package.json`

**Interfaces:**
- Consumes: resultado de búsqueda de imports.
- Produces: decisión explícita: conservar la plantilla UI o eliminarla con sus dependencias.

- [ ] **Step 1: buscar imports reales del botón**

Run:
```bash
grep -R "@/components/ui/button\|components/ui/button\|from './button'\|from \"./button\"" -n app components features lib shared
```

Expected: sin salida si el botón sigue sin uso.

- [ ] **Step 2: buscar usos del helper `cn`**

Run:
```bash
grep -R "from '@/lib/utils'\|from \"@/lib/utils\"\|cn(" -n app components features lib shared
```

Expected: solo `components/ui/button.tsx` y `lib/utils.ts` si no hay otros usos.

- [ ] **Step 3: tomar decisión**

Decision record:
```md
Decision: remove | keep
Reason: remove if the project does not need a reusable shadcn/base-nova button yet; keep if upcoming UI work will standardize on this primitive.
```

Expected: no seguir a Task 4 sin esta decisión. Este es el punto donde NO se programa en automático sin pensar. Primero concepto, luego teclado.

---

## Task 4A: si se decide conservar `components/ui/button.tsx`

**Files:**
- Keep: `components/ui/button.tsx`
- Keep: `lib/utils.ts`
- Keep dependencies: `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`
- Modify: `AGENTS.md` opcional

**Interfaces:**
- Consumes: decisión `keep` de Task 3.
- Produces: intención documentada para que futuros agentes no borren falsos positivos.

- [ ] **Step 1: documentar que el botón se conserva como primitiva base**

Add to `AGENTS.md` under Styling/UI conventions:
```md
- `components/ui/button.tsx` and `lib/utils.ts` are kept as shadcn/base-nova primitives even if the current app does not import them yet.
```

Expected: futuros audits no lo marcan como basura sin contexto.

- [ ] **Step 2: verificar que no se eliminan dependencias necesarias**

Run:
```bash
grep -n "@base-ui/react\|class-variance-authority\|clsx\|tailwind-merge" package.json
```

Expected: las cuatro dependencias siguen presentes.

- [ ] **Step 3: commit sugerido**

```bash
git add AGENTS.md components/ui/button.tsx lib/utils.ts package.json pnpm-lock.yaml
git commit -m "docs: document retained UI primitives"
```

---

## Task 4B: si se decide eliminar `components/ui/button.tsx`

**Files:**
- Delete: `components/ui/button.tsx`
- Delete: `lib/utils.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: decisión `remove` de Task 3.
- Produces: árbol de dependencias más pequeño y sin plantilla no usada.

- [ ] **Step 1: eliminar archivos no usados**

Run:
```bash
rm components/ui/button.tsx lib/utils.ts
```

Expected: ambos archivos ya no existen.

- [ ] **Step 2: remover dependencias asociadas con pnpm**

Run:
```bash
pnpm remove @base-ui/react class-variance-authority clsx tailwind-merge
```

Expected: `package.json` ya no lista esas dependencias y `pnpm-lock.yaml` se actualiza.

- [ ] **Step 3: confirmar que no quedan imports rotos**

Run:
```bash
grep -R "@base-ui/react\|class-variance-authority\|tailwind-merge\|@/lib/utils\|components/ui/button" -n app components features lib shared package.json
```

Expected: sin salida relacionada con esos archivos/dependencias.

- [ ] **Step 4: commit sugerido**

```bash
git add components/ui/button.tsx lib/utils.ts package.json pnpm-lock.yaml
git commit -m "chore: remove unused UI primitive dependencies"
```

---

## Task 5: decidir qué hacer con `.atl/`

**Files:**
- Read: `.atl/skill-registry.md`
- Read: `.atl/.skill-registry.cache.json`
- Modify: `.gitignore` si se decide ignorar cache

**Interfaces:**
- Consumes: decisión de si `.atl/` es documentación del repo o artefacto local de agente.
- Produces: política clara para `.atl/`.

- [ ] **Step 1: inspeccionar contenido**

Run:
```bash
ls -la .atl
```

Expected: aparecen `skill-registry.md` y `.skill-registry.cache.json` si siguen presentes.

- [ ] **Step 2: elegir política**

Decision record:
```md
Decision: keep-all | keep-md-ignore-cache | ignore-all
Reason: keep markdown if it documents project skills; ignore cache if it is machine-generated.
```

Expected: no borrar `.atl/` sin decidir, porque puede contener contexto útil para agentes.

- [ ] **Step 3: si se elige `keep-md-ignore-cache`, ignorar cache**

Add to `.gitignore`:
```gitignore
.atl/.skill-registry.cache.json
```

Expected: solo el cache queda ignorado; `skill-registry.md` puede seguir versionado.

- [ ] **Step 4: si se elige `ignore-all`, ignorar directorio completo**

Add to `.gitignore`:
```gitignore
.atl/
```

Expected: `.atl/` deja de aparecer como contenido versionable.

- [ ] **Step 5: commit sugerido**

```bash
git add .gitignore .atl
git commit -m "chore: clarify agent artifact tracking"
```

---

## Task 6: actualizar el plan histórico de features

**Files:**
- Modify: `planning/separar-ui-por-features.md`

**Interfaces:**
- Consumes: refactor por features ya aplicado.
- Produces: documento histórico que no confunde a futuros agentes.

- [ ] **Step 1: agregar nota de estado al inicio del plan**

Add below the title:
```md
> Estado: ejecutado. Este documento queda como historial de la refactorización; verificar el código actual antes de usarlo como plan activo.
```

Expected: queda claro que no es el plan activo actual.

- [ ] **Step 2: actualizar contexto obsoleto**

Replace any sentence that says `app/page.tsx` renders `components/chatty-app.tsx` as current state with:
```md
- Antes del refactor, `app/page.tsx` renderizaba `components/chatty-app.tsx`; después del refactor debe apuntar al layout shell actual.
```

Expected: el plan no contradice el estado actual del proyecto.

- [ ] **Step 3: commit sugerido**

```bash
git add planning/separar-ui-por-features.md
git commit -m "docs: mark feature split plan as executed"
```

---

## Task 7: verificación final

**Files:**
- Read: `package.json`
- Read: `pnpm-lock.yaml`
- Read: `.gitignore`
- Read: `AGENTS.md`

**Interfaces:**
- Consumes: cambios de Tasks 1-6.
- Produces: prueba de que el proyecto queda limpio y compilable.

- [ ] **Step 1: instalar dependencias con pnpm si hace falta**

Run:
```bash
pnpm install --frozen-lockfile
```

Expected: instalación exitosa sin regenerar lockfile inesperadamente.

- [ ] **Step 2: ejecutar typecheck real**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: exit code `0`.

- [ ] **Step 3: ejecutar build**

Run:
```bash
pnpm build
```

Expected: Next build exitoso.

- [ ] **Step 4: revisar estado final**

Run:
```bash
git status --short --ignored
```

Expected:
- no aparece `package-lock.json` si pnpm quedó como oficial;
- no aparece `tsconfig.tsbuildinfo` como untracked;
- `.next/` y `node_modules/` aparecen ignorados si existen;
- solo quedan cambios intencionales.

- [ ] **Step 5: commit final si hubo ajustes de verificación**

```bash
git add .
git commit -m "chore: verify project cleanup"
```

---

## Criterio de aceptación

- El proyecto conserva un solo lockfile oficial.
- `tsconfig.tsbuildinfo` está ignorado y no queda como archivo pendiente.
- No se eliminan dependencias que todavía tienen imports reales.
- Si `components/ui/button.tsx` se conserva, queda documentado por qué.
- Si `components/ui/button.tsx` se elimina, también se limpian `lib/utils.ts` y dependencias asociadas.
- `.atl/` tiene una política explícita: versionar, ignorar cache o ignorar todo.
- `planning/separar-ui-por-features.md` ya no parece un plan activo si el refactor ya está aplicado.
- `pnpm exec tsc --noEmit` y `pnpm build` pasan cuando pnpm está disponible.

## Riesgos

- Eliminar `components/ui/button.tsx` puede ser mala idea si el equipo lo quiere como primitiva futura de diseño. Esa decisión debe ser explícita.
- Eliminar `.atl/` puede quitar contexto útil para sesiones de agentes. No hacerlo como limpieza ciega.
- Si se usa npm por accidente después de limpiar, volverá a aparecer `package-lock.json`; por eso pnpm debe quedar como convención clara.
