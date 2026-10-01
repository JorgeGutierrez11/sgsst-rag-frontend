# Guía de ejecución del frontend

Esta guía describe cómo preparar y levantar localmente el frontend web del proyecto SG-SST.

El frontend está desarrollado con **Next.js, React, TypeScript y Tailwind CSS**.

---

## 1. Requisitos previos

Antes de iniciar, se requiere:

- Git.
- Node.js.
- pnpm.
- Los dos servicios backend cuando se quiera utilizar la aplicación completa.

Se recomienda utilizar una versión LTS moderna de Node.js. Durante el desarrollo se utiliza el ecosistema de Node 24.

Verificar la instalación:

```bash
node --version
```

Verificar npm:

```bash
npm --version
```

---

## 2. Instalar pnpm

El repositorio contiene:

```text
pnpm-lock.yaml
pnpm-workspace.yaml
```

Por esta razón, el gestor de paquetes recomendado para el proyecto es **pnpm**.

Si Node.js incluye Corepack:

```bash
corepack enable
```

Después verificar:

```bash
pnpm --version
```

Si `pnpm` no está disponible mediante Corepack, puede instalarse globalmente con npm:

```bash
npm install -g pnpm
```

---

## 3. Instalar las dependencias del proyecto

Ubicarse en la raíz del repositorio:

```bash
cd sgsst-rag-frontend
```

Instalar las dependencias:

```bash
pnpm install
```

Este comando instala las dependencias declaradas en `package.json`, incluyendo Next.js, React, TypeScript, Tailwind CSS, Lucide y las demás librerías utilizadas por el proyecto.

No es necesario instalar Next.js, React o Tailwind de forma individual.

---

## 4. Backends requeridos

Para utilizar todas las funcionalidades del frontend deben estar ejecutándose:

```text
Agente 1 — Consulta normativa
http://127.0.0.1:8000
```

y:

```text
Agente 2 — Diagnóstico
http://127.0.0.1:8001
```

El frontend se ejecuta en:

```text
http://localhost:3000
```

Por tanto, durante el desarrollo normalmente se utilizan tres terminales:

```text
Terminal 1 → Agente 1 :8000
Terminal 2 → Agente 2 :8001
Terminal 3 → Frontend :3000
```

---

## 5. Levantar el frontend

Desde la raíz del repositorio:

```bash
pnpm dev
```

Abrir en el navegador:

```text
http://localhost:3000
```

Las principales vistas del prototipo son:

```text
http://localhost:3000/consulta
http://localhost:3000/diagnostico
```

---

## 6. Verificar TypeScript

Antes de trabajar o después de realizar cambios importantes, se puede validar el proyecto con:

```bash
pnpm exec tsc --noEmit
```

Si el comando termina sin mostrar errores, la comprobación de tipos fue satisfactoria.

---

## 7. Configuración de las APIs

En desarrollo local se utilizan los siguientes puertos:

```text
Agente 1 → http://127.0.0.1:8000
Agente 2 → http://127.0.0.1:8001
```

El módulo del Agente 2 admite la variable pública:

```text
NEXT_PUBLIC_DIAGNOSTIC_API_URL
```

Si no se define, utiliza por defecto:

```text
http://127.0.0.1:8001/api/v1/diagnostics
```

Para el entorno local actual no es necesario configurar esta variable mientras el Agente 2 se ejecute en el puerto `8001`.

---

## 8. Ejecuciones posteriores

La instalación de dependencias solo es necesaria la primera vez o cuando cambia `package.json` o `pnpm-lock.yaml`.

Para iniciar nuevamente el frontend:

```bash
cd sgsst-rag-frontend
pnpm dev
```

---

## 9. Problemas frecuentes

### `pnpm: command not found`

Habilitar Corepack:

```bash
corepack enable
```

o instalar pnpm:

```bash
npm install -g pnpm
```

### El puerto 3000 ya está ocupado

Consultar qué proceso lo está utilizando:

```bash
ss -ltnp | grep ':3000'
```

### La interfaz abre pero la consulta normativa falla

Verificar que el Agente 1 esté ejecutándose:

```bash
curl http://127.0.0.1:8000/health
```

### El diagnóstico no inicia

Verificar que el Agente 2 esté ejecutándose:

```bash
curl http://127.0.0.1:8001/api/v1/diagnostics/health
```

### Cambios del favicon no aparecen

Los navegadores suelen mantener el favicon en caché. Reiniciar el servidor si es necesario:

```bash
rm -rf .next
pnpm dev
```

y realizar una recarga fuerte del navegador.

---

## 10. Compilación de producción

Para comprobar que el frontend puede compilarse:

```bash
pnpm build
```

Para ejecutar una compilación ya generada:

```bash
pnpm start
```

Durante el desarrollo cotidiano debe utilizarse:

```bash
pnpm dev
```

---

## 11. Detener el frontend

En la terminal donde está ejecutándose Next.js:

```text
Ctrl + C
```

Esto detiene el servidor de desarrollo.
