# Plan de preparación para despliegue — NormIA Frontend

Este plan resuelve la deuda técnica que impide desplegar el frontend en contenedores y deja listos el `Dockerfile`, el `docker-compose.yml` y los flujos de GitHub Actions. Al terminar, una sola imagen sirve para cualquier entorno, el backend se configura al arrancar el contenedor y cada cambio pasa por typecheck, lint, tests y build antes de publicarse en GHCR.

## Decisiones acordadas

| Tema | Decisión |
|------|----------|
| URL del backend | El frontend actúa como proxy de `/api/v1/*` mediante `proxy.ts` y lee `SGSST_API_URL` en cada petición. Una sola imagen para todos los entornos y sin CORS. Reemplaza el acuerdo previo de "sin proxy". |
| Gestor de paquetes | pnpm es el único oficial. Se elimina `package-lock.json`. |
| Docker Compose | Levanta solo el frontend; el backend se publica y despliega desde su propio repositorio. |
| GitHub Actions | CI en cada PR y, en `main` y en las etiquetas `v*`, publicación de la imagen en GHCR. El despliegue sigue siendo manual. |
| Tests | Vitest, con tests del proxy y de los clientes de la API. |

> Los `rewrites` de `next.config.mjs` no sirven para este objetivo: Next los fija durante el build. El proxy tiene que vivir en `proxy.ts`, que se ejecuta en cada petición.

## Ruta rápida

| Fase | Resultado | Bloquea despliegue |
|------|-----------|--------------------|
| 0 | Toolchain reproducible: pnpm, Node 24 fijado | Sí |
| 1 | Calidad verificable: typecheck, lint, Vitest, limpieza de deuda | Sí |
| 2 | Proxy en runtime y health check | Sí |
| 3 | Dockerfile y Docker Compose | Sí |
| 4 | Workflows de GitHub Actions | Sí |
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
   - `deps`: `corepack enable` y `pnpm install --frozen-lockfile`.
   - `builder`: `pnpm build` con `NEXT_TELEMETRY_DISABLED=1`.
   - `runner`: copia solo `.next/standalone` y `.next/static`, corre con un usuario sin privilegios, `ENV PORT=3000 HOSTNAME=0.0.0.0` y un `HEALTHCHECK` contra `/api/health`.
3. Crear un `.dockerignore` que excluya `node_modules`, `.next`, `.git`, `.env*`, `.codegraph`, `.atl`, `odd` y `planning`.

**Cambios — Compose**
1. Crear `docker-compose.yml` con un único servicio `frontend`:
   - `image: ghcr.io/jorgegutierrez11/sgsst-rag-frontend:${IMAGE_TAG:-latest}`, con `build: .` como alternativa local.
   - `environment: SGSST_API_URL` (obligatoria), `ports: 3000:3000`, `restart: unless-stopped` y `healthcheck`.
   - `extra_hosts: host.docker.internal:host-gateway`, para llegar a un backend que corre en el host durante el desarrollo.
2. Crear `docker-compose.backend-network.yml` como override opcional que conecta el servicio a una red externa compartida con el backend, por ejemplo `SGSST_API_URL=http://backend:8000`. Así el backend no necesita exponerse a internet.

**Archivos:** `next.config.mjs`, `Dockerfile` (nuevo), `.dockerignore` (nuevo), `docker-compose.yml` (nuevo), `docker-compose.backend-network.yml` (nuevo).

**Criterios de aceptación**
- [ ] `docker compose up --build` levanta la app y el health check queda en `healthy`.
- [ ] La imagen no contiene `.env*` ni el código fuente completo.
- [ ] El contenedor no corre como root.

**Riesgo:** ítem 5 (entorno de ejecución).

---

## Fase 4 — GitHub Actions

**Cambios**
1. Crear `.github/workflows/ci.yml`, que corre en `pull_request` y en `push` a `main`:
   - `pnpm/action-setup` y `actions/setup-node` con Node 24 y caché de pnpm.
   - `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build`.
   - En los PR, un build de la imagen Docker sin publicarla, para detectar un `Dockerfile` roto antes del merge.
2. Crear `.github/workflows/publish-image.yml`, que corre en `push` a `main` y en las etiquetas `v*`:
   - Repite las verificaciones de calidad como job previo (`needs`), para no publicar sin pasar CI.
   - `docker/login-action` contra GHCR con `GITHUB_TOKEN` y `permissions: packages: write`.
   - `docker/metadata-action` con etiquetas `sha-<corto>`, `latest` (solo en `main`) y semver (en las etiquetas).
   - `docker/build-push-action` con caché `type=gha`.
3. Fijar las actions a versiones mayores estables.

**Archivos:** `.github/workflows/ci.yml` (nuevo), `.github/workflows/publish-image.yml` (nuevo).

**Criterios de aceptación**
- [ ] Un PR con un error de tipos o un test roto queda en rojo.
- [ ] Un merge a `main` publica `ghcr.io/jorgegutierrez11/sgsst-rag-frontend:latest` y la etiqueta `sha-*`.
- [ ] La imagen publicada arranca con `docker compose up` cambiando solo `SGSST_API_URL`.

**Riesgo:** ítem 5 (CI y release).

---

## Fase 5 — Documentación

**Cambios**
1. Actualizar `GUIA_EJECUCION_FRONTEND.md`: solo pnpm, Node 24, `SGSST_API_URL` en lugar de `NEXT_PUBLIC_*` y eliminar la referencia obsoleta a `NEXT_PUBLIC_DIAGNOSTIC_API_URL` y al puerto 8001.
2. Agregar a esa guía una sección de despliegue con Docker: variables, `docker compose up`, la red compartida opcional y cómo descargar la imagen desde GHCR.
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
