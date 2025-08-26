import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = memo(
  ({ content, className = "" }) => {
    return (
      <div className={`markdown-content ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ ...props }) => (
              <h1 className="text-lg font-bold mb-2 text-white" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-base font-bold mb-2 text-white" {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-sm font-bold mb-1 text-white" {...props} />
            ),
            p: ({ ...props }) => (
              <p className="mb-2 text-gray-300 leading-relaxed" {...props} />
            ),
            strong: ({ ...props }) => (
              <strong className="font-bold text-white" {...props} />
            ),
            em: ({ ...props }) => (
              <em className="italic text-gray-200" {...props} />
            ),
            ul: ({ ...props }) => (
              <ul
                className="list-disc list-inside mb-2 pl-2 text-gray-300"
                {...props}
              />
            ),
            ol: ({ ...props }) => (
              <ol
                className="list-decimal list-inside mb-2 pl-2 text-gray-300"
                {...props}
              />
            ),
            li: ({ ...props }) => <li className="mb-1" {...props} />,
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-4 border-gray-500 pl-4 py-2 mb-2 bg-gray-800/50 italic text-gray-300"
                {...props}
              />
            ),
            code: ({
              className,
              children,
              ...props
            }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match;

              if (isInline) {
                return (
                  <code
                    className="bg-gray-700 text-gray-200 px-1 py-0.5 rounded text-xs font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code
                  className={`block bg-gray-900 text-gray-200 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-2 ${
                    className || ""
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ ...props }) => (
              <pre
                className="bg-gray-900 rounded-lg overflow-x-auto mb-2"
                {...props}
              />
            ),
            a: ({ ...props }) => (
              <a
                className="text-blue-400 hover:text-blue-300 underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;
