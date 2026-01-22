import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ModelSelector } from '@/components/ModelSelector'
import { Label } from '@/components/ui/label'
import { pollinations } from '@/lib/pollinations'
import { useFlowStore } from '@/store/flowStore'
import { Brain, CircleNotch, Sparkle } from '@phosphor-icons/react'
import type { Node, Edge } from '@xyflow/react'

/**
 * AI Architect Panel
 *
 * Auto-generates workflow graphs from natural language prompts.
 * Uses AI to translate user intent into node configurations and connections.
 */
export function ArchitectPanel() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('openai')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setNodes, setEdges } = useFlowStore()

  const generateWorkflow = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const systemPrompt = `You are an AI workflow architect. Given a user's description, generate a valid JSON workflow definition.

Rules:
1. Return ONLY valid JSON, no markdown, no explanations
2. Structure: { "nodes": [...], "edges": [...] }
3. Node format: { "id": "unique_id", "type": "agent|tool|trigger", "position": { "x": number, "y": number }, "data": { "label": "string", "config": {} } }
4. Edge format: { "id": "e1", "source": "node_id", "target": "node_id" }
5. Space nodes horizontally (x: 0, 250, 500, etc.) and vertically (y: 0, 150, 300)
6. Available node types: "agent" (for LLM tasks), "tool" (for actions), "trigger" (for starting points)
7. Always start with at least one "trigger" node
8. Use descriptive labels

Example:
{
  "nodes": [
    { "id": "1", "type": "trigger", "position": { "x": 0, "y": 0 }, "data": { "label": "User Input" } },
    { "id": "2", "type": "agent", "position": { "x": 250, "y": 0 }, "data": { "label": "Analyze Request" } }
  ],
  "edges": [
    { "id": "e1", "source": "1", "target": "2" }
  ]
}`

      const response = await pollinations.chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a workflow for: ${prompt}` },
        ],
        {
          model,
          temperature: 0.3, // Lower temperature for more consistent JSON
        }
      )

      // Parse JSON response
      let workflowData: { nodes: Node[]; edges: Edge[] }

      try {
        // Try direct parse
        workflowData = JSON.parse(response)
      } catch {
        // Try extracting JSON from markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch) {
          workflowData = JSON.parse(jsonMatch[1])
        } else {
          throw new Error('Could not parse JSON from AI response')
        }
      }

      // Validate structure
      if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
        throw new Error('Invalid workflow structure: missing nodes array')
      }

      if (!workflowData.edges || !Array.isArray(workflowData.edges)) {
        throw new Error('Invalid workflow structure: missing edges array')
      }

      // Apply generated workflow
      setNodes(workflowData.nodes)
      setEdges(workflowData.edges)

      // Clear prompt on success
      setPrompt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workflow')
      console.error('Architect error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      generateWorkflow()
    }
  }

  return (
    <div className="border-border/50 space-y-3 border-b bg-black/30 p-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-purple-400/50 font-mono text-xs text-purple-400">
          <Brain size={12} weight="fill" className="mr-1" />
          AI_ARCHITECT
        </Badge>
        <span className="text-muted-foreground flex-1 font-mono text-[10px]">
          <span className="text-primary">{'>'}</span> PROMPT_TO_WORKFLOW
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <Label htmlFor="architect-prompt" className="font-mono text-xs uppercase">
            Describe Your Workflow
          </Label>
          <Textarea
            id="architect-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Create a workflow that analyzes user input, classifies intent, and generates a response..."
            className="min-h-[100px] resize-none font-mono text-xs"
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="font-mono text-xs uppercase">Model</Label>
            <ModelSelector type="text" value={model} onChange={setModel} />
          </div>

          <div className="flex items-end">
            <Button
              onClick={generateWorkflow}
              disabled={!prompt.trim() || isGenerating}
              className="gradient-button w-full font-mono text-xs font-bold uppercase"
            >
              {isGenerating ? (
                <>
                  <CircleNotch size={16} className="mr-2 animate-spin" />
                  BUILDING...
                </>
              ) : (
                <>
                  <Sparkle size={16} weight="fill" className="mr-2" />
                  BUILD
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground font-mono text-[10px]">
          <span className="text-primary">CMD/CTRL+ENTER</span> to generate
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Badge variant="destructive" className="font-mono text-xs">
                ERROR: {error}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
