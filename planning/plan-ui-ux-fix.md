Plan de mejoras UI/UX por fases — NormIA
Objetivo general
Convertir NormIA de una interfaz funcional con dos agentes separados en una experiencia guiada, clara y conectada, donde el usuario entienda qué hace la plataforma, cómo iniciar, cómo responder y cómo pedir ayuda cuando no sabe qué contestar.
Principios de diseño
- Claridad antes que decoración.
- Progressive disclosure: mostrar información en el momento correcto.
- Acciones principales visibles, ayudas secundarias no invasivas.
- Mobile-first: nada debe depender solo de desktop.
- Consistencia entre agentes: Consulta y Diagnóstico deben sentirse parte del mismo flujo.
Fase 1: Mejorar vista Home
Problema a resolver
La Home está limpia, pero no comunica con fuerza qué hace NormIA ni cómo se relacionan los dos agentes.
Hoy se entiende que hay:
- Consulta normativa.
- Diagnóstico guiado.
Pero falta explicar el flujo de valor:
Pregunta dudas → entiende obligaciones → diagnostica tu empresa → descarga informe
Archivos objetivo
features/home/home-view.tsx
Posibles archivos relacionados si se requiere mantener consistencia:
shared/navigation.routes.ts
components/layout/*
Cambios propuestos
1. Reforzar propuesta de valor
Cambiar el hero para que explique mejor qué hace NormIA:
NormIA te ayuda a entender obligaciones SG-SST, resolver dudas normativas y evaluar el estado de tu empresa con orientación guiada.
No debe sonar como chatbot genérico. Debe sonar como herramienta normativa.
2. Mostrar los dos agentes como flujo conectado
Replantear las tarjetas actuales:
Consulta normativa
Diagnóstico SG-SST
como dos capacidades complementarias:
1. Consulta tus dudas
2. Evalúa tu cumplimiento
Agregar una pequeña línea de conexión:
Usa la consulta para entender una obligación y el diagnóstico para evaluar cómo está tu empresa.
3. Mejorar CTA principal
Actualmente el CTA principal lleva a consulta. Eso puede dejar el diagnóstico en segundo plano.
Propuesta:
- CTA principal:
Comenzar diagnóstico
- CTA secundario:
Hacer una consulta normativa
O, si se quiere mantener Consulta como entrada principal:
- CTA principal:
Consultar una duda
- CTA secundario claro:
Evaluar mi empresa
Mi recomendación: priorizar Diagnóstico si el producto quiere generar informe/evaluación.
4. Añadir bloque “Qué puedes hacer con NormIA”
Tres beneficios breves:
- Entender obligaciones aplicables.
- Resolver dudas antes de responder.
- Descargar un informe orientativo.
Resultado esperado
La Home debe responder en menos de 5 segundos:
qué es NormIA
qué agentes tiene
qué valor entrega
qué acción tomar primero
Criterios de aceptación
- El usuario entiende que hay dos agentes conectados.
- Hay CTA claro para diagnóstico y consulta.
- La Home no se vuelve pesada ni llena de texto.
- Mobile sigue sin scroll innecesario o, si hay scroll, es natural y controlado.
Fase 2: Flujo guiado del Diagnóstico
Problema a resolver
El diagnóstico empieza demasiado rápido con formulario. Falta una etapa previa de contexto.
El usuario debería entender antes:
qué evaluará
qué necesita responder
qué pasa si no sabe
qué recibirá al final
Archivos objetivo
features/diagnostic/diagnostic-view.tsx
features/diagnostic/hooks/use-diagnostic-session.ts
shared/stores/agent-diagnostic.store.ts
Cambios propuestos
1. Agregar estado introductorio antes del formulario
Antes de mostrar empresa/trabajadores, mostrar una guía breve:
Antes de comenzar

1. Te haremos preguntas sobre Estándares Mínimos SG-SST.
2. Puedes responder Sí, No o explicar con tus palabras.
3. Si tienes dudas, podrás pedir ayuda a NormIA.
4. Al final podrás descargar un informe orientativo.
CTA:
Entendido, comenzar
Solo después de ese click aparece el formulario.
2. Ocultar inicialmente el formulario
El formulario de:
Nombre de empresa
Número de trabajadores
debe aparecer después de la guía.
Esto reduce carga cognitiva. No le pides datos antes de explicar el proceso.
3. Simplificar disclaimers
Actualmente hay varios bloques informativos. Deben compactarse.
Propuesta:
Información importante
La evaluación es orientativa y usa como referencia la Resolución 0312 de 2019.
Con link secundario:
Consultar fuente oficial
No convertir el disclaimer en protagonista.
4. Mejorar jerarquía mobile
En mobile, orden recomendado:
Título
Guía breve
CTA comenzar
Formulario
Aviso legal compacto
No poner disclaimer largo antes de la acción principal.
Resultado esperado
El usuario inicia el diagnóstico con más confianza y menos ruido.
Criterios de aceptación
- El formulario no aparece hasta que el usuario confirme la guía.
- La guía es breve y accionable.
- Los disclaimers no compiten con el formulario.
- El flujo sigue funcionando igual después de iniciar.
Fase 3: Conexión entre agentes
Problema a resolver
Consulta Normativa y Diagnóstico SG-SST existen, pero todavía se sienten como herramientas separadas.
El usuario que no sabe responder una pregunta del diagnóstico necesita una salida natural:
“No sé cómo responder esto”
Archivos objetivo
features/diagnostic/diagnostic-view.tsx
features/diagnostic/hooks/use-diagnostic-session.ts
shared/stores/agent-diagnostic.store.ts

features/consultation/consultation-view.tsx
features/consultation/hooks/use-consultation-session.ts
shared/stores/agent-consultation.store.ts

shared/navigation.routes.ts
Cambios propuestos
1. Agregar acción contextual en cada pregunta
En el bloque de pregunta activa, agregar un botón secundario:
Pedir ayuda a NormIA
o más explícito:
No sé cómo responder
Mi recomendación UX:
No sé cómo responder
Porque habla desde la necesidad del usuario, no desde la herramienta.
2. Navegar al agente de consulta
Primera versión:
Click → /consulta
Segunda versión, ideal:
Click → /consulta con prompt preparado
Ejemplo de prompt sugerido:
Necesito ayuda para responder esta pregunta del diagnóstico SG-SST:

Requisito: [requirement_name]
Pregunta: [question_text]

Explícame qué significa y cómo podría saber si mi empresa cumple.
3. Preparar el input de Consulta
La consulta debería abrir con ese texto como borrador, no enviarlo automáticamente.
¿Por qué? Porque el usuario debe tener control.
Flujo ideal:
Diagnóstico
↓
No sé cómo responder
↓
Consulta abre con pregunta prellenada
↓
Usuario revisa y envía
4. Mantener retorno mental al diagnóstico
Después de consultar, el usuario debe poder volver al diagnóstico sin perder estado.
Ya hay storage in-memory para ambos agentes. Esta fase debe aprovecharlo.
Opcional posterior:
Volver al diagnóstico
dentro de Consulta cuando venga desde una pregunta.
Resultado esperado
Los agentes dejan de competir y empiezan a colaborar.
Criterios de aceptación
- Cada pregunta del diagnóstico ofrece ayuda contextual.
- El usuario puede ir a Consulta sin perder progreso.
- Consulta recibe contexto útil de la pregunta.
- No se envía nada automáticamente sin decisión del usuario.
Fase 4: Claridad inmediata / pregunta activa
Problema a resolver
La pregunta cambia, pero el usuario puede no percibir claramente que está en un nuevo ítem.
Este problema es delicado: si el usuario no nota el cambio, puede responder en piloto automático.
Archivos objetivo
features/diagnostic/diagnostic-view.tsx
features/diagnostic/hooks/use-diagnostic-session.ts
shared/stores/agent-diagnostic.store.ts
Cambios propuestos
1. Convertir la pregunta activa en una tarjeta más fuerte
El bloque actual debería tener más jerarquía:
Pregunta actual
Requisito X de Y
[texto de la pregunta]
Visualmente:
- borde izquierdo más visible
- fondo sutil
- badge de progreso
- más separación del formulario de respuesta
2. Agregar microcopy de guía
Debajo de la pregunta:
Responde Sí o No si estás seguro. Si necesitas contexto, pide ayuda a NormIA o explica tu caso con tus palabras.
Esto reduce incertidumbre.
3. Animar cambio de pregunta
Cuando currentQuestion cambia:
- fade in corto
- leve slide vertical
- highlight temporal del borde
Debe respetar reduced motion.
No usar animaciones exageradas. El objetivo es decir:
esto cambió
no decorar.
4. Reubicar “Volver a empezar”
Actualmente puede competir con la pregunta.
Propuesta:
- mantenerlo como acción secundaria
- reducir peso visual
- ubicarlo fuera del bloque principal de pregunta
- evitar que parezca acción relacionada con responder
Resultado esperado
Cada cambio de pregunta se siente claro, contenido y guiado.
Criterios de aceptación
- El usuario identifica la pregunta activa inmediatamente.
- El cambio entre preguntas se percibe.
- La acción principal sigue siendo responder.
- “Pedir ayuda” y “Volver a empezar” no compiten con Sí/No.
Orden de implementación recomendado
Sprint 1
Fase 1: Home
Fase 2: Guía inicial del diagnóstico
Razón: primero se mejora comprensión y entrada al producto.
Sprint 2
Fase 3: Conexión entre agentes
Razón: depende de tener claro el flujo diagnóstico y el propósito de cada agente.
Sprint 3
Fase 4: Pregunta activa
Razón: es polish funcional sobre un flujo ya más claro.
Riesgos a cuidar
- No convertir la Home en landing larga.
- No esconder demasiado el formulario; la guía debe ser breve.
- No enviar automáticamente consultas al agente sin consentimiento.
- No saturar la pregunta activa con demasiados botones.
- Mantener mobile usable: botones mínimo cómodos, sin scroll horizontal.
- Preservar la memoria in-memory de ambos agentes.
Verificación manual por fase
Fase 1
- Abrir /.
- Confirmar que se entiende qué hace NormIA.
- Probar navegación a /consulta y /diagnostico.
- Revisar mobile.
Fase 2
- Abrir /diagnostico.
- Confirmar que aparece primero la guía.
- Avanzar al formulario.
- Iniciar diagnóstico.
- Validar errores de campos.
Fase 3
- Iniciar diagnóstico.
- En una pregunta, usar “No sé cómo responder”.
- Confirmar navegación a Consulta.
- Confirmar que el diagnóstico no pierde estado.
- Confirmar prompt preparado si se implementa esa parte.
Fase 4
- Responder varias preguntas.
- Confirmar que cada nueva pregunta se percibe claramente.
- Verificar reduced motion.
- Revisar mobile y desktop.
Conclusión
Este plan está bien ordenado porque primero mejora comprensión, luego entrada al flujo, después ayuda contextual, y finalmente claridad durante la interacción.
Esa secuencia evita el error típico: pulir microinteracciones antes de que el usuario entienda qué está haciendo. Aquí vamos de fundamentos a detalle.