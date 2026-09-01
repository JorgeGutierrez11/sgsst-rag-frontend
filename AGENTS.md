# OpenCode Notes

## Project shape
- Single Next.js app at the repository root; there are no workspace packages despite `pnpm-workspace.yaml` existing.
- App Router entrypoints: `app/layout.tsx` wraps the app and `app/page.tsx` renders `components/layout/app-shell.tsx`.
- `components/layout/app-shell.tsx` is the client shell for the Spanish ChattyAI UI; update visible copy in Spanish unless the product requirement says otherwise.
- Shared UI primitives live under `components/ui`; aliases come from `components.json` and `tsconfig.json` (`@/*`, `@/components`, `@/lib`, `@/components/ui`).

## Toolchain and commands
- Package manager intent is pnpm (`pnpm-lock.yaml` lockfile). In this environment, `pnpm` was not installed when checked.
- Available scripts in `package.json`:
  - `pnpm dev` — run Next.js dev server.
  - `pnpm build` — run `next build`.
  - `pnpm start` — run production server after a build.
- No `lint`, `test`, `typecheck`, or formatter scripts are defined. Prefer adding scripts before relying on ad-hoc commands in automation.

## Build/type gotchas
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`; `pnpm build` can succeed even with TypeScript errors.
- For meaningful type verification, use an explicit TypeScript check such as `pnpm exec tsc --noEmit` after pnpm is available.
- Images are configured with `images.unoptimized: true`; do not assume Next image optimization is active.

## Styling/UI conventions
- Tailwind CSS v4 is wired through `postcss.config.mjs` with `@tailwindcss/postcss`.
- Global styles and theme tokens are centralized in `app/globals.css`, including `@import 'tailwindcss'`, `tw-animate-css`, and `shadcn/tailwind.css`.
- shadcn config uses `style: "base-nova"`, React Server Components enabled, and Lucide icons.
- `components/ui/button.tsx`, `lib/utils.ts`, and their supporting dependencies are kept as shadcn/base-nova primitives even if the current app does not import them yet.
