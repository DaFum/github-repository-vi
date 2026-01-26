import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { BackgroundCanvas } from './BackgroundCanvas'
import { ModelSelector } from '@/components/ModelSelector'
import { pollinations } from '@/lib/pollinations'
import { parseVisualizationCommands } from './VisualizationEngine'
import { useVaultStore } from '@/lib/store/useVaultStore'
import { PaperPlaneRight, Sparkle, CircleNotch, FloppyDisk, TerminalWindow } from '@phosphor-icons/react'
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

export function HoloChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useKV('holo:model', 'openai')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentVisualization, setCurrentVisualization] = useState<VisualizationCommand | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addArtifact } = useVaultStore()

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
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
        { model, temperature: 0.8 }
      )

      const visualizations = parseVisualizationCommands(response)
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
    <Card className="relative h-full flex flex-col overflow-hidden border-primary/20 bg-black/60">
      <BackgroundCanvas visualization={currentVisualization} />

      {/* Glass Overlay for Chat */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

      <CardHeader className="relative z-10 flex-row items-center justify-between py-3 border-b border-primary/20 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <Badge variant="neon" className="gap-2 px-3 py-1">
            <TerminalWindow size={14} weight="fill" />
            HOLO_TERMINAL
          </Badge>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-share-tech tracking-widest uppercase">
              STATUS: <span className="text-primary animate-pulse">ACTIVE</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={saveConversation}
            disabled={messages.length === 0}
            variant="holographic"
            size="sm"
          >
            <FloppyDisk size={16} className="mr-2" />
            SAVE_LOG
          </Button>
          <div className="w-48">
            <ModelSelector type="text" value={model} onChange={setModel} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          <div className="space-y-6 max-w-3xl">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 text-center"
                >
                  <Sparkle size={48} className="text-primary/20 mx-auto mb-6 animate-pulse" />
                  <h3 className="mb-2 text-xl font-orbitron font-bold text-primary/80">SYSTEM_READY</h3>
                  <p className="text-muted-foreground font-share-tech text-sm tracking-wide">
                    INITIALIZE CONVERSATION PROTOCOL...
                  </p>
                </motion.div>
              )}
              {messages.map((message, index) => (
                <ChatMessage key={message.id} message={message} index={index} />
              ))}
            </AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-primary/70 font-share-tech text-xs pl-2"
              >
                <CircleNotch size={14} className="animate-spin" />
                <span>PROCESSING_NEURAL_RESPONSE...</span>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="relative z-10 p-0 bg-black/80 border-t border-primary/20 backdrop-blur-xl">
        <div className="w-full flex">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ENTER COMMAND..."
            className="flex-1 min-h-[60px] bg-transparent border-0 rounded-none focus-visible:ring-0 font-share-tech text-primary placeholder:text-primary/30 resize-none py-4 px-6"
            disabled={isGenerating}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isGenerating}
            variant="default"
            className="h-auto rounded-none w-24 border-l border-primary/20"
          >
            {isGenerating ? <CircleNotch size={20} className="animate-spin" /> : <PaperPlaneRight size={20} weight="fill" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
