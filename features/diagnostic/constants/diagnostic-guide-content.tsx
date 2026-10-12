import type { ReactNode } from 'react'

type GuideListItem = {
  id: string
  content: ReactNode
}

export const DIAGNOSTIC_GUIDE_STEPS = [
  {
    title: 'Cuéntanos de tu empresa',
    description:
      'Ingresas el nombre y el número de trabajadores. Con eso definimos qué grupo de Estándares Mínimos aplica.',
  },
  {
    title: 'Responde cada requisito',
    description: 'Contesta Sí o No, o explica tu situación con tus palabras.',
  },
  {
    title: 'Descarga tu informe',
    description:
      'Recibes un PDF orientativo con los resultados, la calificación y los comentarios.',
  },
]

export const DIAGNOSTIC_SCOPE_ITEMS: GuideListItem[] = [
  {
    id: 'norma',
    content: (
      <>
        Los <strong className="text-txt-bold">Estándares Mínimos del SG-SST</strong>{' '}
        de la Resolución 0312 de 2019.
      </>
    ),
  },
  {
    id: 'riesgo',
    content: (
      <>
        Solo empresas clasificadas en{' '}
        <strong className="text-txt-bold">riesgo I</strong>.
      </>
    ),
  },
  {
    id: 'grupo',
    content: (
      <>
        El grupo de estándares se define según tu{' '}
        <strong className="text-txt-bold">número de trabajadores</strong>.
      </>
    ),
  },
]

export const DIAGNOSTIC_LIMIT_ITEMS: GuideListItem[] = [
  {
    id: 'auditoria',
    content: (
      <>
        Una <strong className="text-txt-bold">auditoría</strong>.
      </>
    ),
  },
  {
    id: 'verificacion',
    content: (
      <>
        Una <strong className="text-txt-bold">verificación oficial</strong>.
      </>
    ),
  },
  {
    id: 'certificacion',
    content: (
      <>
        Una <strong className="text-txt-bold">certificación de cumplimiento</strong>.
      </>
    ),
  },
  {
    id: 'asesoria',
    content: (
      <>
        <strong className="text-txt-bold">Asesoría jurídica o profesional</strong>{' '}
        en Seguridad y Salud en el Trabajo.
      </>
    ),
  },
]
