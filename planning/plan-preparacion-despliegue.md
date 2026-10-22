# Plan de preparación para despliegue — NormIA Frontend

Este plan resuelve la deuda técnica que impide desplegar el frontend en contenedores y deja listos el `Dockerfile`, los archivos de Compose (`compose.yaml` y sus capas) y los flujos de GitHub Actions. Al terminar, una sola imagen sirve para cualquier entorno, el backend se configura al arrancar el contenedor y cada cambio pasa por typecheck, lint, tests, build y una prueba de arranque de la imagen en GitHub Actions.

## Decisiones acordadas

| Tema | Decisión |
|------|----------|
| URL del backend | El frontend actúa como proxy de `/api/v1/*` mediante `proxy.ts` y lee `SGSST_API_URL` en cada petición. Una sola imagen para todos los entornos y sin CORS. Reemplaza el acuerdo previo de "sin proxy". |
| Gestor de paquetes | pnpm es el único oficial. Se elimina `package-lock.json`. |
| Docker Compose | Levanta solo el frontend; el backend se publica y despliega desde su propio repositorio. |
| GitHub Actions | Dos workflows como el backend: `tests.yml` (calidad) e `image.yml` (imagen y arranque). Publicación en GHCR pendiente hasta que exista producción. |
| Tests | Vitest, con tests del proxy y de los clientes de la API. |

> Los `rewrites` de `next.config.mjs` no sirven para este objetivo: Next los fija durante el build. El proxy tiene que vivir en `proxy.ts`, que se ejecuta en cada petición.

## Ruta rápida

| Fase | Resultado | Bloquea despliegue |
|------|-----------|--------------------|
| 0 | Toolchain reproducible: pnpm, Node 24 fijado | Sí |
| 1 | Calidad verificable: typecheck, lint, Vitest, limpieza de deuda | Sí |
| 2 | Proxy en runtime y health check | Sí |
| 3 | Dockerfile y Docker Compose | Sí |
| 4 | Workflows de GitHub Actions (`tests.yml` e `image.yml`) | Sí |
| 5 | Documentación de ejecución y despliegue | No |
| 6 | Deuda de mantenibilidad del diagnóstico | No |

Cada fase se entrega como un commit o PR revisable, con su código, sus tests y su documentación juntos.

---

## Fase 0 — Toolchain reproducible

**Problema.** Conviven `package-lock.json` y `pnpm-lock.yaml`, y no hay versión de Node ni de pnpm fijada. Dos builds del mismo commit pueden instalar dependencias distintas.

**Cambios**
1. Eliminar `package-lock.json`.
2. Declarar en `package.json` `"packageManager": "pnpm@<versión exacta>"` y `"engines": { "node": ">=24" }`.
3. Crear `.nvmrc` con `24` (LTS con soporte hasta abril de 2028; Node 22 termina su soporte en abril de 2027).
4. Mantener `pnpm-workspace.yaml`, porque guarda la configuración de pnpm (`minimumReleaseAgeExclude`), aunque el repositorio no sea un monorepo.
5. Regenerar `pnpm-lock.yaml` con `pnpm install` y confirmar que no cambian versiones sin intención.

**Archivos:** `package.json`, `package-lock.json` (eliminado), `pnpm-lock.yaml`, `.nvmrc` (nuevo).

**Criterios de aceptación**
- [ ] `pnpm install --frozen-lockfile` funciona en un clon limpio.
- [ ] `pnpm build` funciona con Node 24.

**Riesgo:** ítem 5 (dependencias y entorno).

---

## Fase 1 — Calidad verificable y limpieza de deuda

**Problema.** No hay scripts de verificación y `ignoreBuildErrors: true` deja pasar errores de tipos. Además quedan restos de depuración, validaciones incompletas y helpers HTTP duplicados.

**Cambios — herramientas**
1. Agregar los scripts `typecheck` (`tsc --noEmit`), `lint` (`eslint .`) y `test` (`vitest run`).
2. Configurar ESLint en formato flat config con `eslint-config-next`.
3. Configurar Vitest en entorno `node` con los alias `@/*` de `tsconfig.json`.
4. Eliminar `typescript.ignoreBuildErrors` de `next.config.mjs`.

**Cambios — deuda de código**
1. Eliminar el `console.log` de la URL en `consultation-api.ts`.
2. Validar `chunks` en `isConsultationQueryResponse`.
3. Eliminar el código comentado de `use-consultation-session.ts`.
4. Usar `message.id` como `key` en `MessageList`, en lugar del índice.
5. Extraer `requestJson` y `parseApiError` a un cliente HTTP compartido y reutilizarlo en ambos módulos `api/`.
6. Eliminar `@vercel/analytics` y su uso en `app/layout.tsx`, porque no aplica fuera de Vercel.

**Tests (Vitest)**
- Cliente de consulta: hace POST a la ruta correcta, rechaza respuestas sin `chunks` y lanza un error cuando `!response.ok`.
- Cliente de diagnóstico: codifica los IDs en la URL, propaga el `detail` del error, rechaza un informe que no sea PDF y devuelve el `Blob` cuando el informe es válido.
- `fetch` se simula con `vi.stubGlobal`, así que no hay red real.

