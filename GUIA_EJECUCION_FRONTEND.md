# Guía de ejecución del frontend

Esta guía explica cómo levantar el frontend de NormIA (Next.js, React, TypeScript y Tailwind CSS) en local o con Docker, y cómo conectarlo con el backend del proyecto SG-SST (`proyecto_rag`).

El navegador nunca llama al backend directamente. El servidor de Next.js recibe las peticiones a `/api/v1/*` y las reenvía (`proxy.ts`) al backend indicado en la variable **`SGSST_API_URL`**, que se lee en tiempo de ejecución: cambiarla solo requiere reiniciar, no reconstruir.

---

## 1. Ruta rápida

Elige un modo según lo que necesites:

| Modo | Para qué | Comando | `SGSST_API_URL` |
|------|----------|---------|-----------------|
| **A. Local** | Programar con recarga rápida | `pnpm dev` | `http://127.0.0.1:8000` en `.env.local` |
| **B. Docker** | Probar la imagen tal como se desplegará | `docker compose -f compose.yaml -f compose.backend-network.yaml up -d --build` | `http://backend:8000` en `.env` |
| **C. Docker dev** | Programar dentro de Docker con recarga | `docker compose -f compose.yaml -f compose.dev.yaml -f compose.backend-network.yaml up --build` | `http://backend:8000` en `.env` |

En los tres casos la aplicación queda en **http://localhost:3000**, con las vistas `/consulta` y `/diagnostico`.

---

## 2. Requisitos

| Herramienta | Versión | Necesaria para |
|-------------|---------|----------------|
| Git | Cualquiera reciente | Todos los modos |
| Node.js | 24 (fijada en `.nvmrc`) | Modo A |
| pnpm | 11.25.0 (fijada en `package.json`, vía Corepack) | Modo A |
| Docker con Docker Compose v2 | `docker compose version` debe responder | Modos B y C |
| Backend `proyecto_rag` | Levantado en el puerto 8000 | Usar consulta y diagnóstico |

pnpm es el único gestor de paquetes del proyecto (`pnpm-lock.yaml`). Corepack instala la versión exacta declarada en `package.json`:

```bash
corepack enable
pnpm --version   # 11.25.0
```

---

## 3. La variable `SGSST_API_URL`

Es la única configuración obligatoria. Su valor depende de **desde dónde** se hace la llamada al backend:

| Cómo corre el frontend | Archivo | Valor |
|------------------------|---------|-------|
| `pnpm dev` en tu máquina | `.env.local` | `http://127.0.0.1:8000` |
| Docker + `compose.backend-network.yaml` (backend con su Compose) | `.env` | `http://backend:8000` |
| Docker, backend corriendo fuera de Docker | `.env` | `http://host.docker.internal:8000` |

> **Dentro de un contenedor, `127.0.0.1` y `localhost` son el propio contenedor**, no tu máquina. Con Docker nunca uses esos valores.

`.env.example` documenta estas opciones. Cópialo al archivo que corresponda y deja un solo valor:

```bash
cp .env.example .env.local   # modo A
cp .env.example .env         # modos B y C (luego cambia el valor a http://backend:8000)
```

Ambos archivos están en `.gitignore` y nunca entran en la imagen Docker.

---

## 4. Modo A: local con `pnpm dev`

```bash
pnpm install
pnpm dev
```

Requiere el backend escuchando en `http://127.0.0.1:8000`.

---

## 5. Modo B: Docker (imagen de producción local)

Sigue la misma estructura que el backend:

| Archivo | Qué hace |
|---------|----------|
| `Dockerfile` | Etapas numeradas: base, dependencias, desarrollo, construcción, imagen de producción, healthcheck e inicio |
| `compose.yaml` | Construye y usa la imagen local `sg-sst-frontend:local`; publica el puerto solo en `127.0.0.1:3000` |
| `compose.backend-network.yaml` | Une el frontend a la red del backend (`sg-sst_default`) para llamarlo como `http://backend:8000` |

Pasos:

```bash
# 1. En proyecto_rag: levantar el backend (crea la red sg-sst_default)
docker compose up -d

# 2. En este repositorio: levantar el frontend unido a esa red
docker compose -f compose.yaml -f compose.backend-network.yaml up -d --build
```

Comandos útiles:

| Situación | Comando |
|-----------|---------|
| Primera vez o imagen inexistente | `up -d` (Compose la construye solo) |
| Cambiaste el código | `up -d --build` |
| Solo cambiaste `SGSST_API_URL` | `up -d` (no hace falta reconstruir) |
| Ver estado | `docker compose ps` (debe decir `healthy`) |
| Ver logs | `docker compose logs -f frontend` |
| Detener | `docker compose down` |

> Si `docker compose up` responde `required variable SGSST_API_URL is missing a value`, falta definir la variable en `.env` (sección 3).

---

## 6. Modo C: Docker en desarrollo

`compose.dev.yaml` cambia la imagen de producción por `next dev` (etiqueta `sg-sst-frontend:dev`) y monta en solo lectura `app/`, `components/`, `features/`, `lib/`, `shared/` y `proxy.ts`. Los cambios en esos archivos se ven sin reconstruir.

```bash
docker compose -f compose.yaml -f compose.dev.yaml -f compose.backend-network.yaml up --build
```

Si cambias dependencias o configuración (`package.json`, `next.config.mjs`), vuelve a ejecutar con `--build`.

---

## 7. Verificar la calidad del código

Los mismos comandos que ejecuta GitHub Actions:

| Comando | Qué verifica |
|---------|--------------|
| `pnpm typecheck` | Tipos de TypeScript |
| `pnpm lint` | Reglas de ESLint (Next.js y React) |
| `pnpm test` | Tests unitarios con Vitest (proxy, clientes de la API, health check) |
| `pnpm build` | Build de producción (falla si hay errores de tipos) |

---

## 8. Integración continua (GitHub Actions)

| Workflow | Cuándo corre | Qué hace |
|----------|--------------|----------|
| `tests.yml` | Push a `dev` y `main`, PR a `main`, manual; también lo llama `image.yml` | Instalación con lockfile, typecheck, lint, tests y build |
| `image.yml` | Push a `main`, PR a `main`, manual | Corre primero `tests.yml`; luego construye la imagen, revisa su higiene (sin root, sin `.env` ni código fuente) y prueba su arranque. Solo en `main` publica esa misma imagen en GHCR |

Publicación en GHCR:

- Solo en push (o ejecución manual) sobre `main`. Los PR construyen y prueban la imagen, pero nunca la publican.
- Se publica la misma imagen que pasó la prueba de arranque (se re-etiqueta, no se reconstruye): `ghcr.io/jorgegutierrez11/sg-sst-frontend:sha-<7 caracteres>` y `:main`.
- Usa el `GITHUB_TOKEN` del workflow: no hace falta un PAT ni secretos nuevos.
- Tras la primera publicación, hay que cambiar una sola vez la visibilidad del paquete a pública (configuración del paquete en GitHub) para que la VPS lo descargue sin credenciales.

Ningún workflow despliega. El Compose de producción vive en el repositorio del backend (`deploy/`).

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `required variable SGSST_API_URL is missing a value` | Falta la variable para Compose | Definirla en `.env` (sección 3) |
| La consulta falla; en los logs `ECONNREFUSED 127.0.0.1:8000` | Se usó `127.0.0.1` o `localhost` dentro de Docker | Usar `http://backend:8000` con `compose.backend-network.yaml` |
| `ENOTFOUND backend` | El frontend no está en la red del backend | Agregar `-f compose.backend-network.yaml` y verificar que el backend esté levantado |
| `network sg-sst_default declared as external, but could not be found` | El backend no está levantado con su Compose | Levantar primero el backend en `proyecto_rag` |
| `ETIMEDOUT` hacia `host.docker.internal` | El firewall del host bloquea el tráfico desde Docker | Usar el backend en Docker con `compose.backend-network.yaml` |
| Respuesta 503: "falta configurar la conexión con el backend" | `SGSST_API_URL` vacía o no es una URL válida | Corregir el valor y reiniciar |
| Los cambios de código no aparecen en Docker (modo B) | La imagen existente se reutiliza | `docker compose up -d --build` |
| El puerto 3000 ya está ocupado | Otro proceso lo usa | `ss -ltnp \| grep ':3000'`, o definir `FRONTEND_PORT` en `.env` |

Para comprobar el backend directamente desde tu máquina:

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/health/ready
```

Y el frontend:

```bash
curl http://localhost:3000/api/health   # {"status":"ok"}
```
