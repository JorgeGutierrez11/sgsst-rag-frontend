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

export type DiagnosticRequirementProgress = {
  requirement_id: string
  requirement_name: string
  requirement_number: number
  status: 'pending' | 'in_progress' | 'completed'
}

export type DiagnosticState = {
  diagnosis_id: string
  revision: number
  progress: DiagnosticProgress
  next_question: DiagnosticQuestion | null
  requirements: DiagnosticRequirementProgress[]
}

export type CreateDiagnosticRequest = {
  company_name: string
  worker_count: number
}

export type CreateDiagnosticResponse = DiagnosticState & {
  catalog_id: string
  catalog_name: string
}

export type SubmitDiagnosticAnswerRequest = {
  requirement_id: string
  question_id: string
  answer: DiagnosticAnswer
  revision: number
}

export type SubmitDiagnosticAnswerResponse = DiagnosticState & {
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