# syntax=docker/dockerfile:1

# 1. CONFIGURACIÓN BASE
ARG NODE_IMAGE=node:24.21.0-alpine

FROM ${NODE_IMAGE} AS base

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# pnpm se fija desde "packageManager" en package.json
RUN corepack enable

WORKDIR /app


# 2. DEPENDENCIAS
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile


# 3. DESARROLLO
# Usada por compose.dev.yaml: servidor de desarrollo con recarga en caliente.
FROM base AS development

ENV NODE_ENV=development

RUN chown node:node /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["node_modules/.bin/next", "dev", "--hostname", "0.0.0.0", "--port", "3000"]


# 4. CONSTRUCCIÓN
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build


# 5. IMAGEN DE PRODUCCIÓN
FROM ${NODE_IMAGE} AS runtime

# Vincula la imagen publicada en GHCR con este repositorio
LABEL org.opencontainers.image.source=https://github.com/JorgeGutierrez11/sgsst-rag-frontend

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

WORKDIR /app

# Solo el servidor standalone y los estáticos: sin código fuente ni dependencias de desarrollo
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Ejecutar sin root
USER node

EXPOSE 3000


# 6. HEALTHCHECK
HEALTHCHECK --interval=30s \
    --timeout=5s \
    --start-period=20s \
    --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]


# 7. INICIO DE NEXT.JS
# SGSST_API_URL se lee en tiempo de ejecución desde proxy.ts; se define al arrancar el contenedor.
CMD ["node", "server.js"]
