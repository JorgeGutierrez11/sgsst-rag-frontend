# Consulta con API real Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** reemplazar la respuesta mock del agente de consulta por consumo real de `http://127.0.0.1:8000/api/v1/query`, sin mostrar respuestas falsas.

**Architecture:** la feature de consulta debe separar UI, tipos y acceso a API. `ConsultationView` orquesta estado de pantalla; un cliente pequeño hace el `fetch`; los mensajes del asistente solo se agregan cuando la API responde exitosamente con `answer`.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.7, Client Components, Fetch API, Tailwind CSS existente.

## Global Constraints

- Las respuestas del asistente deben venir solo de la API real.
- No conservar fallback con respuestas falsas, mockeadas o inventadas.
- Las preguntas directas/chips de ejemplo se conservan.
- El endpoint inicial es `http://127.0.0.1:8000/api/v1/query`.
- El request debe enviar `{ question: string, conversation_id: string }`.
- El response esperado es `{ answer: string, references: string[], conversation_id: string }`.
- Si la API falla, mostrar error; no agregar mensaje de asistente.
- Lo que ya no se use debe eliminarse.
- Mantener copy visible en español.
- Código simple: funciones pequeñas, nombres intencionales, sin lógica de red mezclada con JSX.
- Verificar con `pnpm exec tsc --noEmit` antes de `pnpm build`.

---

## Estado actual verificado

- `features/consultation/consultation-view.tsx` usa `mockAssistantMessage` y `setTimeout(700)`.
- `features/consultation/examples.ts` contiene las preguntas sugeridas; deben conservarse.
- `features/consultation/message-list.tsx` ya renderiza `references`.
- `features/consultation/consultation-composer.tsx` ya maneja input, botón de envío y Enter con IME.
- No hay tests configurados; la verificación mínima real será TypeScript + build + prueba manual.

## File map

### Crear

- `features/consultation/consultation-api.ts`: cliente HTTP de la API de consulta.

### Modificar

- `features/consultation/consultation.types.ts`: agregar tipos de request/response/API error si hace falta.
- `features/consultation/consultation-view.tsx`: eliminar mock, llamar API real y manejar `conversation_id`.
- `features/consultation/consultation-composer.tsx`: ajustar estado disabled si se necesita bloquear mientras carga.
- `features/consultation/message-list.tsx`: renderizar fuentes solo si `references.length > 0`.

### Eliminar

- `mockAssistantMessage`.
- `await new Promise((resolve) => setTimeout(resolve, 700))`.
- Cualquier helper o import que quede sin uso después del cambio.

---

## Task 1: extender tipos de consulta

**Files:**
- Modify: `features/consultation/consultation.types.ts`

**Interfaces:**
- Consumes: contrato API entregado por el usuario.
- Produces: tipos compartidos para UI y cliente HTTP.

- [ ] **Step 1: reemplazar el contenido de `consultation.types.ts`**

Use:
```ts
export type ConsultationMessage = {
  role: 'user' | 'assistant'
  content: string
  references?: string[]
}

export type ConsultationQueryRequest = {
  question: string
  conversation_id: string
}

export type ConsultationQueryResponse = {
  answer: string
  references: string[]
  conversation_id: string
}
```

- [ ] **Step 2: validar que los nombres son de dominio, no técnicos genéricos**

Expected:
- `ConsultationQueryRequest` describe el request real.
- `ConsultationQueryResponse` describe la respuesta real.
- No usar nombres vagos como `ApiData`, `Payload` o `ResponseData`.

- [ ] **Step 3: commit sugerido**

```bash
git add features/consultation/consultation.types.ts
git commit -m "refactor: define consultation api types"
```

---

## Task 2: crear cliente HTTP para la API real

**Files:**
- Create: `features/consultation/consultation-api.ts`

**Interfaces:**
- Consumes: `ConsultationQueryRequest`.
- Produces: `queryConsultation(request): Promise<ConsultationQueryResponse>`.

- [ ] **Step 1: crear `consultation-api.ts`**

Use:
```ts
import type { ConsultationQueryRequest, ConsultationQueryResponse } from '@/features/consultation/consultation.types'

const CONSULTATION_API_URL = 'http://127.0.0.1:8000/api/v1/query'

export async function queryConsultation(request: ConsultationQueryRequest): Promise<ConsultationQueryResponse> {
  const response = await fetch(CONSULTATION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('No se pudo consultar la API normativa.')
  }

  const data = await response.json()

  if (!isConsultationQueryResponse(data)) {
    throw new Error('La API normativa devolvió una respuesta inválida.')
  }

  return data
}

function isConsultationQueryResponse(value: unknown): value is ConsultationQueryResponse {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.answer === 'string' &&
    Array.isArray(candidate.references) &&
    candidate.references.every((reference) => typeof reference === 'string') &&
    typeof candidate.conversation_id === 'string'
  )
}
```

