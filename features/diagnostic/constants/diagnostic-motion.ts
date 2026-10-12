export const QUESTION_MOTION_CSS = `
@keyframes diagnostic-question-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
@keyframes diagnostic-question-flash {
  from { box-shadow: 0 0 0 0 hsl(var(--glow-primary) / 0.45); }
  to { box-shadow: 0 0 0 10px hsl(var(--glow-primary) / 0); }
}
.diagnostic-question-card {
  animation:
    diagnostic-question-in 260ms ease-out both,
    diagnostic-question-flash 700ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .diagnostic-question-card { animation: none; }
}
`

export const GUIDE_CTA_CSS = `
@keyframes guide-cta-sheen {
  0% { transform: translateX(-140%) skewX(-20deg); }
  45%, 100% { transform: translateX(420%) skewX(-20deg); }
}
.guide-cta__sheen { animation: guide-cta-sheen 4s ease-in-out infinite; }
.guide-cta:hover .guide-cta__sheen,
.guide-cta:focus-visible .guide-cta__sheen { animation-duration: 1.6s; }
@media (prefers-reduced-motion: reduce) {
  .guide-cta__sheen { animation: none; opacity: 0; }
}
`
