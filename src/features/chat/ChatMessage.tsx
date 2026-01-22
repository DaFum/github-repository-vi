import { motion } from 'framer-motion'
import { User, Robot } from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import type { Message } from './HoloChat'

type ChatMessageProps = {
  message: Message
  index: number
}

/**
 * Chat Message Component
 *
 * Renders individual chat messages with:
 * - Markdown support
 * - Role-based styling
 * - Avatar icons
 * - Timestamp
 */
export function ChatMessage({ message, index }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-2 ${
          isUser
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-accent/50 bg-accent/10 text-accent'
        }`}
      >
        {isUser ? <User size={16} weight="bold" /> : <Robot size={16} weight="bold" />}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[80%] space-y-2 rounded-lg border-2 p-3 backdrop-blur ${
          isUser ? 'border-primary/30 bg-primary/5' : 'border-accent/30 bg-accent/5'
        }`}
      >
        {/* Role Label */}
        <div className="text-muted-foreground flex items-center gap-2 font-mono text-[10px] uppercase">
          <span className={isUser ? 'text-primary' : 'text-accent'}>
            {isUser ? 'USER' : 'ASSISTANT'}
          </span>
          <span>•</span>
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              // Custom styling for markdown elements
              p: ({ children }) => <p className="mb-2 text-sm leading-relaxed">{children}</p>,
              code: ({ children, className }) => {
                const isInline = !className
                return isInline ? (
                  <code className="bg-primary/20 text-primary rounded px-1 py-0.5 font-mono text-xs">
                    {children}
                  </code>
                ) : (
                  <code className="block rounded-lg bg-black/50 p-3 font-mono text-xs">
                    {children}
                  </code>
                )
              },
              strong: ({ children }) => (
                <strong className="text-primary font-bold">{children}</strong>
              ),
              em: ({ children }) => <em className="text-accent italic">{children}</em>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="ml-4 list-disc space-y-1 text-sm">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="ml-4 list-decimal space-y-1 text-sm">{children}</ol>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Visualizations */}
        {message.visualizations && message.visualizations.length > 0 && (
          <div className="border-accent/30 mt-3 rounded border-2 bg-black/30 p-2">
            <div className="text-accent font-mono text-[10px] uppercase">
              {message.visualizations.length} visualization(s) generated
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
