import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Render model text safely; raw HTML is never enabled. */
export function AssistantAnswer({ content }: { content: string }) {
  return (
    <div className="min-w-0 space-y-3 break-words text-sm leading-7" dir="auto">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h3 className="border-b border-border pb-2 text-base font-bold text-primary">{children}</h3>,
          h2: ({ children }) => <h3 className="border-b border-border pb-2 text-base font-bold text-primary">{children}</h3>,
          h3: ({ children }) => <h4 className="font-bold text-primary">{children}</h4>,
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc space-y-1 ps-5 marker:text-primary">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 ps-5 marker:font-bold marker:text-primary">{children}</ol>,
          blockquote: ({ children }) => <blockquote className="border-s-4 border-primary bg-accent px-3 py-2 text-accent-foreground">{children}</blockquote>,
          table: ({ children }) => (
            <div className="max-w-full overflow-x-auto rounded-md border border-border" role="region" aria-label="جدول المواصفات" tabIndex={0}>
              <table className="w-full min-w-[360px] border-collapse text-start text-xs leading-6">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-primary text-primary-foreground">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
          tr: ({ children }) => <tr className="even:bg-muted/70">{children}</tr>,
          th: ({ children }) => <th className="min-w-24 border-e border-border/30 px-3 py-2 text-start align-top font-bold last:border-e-0">{children}</th>,
          td: ({ children }) => <td className="border-e border-border px-3 py-2 text-start align-top last:border-e-0">{children}</td>,
          hr: () => <hr className="border-border" />,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{children}</a>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}