type ConsultationHelpQuestionInput = {
  requirementName: string
  catalogName: string | null
  workerCount: string
}

// Short question on purpose: the RAG uses the raw text for retrieval and reranking, so extra instructions add noise
export function buildConsultationHelpQuestion({
  requirementName,
  catalogName,
  workerCount,
}: ConsultationHelpQuestionInput): string {
  const scope = catalogName ? `Según los ${catalogName}, ¿qué` : '¿Qué'
  const suffix = catalogName ? '' : ' del SG-SST'
  const question = `${scope} exige el requisito «${requirementName}»${suffix} y cómo se verifica su cumplimiento?`

  const trimmedWorkerCount = workerCount.trim()

  return trimmedWorkerCount
    ? `Mi empresa tiene ${trimmedWorkerCount} trabajadores. ${question}`
    : question
}
