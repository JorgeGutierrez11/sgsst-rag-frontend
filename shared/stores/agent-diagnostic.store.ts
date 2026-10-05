import { create } from 'zustand'

import type {
  CompleteDiagnosticResponse,
  DiagnosticQuestion,
} from '@/features/diagnostic/diagnostic.types'

type DiagnosticSessionState = {
  workerCount: string
  diagnosisId: string | null
  catalogName: string | null
  currentQuestion: DiagnosticQuestion | null
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
  setWorkerCount: (workerCount: string) => void
  setDiagnosisId: (diagnosisId: string | null) => void
  setCatalogName: (catalogName: string | null) => void
  setCurrentQuestion: (currentQuestion: DiagnosticQuestion | null) => void
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
}

export const useAgentDiagnosticStore = create<DiagnosticSessionState>()(
  (set) => ({
    workerCount: '',
    diagnosisId: null,
    catalogName: null,
    currentQuestion: null,
    textAnswer: '',
    result: null,
    clarificationMessage: null,
    isStarting: false,
    isSubmitting: false,
    errorMessage: null,
    reportBlob: null,
    isDownloadingReport: false,
    reportError: null,
    toastMessage: null,
    setWorkerCount: (workerCount) => set({ workerCount }),
    setDiagnosisId: (diagnosisId) => set({ diagnosisId }),
    setCatalogName: (catalogName) => set({ catalogName }),
    setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
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
  }),
)
