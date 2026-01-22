import { Handle, Position, NodeProps } from '@xyflow/react'
import { useFlowStore } from '@/store/flowStore'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightning, Robot, Wrench, Warning } from '@phosphor-icons/react'
import { NodeRegistry } from '@/lib/graph/NodeRegistry'

const NodeWrapper = ({
  children,
  type,
  nodeId,
}: {
  children: React.ReactNode
  type: string
  nodeId: string
}) => {
  const executionContext = useFlowStore((state) => state.executionContext)
  const nodeState = executionContext.nodeStates.get(nodeId)

  let borderColor = 'border-border'
  if (type === 'trigger') borderColor = 'border-yellow-400'
  if (type === 'agent') borderColor = 'border-primary'
  if (type === 'tool') borderColor = 'border-blue-400'

  let statusColor = ''
  if (nodeState?.status === 'working')
    statusColor = 'shadow-[0_0_15px_rgba(var(--primary),0.5)] border-primary animate-pulse'
  if (nodeState?.status === 'error')
    statusColor = 'shadow-[0_0_15px_rgba(255,0,0,0.5)] border-destructive'
  if (nodeState?.status === 'completed') statusColor = 'border-green-500'

  return (
    <Card
      className={`min-w-[200px] border-l-4 p-3 ${borderColor} ${statusColor} glass-card shadow-lg transition-all duration-300 hover:shadow-xl`}
    >
      {children}
      {nodeState?.error && (
        <div
          className="bg-destructive absolute -top-2 -right-2 rounded-full p-1 text-white"
          title={String(nodeState.error)}
        >
          <Warning size={12} weight="fill" />
        </div>
      )}
    </Card>
  )
}

export const TriggerNode = ({ id, data }: NodeProps<AppNode>) => {
  return (
    <NodeWrapper type="trigger" nodeId={id}>
      <Handle type="source" position={Position.Right} className="h-3 w-3 !bg-yellow-400" />
      <div className="mb-2 flex items-center gap-2">
        <Lightning size={16} weight="fill" className="text-yellow-400" />
        <span className="font-mono text-xs font-bold tracking-wider text-yellow-400 uppercase">
          TRIGGER
        </span>
      </div>
      <div className="text-sm font-bold">{data.label}</div>
    </NodeWrapper>
  )
}

export const AgentNode = ({ id, data }: NodeProps<AppNode>) => {
  const definition = NodeRegistry.getDefinition('agent')

  return (
    <NodeWrapper type="agent" nodeId={id}>
      <Handle type="target" position={Position.Left} className="!bg-primary h-3 w-3" />
      <Handle type="source" position={Position.Right} className="!bg-primary h-3 w-3" />
      <div className="mb-2 flex items-center gap-2">
        <Robot size={16} weight="fill" className="text-primary" />
        <span className="text-primary font-mono text-xs font-bold tracking-wider uppercase">
          AGENT
        </span>
      </div>
      <div className="text-sm font-bold">{data.label}</div>
      <Badge variant="outline" className="mt-2 font-mono text-[10px]">
        {data.config?.model || 'GPT-4o'}
      </Badge>

      {/* Dynamic Inputs Visualization (Simplified) */}
      {definition?.inputs && (
        <div className="mt-2 border-t border-white/10 pt-2">
          <div className="text-muted-foreground font-mono text-[9px] uppercase">Inputs</div>
          {Object.keys(definition.inputs.shape).map((key) => (
            <div key={key} className="flex items-center gap-1 font-mono text-[10px]">
              <span className="h-1 w-1 rounded-full bg-white/50"></span>
              {key}
            </div>
          ))}
        </div>
      )}
    </NodeWrapper>
  )
}

export const ToolNode = ({ id, data }: NodeProps<AppNode>) => {
  return (
    <NodeWrapper type="tool" nodeId={id}>
      <Handle type="target" position={Position.Left} className="h-3 w-3 !bg-blue-400" />
      <div className="mb-2 flex items-center gap-2">
        <Wrench size={16} weight="fill" className="text-blue-400" />
        <span className="font-mono text-xs font-bold tracking-wider text-blue-400 uppercase">
          TOOL
        </span>
      </div>
      <div className="text-sm font-bold">{data.label}</div>
    </NodeWrapper>
  )
}

export const nodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  tool: ToolNode,
}
