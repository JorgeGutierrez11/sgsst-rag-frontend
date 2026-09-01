import { Sparkles } from 'lucide-react'

type BrandMarkProps = {
  small?: boolean
}

export function BrandMark({ small = false }: BrandMarkProps) {
  return (
    <div className={`brand-mark ${small ? 'brand-mark-small' : ''}`} aria-hidden="true">
      <Sparkles size={small ? 16 : 50} strokeWidth={2.5} />
    </div>
  )
}
