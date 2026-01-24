import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { BackgroundCanvas } from './BackgroundCanvas'
import { ModelSelector } from '@/components/ModelSelector'
import { pollinations } from '@/lib/pollinations'
import { parseVisualizationCommands } from './VisualizationEngine'
import { useVaultStore } from '@/lib/store/useVaultStore'
import { PaperPlaneRight, Sparkle, CircleNotch, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  visualizations?: VisualizationCommand[]
}

export type VisualizationCommand = {
  type: 'image' | 'plot' | 'code' | 'diagram'
  data: unknown
}

/**
 * Holo-Chat Module
 *
 * Chat interface where AI controls background visualization.
 * Features:
 * - Markdown rendering in messages
 * - AI-generated visualizations
 * - System prompt injection for JSON responses
 * - Background canvas controlled by AI
 */
export function HoloChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState('openai')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentVisualization, setCurrentVisualization] = useState<VisualizationCommand | null>(
    null
  )
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addArtifact } = useVaultStore()

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsGenerating(true)

    try {
      // System prompt to encourage visual responses
      const systemPrompt = `You are a visual AI assistant. When appropriate, generate visualizations using these commands:
- For images: Include [IMAGE: detailed prompt] in your response
- For plots: Include [PLOT: data description] in your response
- For diagrams: Include [DIAGRAM: structure description] in your response

Be conversational and helpful. Use markdown for formatting.`

      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await pollinations.chat(
        [
          { role: 'system', content: systemPrompt },
          ...chatHistory,
          { role: 'user', content: input.trim() },
        ],
        {
          model,
          temperature: 0.8,
        }
      )

      // Parse visualization commands
      const visualizations = parseVisualizationCommands(response)

      // Update current visualization if any
      if (visualizations.length > 0) {
        setCurrentVisualization(visualizations[0])
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        visualizations,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Failed to generate response: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const saveConversation = () => {
    if (messages.length === 0) {
      toast.error('No conversation to save')
      return
    }

    const firstUserMessage = messages.find((m) => m.role === 'user')
    const title = firstUserMessage ? firstUserMessage.content.slice(0, 50) : 'Chat Conversation'

    addArtifact({
      type: 'chat',
      title,
      description: `${messages.length} messages with ${model}`,
      model,
      tags: ['holo-chat', 'conversation'],
      data: {
        messages,
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]?.timestamp,
      },
    })

    toast.success('Conversation saved to Vault!')
  }

  return (
    <div className="module-holochat border-primary/30 glass-card corner-accent glow-border relative h-[calc(100vh-280px)] min-h-[600px] overflow-hidden rounded-lg border-2">
      {/* Background Visualization */}
      <BackgroundCanvas visualization={currentVisualization} />

      {/* Chat Interface Overlay */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <div className="border-border/50 flex items-center justify-between border-b bg-black/70 px-4 py-2 backdrop-blur">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="badge-holochat font-mono text-xs">
              <Sparkle size={12} weight="fill" className="mr-1" />
              HOLO-CHAT
            </Badge>
            <span className="text-muted-foreground font-mono text-xs">
              <span className="text-primary">{'>'}</span> VISUAL_AI_ASSISTANT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={saveConversation}
              disabled={messages.length === 0}
              size="sm"
              variant="ghost"
              className="font-mono text-xs uppercase"
            >
              <FloppyDisk size={16} className="mr-1" />
              SAVE
            </Button>
            <div className="w-48">
              <ModelSelector type="text" value={model} onChange={setModel} />
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="py-12 text-center"
                >
                  <Sparkle size={64} className="text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="mb-2 text-lg font-black uppercase">START_CONVERSATION</h3>
                  <p className="text-muted-foreground font-mono text-xs">
                    <span className="text-primary">{'>'}</span> Ask me anything. I can generate
                    visualizations!
                  </p>
                </motion.div>
              )}

              {messages.map((message, index) => (
                <ChatMessage key={message.id} message={message} index={index} />
              ))}
            </AnimatePresence>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-muted-foreground flex items-center gap-2 font-mono text-xs"
              >
                <CircleNotch size={16} className="animate-spin" />
                <span>AI_THINKING...</span>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-border/50 border-t bg-black/70 p-4 backdrop-blur">
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="min-h-[80px] resize-none font-mono text-sm"
                  disabled={isGenerating}
                />
              </div>

              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isGenerating}
                className="gradient-button h-[80px] px-6 font-mono text-xs font-bold uppercase"
                aria-label={isGenerating ? 'Senden, wird gesendet' : 'Senden'}
              >
                {isGenerating ? (
                  <>
                    <CircleNotch size={20} className="animate-spin" />
                  </>
                ) : (
                  <>
                    <PaperPlaneRight size={20} weight="fill" />
                  </>
                )}
              </Button>
            </div>

            <div className="text-muted-foreground flex items-center justify-between font-mono text-[10px]">
              <span>
                <span className="text-primary">ENTER</span> to send •{' '}
                <span className="text-primary">SHIFT+ENTER</span> for new line
              </span>
              <span>{messages.length} messages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