- [ ] **Step 2: revisar clean code del cliente**

Expected:
- Una función pública: `queryConsultation`.
- Una función privada: `isConsultationQueryResponse`.
- Ninguna función mezcla JSX, estado React o red con UI.
- El error no inventa una respuesta de asistente.

- [ ] **Step 3: commit sugerido**

```bash
git add features/consultation/consultation-api.ts
git commit -m "feat: add consultation api client"
```

---

## Task 3: conectar `ConsultationView` a la API real

**Files:**
- Modify: `features/consultation/consultation-view.tsx`

**Interfaces:**
- Consumes: `queryConsultation`.
- Produces: envío real de consulta y persistencia de `conversation_id` recibido.

- [ ] **Step 1: eliminar mock e importar cliente real**

Remove:
```ts
const mockAssistantMessage: ConsultationMessage = {
  role: 'assistant',
  content: 'He revisado tu consulta. Como orientación inicial, conviene identificar la normativa aplicable a tu actividad y documentar las medidas adoptadas. Esta respuesta es informativa y debe contrastarse con la fuente oficial correspondiente.',
  references: ['Ley 31/1995 de Prevención de Riesgos Laborales', 'Guía técnica del INSST'],
}
```

Add import:
```ts
import { queryConsultation } from '@/features/consultation/consultation-api'
```

Expected: no queda ninguna constante mock de respuesta del asistente.

- [ ] **Step 2: agregar estado para conversación**

Inside `ConsultationView`:
```ts
const [conversationId, setConversationId] = useState(() => crypto.randomUUID())
```

Expected: el primer request ya tiene `conversation_id`, y la UI puede actualizarlo con el valor devuelto por la API.

- [ ] **Step 3: reemplazar `send` por implementación real**

Use:
```ts
const send = async (text = input) => {
  const question = text.trim()

  if (!question || loading) return

  setInput('')
  setError('')
  setMessages((current) => [...current, { role: 'user', content: question }])
  setLoading(true)

  try {
    const response = await queryConsultation({
      question,
      conversation_id: conversationId,
    })

    setConversationId(response.conversation_id)
    setMessages((current) => [
      ...current,
      {
        role: 'assistant',
        content: response.answer,
        references: response.references,
      },
    ])
  } catch {
    setError('No pudimos obtener una respuesta de la API. Intenta nuevamente cuando el servicio esté disponible.')
  } finally {
    setLoading(false)
  }
}
```

Expected:
- Se conserva el mensaje del usuario.
- Solo se agrega mensaje assistant si `queryConsultation` responde bien.
- No hay fallback de contenido normativo inventado.
- `loading` siempre vuelve a `false` por `finally`.

- [ ] **Step 4: revisar imports sin uso**

Expected:
- `ConsultationMessage` sigue usado para `messages`.
- No quedan imports relacionados con mocks o timers.

- [ ] **Step 5: commit sugerido**

```bash
git add features/consultation/consultation-view.tsx
git commit -m "feat: query real consultation api"
```

---

## Task 4: ajustar render de referencias y estados vacíos

**Files:**
- Modify: `features/consultation/message-list.tsx`
- Modify: `features/consultation/consultation-composer.tsx` si hace falta

**Interfaces:**
- Consumes: `ConsultationMessage.references?: string[]`.
- Produces: UI que no muestra sección de fuentes vacía.

- [ ] **Step 1: evitar render de fuentes vacías**

In `message-list.tsx`, replace:
```tsx
{message.references && (
```

With:
```tsx
{message.references && message.references.length > 0 && (
```

Expected: si la API devuelve `references: []`, no aparece “Fuentes consultadas” vacío.

- [ ] **Step 2: conservar preguntas directas**

Verify `features/consultation/examples.ts` still exports:
```ts
export const consultationExamples = [
  '¿Qué obligaciones tiene mi empresa en materia de igualdad?',
  '¿Cuándo debo realizar la evaluación de riesgos psicosociales?',
  '¿Qué documentación necesito para una inspección de trabajo?',
]
```

Expected: los chips siguen llamando `send(example)` desde `ConsultationView`.

- [ ] **Step 3: mantener disclaimer honesto**

Keep this copy in `consultation-composer.tsx` unless producto pida otra cosa:
```tsx
<p>ChattyAI puede cometer errores. Verifica la información importante.</p>
```

Expected: el usuario sabe que debe verificar, pero la app no inventa respuestas.

- [ ] **Step 4: commit sugerido**

```bash
git add features/consultation/message-list.tsx features/consultation/consultation-composer.tsx features/consultation/examples.ts
git commit -m "fix: avoid empty consultation references"
```

---

