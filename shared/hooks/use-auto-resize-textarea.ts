import { useLayoutEffect, useRef } from 'react'

type AutoResizeOptions = {
  // Upper bound in pixels.
  maxHeight: number
  // Upper bound as a fraction of the viewport height; the smaller bound wins.
  maxViewportRatio: number
}

// Grows the textarea with its content up to the limit, then scrolls internally.
export function useAutoResizeTextarea(value: string, { maxHeight, maxViewportRatio }: AutoResizeOptions) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset the height to measure the real content.
    textarea.style.height = 'auto'

    const limit = Math.min(maxHeight, window.innerHeight * maxViewportRatio)
    const newHeight = Math.min(textarea.scrollHeight, limit)

    textarea.style.height = `${newHeight}px`
    textarea.style.overflowY = textarea.scrollHeight > limit ? 'auto' : 'hidden'
  }, [value, maxHeight, maxViewportRatio])

  return textareaRef
}
