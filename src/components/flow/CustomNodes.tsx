import { Handle, Position, NodeProps } from '@xyflow/react';
import { AgentNodeData, useFlowStore } from '@/store/flowStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightning, Robot, Wrench, Warning } from '@phosphor-icons/react';
import { NodeRegistry } from '@/lib/graph/NodeRegistry';

const NodeWrapper = ({ children, type, nodeId }: { children: React.ReactNode; type: string; nodeId: string }) => {
  const executionContext = useFlowStore(state => state.executionContext);
  const nodeState = executionContext.nodeStates.get(nodeId);

  let borderColor = 'border-border';
  if (type === 'trigger') borderColor = 'border-yellow-400';
  if (type === 'agent') borderColor = 'border-primary';
  if (type === 'tool') borderColor = 'border-blue-400';

  let statusColor = '';
  if (nodeState?.status === 'working') statusColor = 'shadow-[0_0_15px_rgba(var(--primary),0.5)] border-primary animate-pulse';
  if (nodeState?.status === 'error') statusColor = 'shadow-[0_0_15px_rgba(255,0,0,0.5)] border-destructive';
  if (nodeState?.status === 'completed') statusColor = 'border-green-500';

  return (
    <Card className={`min-w-[200px] p-3 border-l-4 ${borderColor} ${statusColor} glass-card shadow-lg hover:shadow-xl transition-all duration-300`}>
      {children}
      {nodeState?.error && (
          <div className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1" title={String(nodeState.error)}>
              <Warning size={12} weight="fill" />
          </div>
      )}
    </Card>
  );
};

export const TriggerNode = ({ id, data }: NodeProps<AppNode>) => {
  return (
    <NodeWrapper type="trigger" nodeId={id}>
      <Handle type="source" position={Position.Right} className="!bg-yellow-400 w-3 h-3" />
      <div className="flex items-center gap-2 mb-2">
        <Lightning size={16} weight="fill" className="text-yellow-400" />
        <span className="font-mono text-xs uppercase font-bold tracking-wider text-yellow-400">TRIGGER</span>
      </div>
      <div className="text-sm font-bold">{data.label}</div>
    </NodeWrapper>
  );
};

export const AgentNode = ({ id, data }: NodeProps<AppNode>) => {
  const definition = NodeRegistry.getDefinition('agent');

  return (
    <NodeWrapper type="agent" nodeId={id}>
      <Handle type="target" position={Position.Left} className="!bg-primary w-3 h-3" />
      <Handle type="source" position={Position.Right} className="!bg-primary w-3 h-3" />
      <div className="flex items-center gap-2 mb-2">
        <Robot size={16} weight="fill" className="text-primary" />
        <span className="font-mono text-xs uppercase font-bold tracking-wider text-primary">AGENT</span>
      </div>
      <div className="text-sm font-bold">{data.label}</div>
      <Badge variant="outline" className="mt-2 text-[10px] font-mono">
          {data.config?.model || 'GPT-4o'}
      </Badge>

      {/* Dynamic Inputs Visualization (Simplified) */}
      {definition?.inputs && (
          <div className="mt-2 pt-2 border-t border-white/10">
              <div className="text-[9px] font-mono text-muted-foreground uppercase">Inputs</div>
              {Object.keys(definition.inputs.shape).map(key => (
                  <div key={key} className="text-[10px] font-mono flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-white/50"></span>
                      {key}
                  </div>
              ))}
          </div>
      )}
    </NodeWrapper>
  );
};

export const ToolNode = ({ id, data }: NodeProps<AppNode>) => {
  return (
    <NodeWrapper type="tool" nodeId={id}>
      <Handle type="target" position={Position.Left} className="!bg-blue-400 w-3 h-3" />
      <div className="flex items-center gap-2 mb-2">
        <Wrench size={16} weight="fill" className="text-blue-400" />
        <span className="font-mono text-xs uppercase font-bold tracking-wider text-blue-400">TOOL</span>
      </div>
      <div className="text-sm font-bold">{data.label}</div>
    </NodeWrapper>
  );
};

export const nodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  tool: ToolNode,
};