**Archivos:** `package.json`, `eslint.config.mjs` (nuevo), `vitest.config.ts` (nuevo), `next.config.mjs`, `app/layout.tsx`, `shared/api/http-client.ts` (nuevo), `features/consultation/api/consultation-api.ts`, `features/diagnostic/api/diagnostic-api.ts`, `features/consultation/hooks/use-consultation-session.ts`, `features/consultation/components/message-list.tsx`, tests en `features/*/api/*.test.ts` (nuevos).

**Criterios de aceptación**
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build` pasan.
- [ ] Un error de tipos hace fallar el build.

**Riesgo:** ítem 5 (nuevas dependencias de desarrollo).

---

## Fase 2 — Proxy en runtime y health check

**Problema.** `NEXT_PUBLIC_SGSST_API_URL` se fija dentro del JavaScript durante el build. La imagen queda atada a un entorno, el navegador ve la URL del backend y el backend necesita CORS.

**Cambios**
1. Crear `proxy.ts` con un `matcher` sobre `/api/v1/:path*`. En cada petición lee `SGSST_API_URL` y reescribe hacia el backend, conservando la ruta y la query string.
2. Si `SGSST_API_URL` no está definida, responder `503` con `{ "detail": "..." }` en español, para que la UI muestre un mensaje claro.
3. Hacer que los clientes de la API usen rutas relativas (`/api/v1/query`, `/api/v1/diagnostics`) y eliminar `NEXT_PUBLIC_SGSST_API_URL`.
4. Fijar `experimental.proxyTimeout` en `next.config.mjs`. Next corta las peticiones reenviadas a los **30 segundos** por defecto, y las respuestas del RAG pueden tardar más. El valor exacto se define midiendo la latencia real del backend.
5. Crear `app/api/health/route.ts`, fuera del `matcher` del proxy, que responda `200` sin depender del backend.
6. Crear `.env.example` con `SGSST_API_URL=http://127.0.0.1:8000` y actualizar `.env.local` a la nueva variable.

**Tests (Vitest)**
- Reescribe `/api/v1/query?x=1` a `${SGSST_API_URL}/api/v1/query?x=1`.
- Responde `503` con `detail` cuando falta `SGSST_API_URL`.
- No intercepta `/api/health` ni las rutas de la app.

**Archivos:** `proxy.ts` (nuevo), `app/api/health/route.ts` (nuevo), `next.config.mjs`, `features/consultation/api/consultation-api.ts`, `features/diagnostic/api/diagnostic-api.ts`, `.env.example` (nuevo), `.env.local` (local, no versionado), `proxy.test.ts` (nuevo).

**Criterios de aceptación**
- [ ] Con `pnpm build` y luego `SGSST_API_URL=... pnpm start`, la consulta y el diagnóstico funcionan sin CORS.
- [ ] Cambiar `SGSST_API_URL` y reiniciar, sin volver a compilar, apunta a otro backend.
- [ ] Una consulta que tarda más de 30 segundos no se corta. Se verifica a mano contra el backend real.
- [ ] La descarga del PDF sigue funcionando a través del proxy.
- [ ] La URL del backend no aparece en el JavaScript que recibe el navegador.

**Riesgo:** ítem 3 (cambia el contrato de configuración: `NEXT_PUBLIC_SGSST_API_URL` pasa a `SGSST_API_URL`).

---

## Fase 3 — Dockerfile y Docker Compose

**Cambios — imagen**
1. Agregar `output: 'standalone'` en `next.config.mjs`.
2. Escribir un `Dockerfile` multi-stage sobre `node:24-alpine` con una versión exacta:
   - `base`: `corepack enable` (pnpm fijado por `packageManager`).
   - `deps`: `pnpm install --frozen-lockfile`.
   - `development`: `next dev` como usuario `node`, para `compose.dev.yaml`.
   - `builder`: `pnpm build` con `NEXT_TELEMETRY_DISABLED=1`.
   - `runtime`: copia solo `.next/standalone` y `.next/static`, corre con un usuario sin privilegios, `ENV PORT=3000 HOSTNAME=0.0.0.0` y un `HEALTHCHECK` contra `/api/health`.
3. Crear un `.dockerignore` que excluya `node_modules`, `.next`, `.git`, `.env*`, `.codegraph`, `.atl`, `odd` y `planning`.

**Cambios — Compose**
Se sigue la misma estructura del backend: Dockerfile con secciones numeradas y Compose en capas (`compose.yaml` base parecida a producción y `compose.dev.yaml` para desarrollo).

