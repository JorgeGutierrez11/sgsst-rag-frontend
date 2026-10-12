# Diagnostic Componentization

## Objective
Refactor `features/diagnostic/diagnostic-view.tsx` so the central view composes focused presentation components and no longer owns large stage markup directly.

## Problem
`DiagnosticView` currently mixes stage selection, guide content, company form, active-question UI, toast feedback, result UI, refs, animation CSS, and layout sizing in one large component. That makes the diagnostic feature harder to maintain and risky to change.

## Scope
- Keep existing behavior, Spanish copy, visual styling, and in-memory state flow.
- Extract presentation components under `features/diagnostic/components/`.
- Extract diagnostic view constants/animation CSS when useful.
- Keep orchestration in `useDiagnosticSession`.
- Do not change API calls, stores, routes, package files, global styles, or backend behavior.

## Tasks
- [x] T1 — Extract guide stage presentation from `DiagnosticView`.
- [x] T2 — Extract company start form presentation from `DiagnosticView`.
- [x] T3 — Extract active question stage presentation from `DiagnosticView`.
- [x] T4 — Extract result stage and feedback presentation from `DiagnosticView`.
- [x] T5 — Keep `DiagnosticView` as the central presenter/composer and verify TypeScript.

## Authorized Scope
- `features/diagnostic/diagnostic-view.tsx`
- `features/diagnostic/components/**`
- `features/diagnostic/constants/**`
- `features/diagnostic/hooks/**` only if needed for presentation-facing types

## Acceptance Criteria
- `DiagnosticView` primarily selects the current stage and passes data/handlers down.
- Extracted components have clear names and focused props.
- No behavior change: guide, start form, active question, Phase 3 consultation handoff, answer submission, toast, restart, report download remain intact.
- `git diff --check` passes.
- `pnpm exec tsc --noEmit` passes when available.

## Progress
- Extracted the guide, start form, active question, result, and toast presentations into focused components.
- Moved guide content and motion CSS constants out of `diagnostic-view.tsx`.
- Reduced `DiagnosticView` to stage selection, layout sizing, focus/scroll coordination, and explicit data/handler wiring.
- Preserved the existing `useDiagnosticSession` implementation and all API/store behavior.

## Verification Evidence
- `git diff --check` — passed with no output.
- `pnpm exec tsc --noEmit` — passed with no output.
- Static wiring review — confirmed the active-question consultation action still delegates to `handleRequestConsultationHelp`; answer, restart, toast, focus, progress, and report handlers remain connected.
- No broad build was run, as required.

## Next Step
Perform manual browser smoke testing when a runnable backend is available.
