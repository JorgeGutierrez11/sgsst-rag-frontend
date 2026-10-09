export type DiagnosticStep = 1 | 2 | 3 | 4

export type DiagnosticAnswer = boolean | string

export type DiagnosticProgress = {
  completed_requirements: number
  total_requirements: number
  current_requirement_number: number | null
  current_requirement_id: string | null
  completed: boolean
}

export type DiagnosticQuestion = {
  requirement_id: string
  requirement_name: string
  question_id: string
  text: string
  role: string
  question_type: string
  requirement_number: number
  total_requirements: number
}

export type CreateDiagnosticRequest = {
  company_name: string
  worker_count: number
}

export type CreateDiagnosticResponse = {
  diagnosis_id: string
  catalog_id: string
  catalog_name: string
  progress: DiagnosticProgress
  next_question: DiagnosticQuestion | null
}

export type SubmitDiagnosticAnswerRequest = {
  requirement_id: string
  question_id: string
  answer: DiagnosticAnswer
}

export type SubmitDiagnosticAnswerResponse = {
  diagnosis_id: string
  progress: DiagnosticProgress
  next_question: DiagnosticQuestion | null
  interpretation_status: string
  clarification_message: string | null
}

export type RequirementAssessment = {
  requirement_id: string
  requirement_name: string
  applicability_status: string
  assessment_status: string
  explanation: string
  missing_information: string[]
}

export type DiagnosticSummary = {
  total_requirements: number
  complies_as_declared: number
  does_not_comply_as_declared: number
  insufficient_information: number
  not_applicable: number
}

export type CompleteDiagnosticResponse = {
  diagnosis_id: string
  assessments: RequirementAssessment[]
  summary: DiagnosticSummary
  scope_note: string
}