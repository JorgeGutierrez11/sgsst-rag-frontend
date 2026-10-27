import { describe, expect, it } from 'vitest'
import { buildConsultationHelpQuestion } from '@/features/diagnostic/consultation-help-question'

const requirementName = 'Asignación de una persona que diseñe el Sistema de Gestión de SST'
const catalogName = 'Estándares Mínimos SG-SST - Empresas de 1 a 10 trabajadores - Riesgo I'

describe('buildConsultationHelpQuestion', () => {
  it('includes the worker count, catalog and requirement name', () => {
    expect(buildConsultationHelpQuestion({ requirementName, catalogName, workerCount: '8' })).toBe(
      'Mi empresa tiene 8 trabajadores. Según los Estándares Mínimos SG-SST - Empresas de 1 a 10 trabajadores - Riesgo I, ¿qué exige el requisito «Asignación de una persona que diseñe el Sistema de Gestión de SST» y cómo se verifica su cumplimiento?',
    )
  })

  it('omits the worker sentence when the worker count is blank', () => {
    expect(buildConsultationHelpQuestion({ requirementName, catalogName, workerCount: '  ' })).toBe(
      'Según los Estándares Mínimos SG-SST - Empresas de 1 a 10 trabajadores - Riesgo I, ¿qué exige el requisito «Asignación de una persona que diseñe el Sistema de Gestión de SST» y cómo se verifica su cumplimiento?',
    )
  })

  it('falls back to SG-SST when there is no catalog name', () => {
    expect(buildConsultationHelpQuestion({ requirementName, catalogName: null, workerCount: '8' })).toBe(
      'Mi empresa tiene 8 trabajadores. ¿Qué exige el requisito «Asignación de una persona que diseñe el Sistema de Gestión de SST» del SG-SST y cómo se verifica su cumplimiento?',
    )
  })

  it('trims the worker count', () => {
    expect(buildConsultationHelpQuestion({ requirementName, catalogName: null, workerCount: ' 8 ' })).toBe(
      'Mi empresa tiene 8 trabajadores. ¿Qué exige el requisito «Asignación de una persona que diseñe el Sistema de Gestión de SST» del SG-SST y cómo se verifica su cumplimiento?',
    )
  })
})
