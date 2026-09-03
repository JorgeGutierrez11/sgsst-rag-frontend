import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownMessageProps = {
  content: string
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="min-w-0 text-pretty wrap-anywhere">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mb-2 mt-3 text-lg font-bold leading-tight text-txt-bold text-balance first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 mt-3 text-base font-bold leading-tight text-txt-bold text-balance first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-3 text-[1rem] font-bold leading-tight text-txt-bold text-balance first:mt-0">{children}</h3>,
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-extrabold text-txt-bold">{children}</strong>,
          ul: ({ children }) => <ul className="mb-3 list-disc pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 list-decimal pl-5 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="mt-1.5 first:mt-0">{children}</li>,
          blockquote: ({ children }) => <blockquote className="mb-3 rounded-r-control border-l-3 border-brand-primary/45 bg-brand-light/45 py-2 pl-3 pr-3 text-txt-medium last:mb-0">{children}</blockquote>,
          table: ({ children }) => <div className="mb-3 max-w-full overflow-x-auto rounded-control border border-borde-light bg-capa-surface shadow-sm last:mb-0"><table className="w-full min-w-max border-collapse">{children}</table></div>,
          th: ({ children }) => <th className="min-w-30 border-b border-borde-light bg-capa-main px-3 py-2.5 text-left align-top font-bold text-txt-bold">{children}</th>,
          td: ({ children }) => <td className="min-w-30 border-b border-borde-light bg-capa-surface px-3 py-2.5 text-left align-top text-txt-medium">{children}</td>,
        }}
      >
        {content}
      </Markdown>
    </div>
  )
}
