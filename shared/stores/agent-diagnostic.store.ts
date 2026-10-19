import { create } from 'zustand'

import type {
  CompleteDiagnosticResponse,
  DiagnosticQuestion,
  DiagnosticProgress,
  DiagnosticRequirementProgress,
  DiagnosticState,
} from '@/features/diagnostic/diagnostic.types'

type DiagnosticSessionState = {
  hasAcceptedGuide: boolean
  companyName: string
  workerCount: string
  diagnosisId: string | null
  catalogName: string | null
  currentQuestion: DiagnosticQuestion | null
  progress: DiagnosticProgress | null
  requirements: DiagnosticRequirementProgress[]
  revision: number
  isRestartingRequirement: boolean
  isReportGenerated: boolean
  textAnswer: string
  result: CompleteDiagnosticResponse | null
  clarificationMessage: string | null
  isStarting: boolean
  isSubmitting: boolean
  errorMessage: string | null
  reportBlob: Blob | null
  isDownloadingReport: boolean
  reportError: string | null
  toastMessage: string | null
  acceptGuide: () => void
  returnToGuide: () => void
  setCompanyName: (companyName: string) => void
  setWorkerCount: (workerCount: string) => void
  setDiagnosisId: (diagnosisId: string | null) => void
  setCatalogName: (catalogName: string | null) => void
  setCurrentQuestion: (currentQuestion: DiagnosticQuestion | null) => void
  applyDiagnosticState: (state: DiagnosticState) => void
  setIsRestartingRequirement: (value: boolean) => void
  setIsReportGenerated: (value: boolean) => void
  setTextAnswer: (textAnswer: string) => void
  setResult: (result: CompleteDiagnosticResponse | null) => void
  setClarificationMessage: (clarificationMessage: string | null) => void
  setIsStarting: (isStarting: boolean) => void
  setIsSubmitting: (isSubmitting: boolean) => void
  setErrorMessage: (errorMessage: string | null) => void
  setReportBlob: (reportBlob: Blob | null) => void
  setIsDownloadingReport: (isDownloadingReport: boolean) => void
  setReportError: (reportError: string | null) => void
  setToastMessage: (toastMessage: string | null) => void
  resetSession: () => void
}

const createInitialState = () => ({
  hasAcceptedGuide: false,
  companyName: '',
  workerCount: '',
  diagnosisId: null as string | null,
  catalogName: null as string | null,
  currentQuestion: null as DiagnosticQuestion | null,
  progress: null as DiagnosticProgress | null,
  requirements: [] as DiagnosticRequirementProgress[],
  revision: 0,
  isRestartingRequirement: false,
  isReportGenerated: false,
  textAnswer: '',
  result: null as CompleteDiagnosticResponse | null,
  clarificationMessage: null as string | null,
  isStarting: false,
  isSubmitting: false,
  errorMessage: null as string | null,
  reportBlob: null as Blob | null,
  isDownloadingReport: false,
  reportError: null as string | null,
  toastMessage: null as string | null,
})

export const useAgentDiagnosticStore = create<DiagnosticSessionState>()(
  (set) => ({
    ...createInitialState(),
    acceptGuide: () => set({ hasAcceptedGuide: true }),
    returnToGuide: () => set({ hasAcceptedGuide: false, errorMessage: null,}),
    setCompanyName: (companyName) => set({ companyName }),
    setWorkerCount: (workerCount) => set({ workerCount }),
    setDiagnosisId: (diagnosisId) => set({ diagnosisId }),
    setCatalogName: (catalogName) => set({ catalogName }),
    setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
    applyDiagnosticState: (state) =>
      set({
        diagnosisId: state.diagnosis_id,
        currentQuestion: state.next_question,
        progress: state.progress,
        requirements: state.requirements,
        revision: state.revision,
      }),
    setIsRestartingRequirement: (isRestartingRequirement) =>
      set({ isRestartingRequirement }),
    setIsReportGenerated: (isReportGenerated) =>
      set({ isReportGenerated }),
    setTextAnswer: (textAnswer) => set({ textAnswer }),
    setResult: (result) => set({ result }),
    setClarificationMessage: (clarificationMessage) =>
      set({ clarificationMessage }),
    setIsStarting: (isStarting) => set({ isStarting }),
    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
    setErrorMessage: (errorMessage) => set({ errorMessage }),
    setReportBlob: (reportBlob) => set({ reportBlob }),
    setIsDownloadingReport: (isDownloadingReport) =>
      set({ isDownloadingReport }),
    setReportError: (reportError) => set({ reportError }),
    setToastMessage: (toastMessage) => set({ toastMessage }),
    resetSession: () => set(createInitialState()),
  }),
)