1. Crear `compose.yaml` (proyecto `sg-sst-frontend`) con un único servicio `frontend`:
   - `image: sg-sst-frontend:local`, construida localmente desde el Dockerfile (igual que `sg-sst-backend:local`). La imagen de GHCR de la fase 4 no se usa en Compose hasta que exista un entorno de producción.
   - `environment: SGSST_API_URL` (obligatoria), `ports: 127.0.0.1:3000:3000` (igual que el backend), `restart: unless-stopped` y el `HEALTHCHECK` heredado de la imagen.
   - `extra_hosts: host.docker.internal:host-gateway`, para llegar a un backend que corre en el host durante el desarrollo.
2. Crear `compose.dev.yaml`: usa la etapa `development` del Dockerfile (`next dev`) y monta el código del host en modo solo lectura para recargar sin reconstruir.
3. Crear `compose.backend-network.yaml` como capa opcional que une el servicio a la red del backend (`sg-sst_default` por defecto), por ejemplo `SGSST_API_URL=http://backend:8000`. Así el backend no necesita exponerse a internet.

**Archivos:** `next.config.mjs`, `Dockerfile` (nuevo), `.dockerignore` (nuevo), `compose.yaml` (nuevo), `compose.dev.yaml` (nuevo), `compose.backend-network.yaml` (nuevo).

**Criterios de aceptación**
- [ ] `docker compose up --build` levanta la app y el health check queda en `healthy`.
- [ ] La imagen no contiene `.env*` ni el código fuente completo.
- [ ] El contenedor no corre como root.

**Riesgo:** ítem 5 (entorno de ejecución).

---

## Fase 4 — GitHub Actions

Se sigue la misma estructura del backend: dos workflows con secciones numeradas, permisos de solo lectura y actions fijadas por SHA.

**Cambios**
1. Crear `.github/workflows/tests.yml`, que corre en `push` a `dev` y `main`, en `pull_request` a `main` y manualmente:
   - `pnpm/action-setup` (versión desde `packageManager`) y `actions/setup-node` con `.nvmrc` y caché de pnpm.
   - `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build`.
2. Crear `.github/workflows/image.yml`, que corre en `push` a `main`, en `pull_request` a `main` y manualmente:
   - `docker compose build` de `sg-sst-frontend:local` y su tamaño.
   - Higiene de la imagen: usuario sin privilegios (uid 1000) y sin `.env`, código fuente ni `.git`.
   - Prueba de arranque con `docker compose up --wait`: `/api/health`, las páginas principales y el proxy activo (`/api/v1` responde el 404 de `proxy.ts` sin llamar al backend).
3. Publicación en GHCR: pendiente de decisión. Mientras no exista producción, la imagen no se publica (igual que el backend).

**Archivos:** `.github/workflows/tests.yml` (nuevo), `.github/workflows/image.yml` (nuevo).

**Criterios de aceptación**
- [ ] Un PR con un error de tipos, de lint o un test roto queda en rojo en `tests`.
- [ ] Un `Dockerfile` roto o una imagen que no arranca deja en rojo `image`.

**Riesgo:** ítem 5 (CI).

---

## Fase 5 — Documentación

**Cambios**
1. Actualizar `GUIA_EJECUCION_FRONTEND.md`: solo pnpm, Node 24, `SGSST_API_URL` en lugar de `NEXT_PUBLIC_*` y eliminar la referencia obsoleta a `NEXT_PUBLIC_DIAGNOSTIC_API_URL` y al puerto 8001.
2. Agregar a esa guía una sección de despliegue con Docker: variables, `docker compose up`, la red compartida opcional y, cuando exista producción, cómo obtener la imagen publicada.
3. Actualizar `AGENTS.md` con los nuevos scripts y comandos de verificación.

**Archivos:** `GUIA_EJECUCION_FRONTEND.md`, `AGENTS.md`.

**Criterios de aceptación**
- [ ] Una persona nueva levanta el proyecto, en local y con Docker, siguiendo solo la guía.

---

## Fase 6 — Deuda de mantenibilidad (no bloquea el despliegue)

**Problema.** `use-diagnostic-session.ts` (439 líneas) mezcla la orquestación de la API, los temporizadores de UI y la navegación.

**Cambios**
1. Extraer los avisos con temporizador (toast y transición de requisito) a un hook propio.
2. Extraer la construcción de borradores hacia la consulta (`handleRequestRiskClassHelp` y `handleRequestConsultationHelp`) a funciones puras con tests.
3. Mantener sin cambios la API pública del hook que consume `diagnostic-view.tsx`.

**Archivos:** `features/diagnostic/hooks/use-diagnostic-session.ts`, `features/diagnostic/hooks/use-diagnostic-notices.ts` (nuevo), `features/diagnostic/model/consultation-draft.ts` (nuevo) y su test.

**Criterios de aceptación**
- [ ] El flujo de diagnóstico se comporta igual que antes.
- [ ] Las funciones de borrador tienen tests.

---

## Fuera de alcance

- Cambios en el backend. Con el proxy ya no hace falta habilitar CORS para el frontend.
- Despliegue automático a un servidor, HTTPS y reverse proxy (Nginx, Caddy o Traefik).
- Tests end-to-end en navegador.

## Siguiente paso

Implementar la Fase 0 en una rama `chore/deploy-readiness`.
