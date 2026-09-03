import { Sparkles } from 'lucide-react'

type BrandMarkProps = {
  small?: boolean
}

export function BrandMark({ small = false }: BrandMarkProps) {
  return (
    <div
      className={small ? 'grid size-5.25 rotate-[-10deg] place-items-center text-brand-primary' : 'grid size-22 rotate-[-10deg] place-items-center text-brand-primary max-md:size-19'}
      aria-hidden="true"
    >
      <Sparkles size={small ? 16 : 50} strokeWidth={2.5} />
    </div>
  )
}