## Task 5: eliminar basura que quedó del mock

**Files:**
- Search: `features/consultation/*`
- Search: `app components features lib shared`

**Interfaces:**
- Consumes: cambios de Tasks 1-4.
- Produces: código sin mocks ni imports muertos.

- [ ] **Step 1: buscar respuestas falsas o mocks**

Run:
```bash
grep -R "mockAssistantMessage\|setTimeout\|He revisado tu consulta\|Ley 31/1995\|Guía técnica del INSST" -n app components features lib shared
```

Expected: sin salida.

- [ ] **Step 2: buscar imports muertos evidentes**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: exit code `0`. Si pnpm no está disponible, habilitar pnpm antes de implementar.

- [ ] **Step 3: commit sugerido**

```bash
git add app components features lib shared
git commit -m "chore: remove consultation mock leftovers"
```

---

## Task 6: verificación manual con API local

**Files:**
- No code changes expected.

**Interfaces:**
- Consumes: API local disponible en `http://127.0.0.1:8000/api/v1/query`.
- Produces: evidencia de flujo real funcionando.

- [ ] **Step 1: levantar API backend local**

Run the backend service separately so this endpoint responds:
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/query \
  -H 'Content-Type: application/json' \
  -d '{"question":"¿Qué estándares mínimos debe cumplir una empresa de 8 trabajadores riesgo I?","conversation_id":"abc-123"}'
```

Expected response shape:
```json
{
  "answer": "Según la Resolución 0312 de 2019...",
  "references": [
    "Resolución 0312 de 2019, artículo 3",
    "Resolución 0312 de 2019, artículo 16"
  ],
  "conversation_id": "abc-123"
}
```

- [ ] **Step 2: ejecutar app frontend**

Run:
```bash
pnpm dev
```

Expected: Next dev server starts.

- [ ] **Step 3: probar pregunta escrita**

Manual flow:
1. Abrir la app.
2. Ir a “Consulta normativa”.
3. Escribir: `¿Qué estándares mínimos debe cumplir una empresa de 8 trabajadores riesgo I?`
4. Enviar.

Expected:
- aparece mensaje del usuario;
- aparece loading;
- aparece respuesta exacta entregada por API;
- aparecen referencias entregadas por API;
- no aparece texto mock anterior.

- [ ] **Step 4: probar chip de pregunta directa**

Manual flow:
1. Volver a una conversación vacía o recargar.
2. Click en un chip de ejemplo.

Expected:
- el chip envía la pregunta a la API;
- la respuesta viene de API;
- no hay respuesta falsa local.

- [ ] **Step 5: probar API caída**

Manual flow:
1. Apagar backend.
2. Enviar una pregunta.

Expected:
- aparece mensaje del usuario;
- aparece error en español;
- no aparece mensaje del asistente inventado.

---

## Task 7: verificación final técnica

**Files:**
- Read: `package.json`
- Read: `features/consultation/*`

**Interfaces:**
- Consumes: todos los cambios anteriores.
- Produces: prueba mínima de calidad antes de integrar más IA.

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

- [ ] **Step 3: revisar diff final**

Run:
```bash
git diff -- features/consultation
```

Expected:
- existe `consultation-api.ts`;
- no existe mock de respuesta;
- `ConsultationView` solo agrega respuestas assistant desde `queryConsultation`;
- preguntas de ejemplo siguen existiendo.

- [ ] **Step 4: commit sugerido**

```bash
git add features/consultation
git commit -m "feat: connect consultation agent to api"
```

---

## Criterio de aceptación

- El agente de consulta hace `POST` a `http://127.0.0.1:8000/api/v1/query`.
- El body enviado contiene `question` y `conversation_id`.
- La respuesta del asistente usa únicamente `response.answer`.
- Las referencias usan únicamente `response.references`.
- `conversation_id` se inicializa en frontend y se actualiza con el valor devuelto por API.
- Si la API falla o responde con forma inválida, se muestra error y no se muestra respuesta falsa.
- Las preguntas directas/chips se conservan.
- No quedan `mockAssistantMessage`, `setTimeout` ni textos normativos fake hardcodeados.
- `pnpm exec tsc --noEmit` pasa.
- `pnpm build` pasa.

## Riesgos y decisiones futuras

- El endpoint está hardcodeado a localhost. Es correcto por ahora porque el usuario dijo “por el momento”, pero antes de deploy debe pasar a variable de entorno pública o proxy server-side.
- Si el backend no tiene CORS habilitado para el origen de Next, el fetch desde navegador fallará. No inventar workaround en frontend; corregir CORS en backend o crear ruta proxy en Next.
- No agregar streaming, historial avanzado ni persistencia todavía. Primero API real simple y confiable; después sofisticación. Esa es la diferencia entre construir producto y coleccionar juguetes.
