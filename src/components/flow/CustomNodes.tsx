import { Handle, Position, NodeProps } from '@xyflow/react';
import { AgentNodeData } from '@/store/flowStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightning, Robot, Wrench } from '@phosphor-icons/react';

const NodeWrapper = ({ children, type }: { children: React.ReactNode; type: string }) => {
  const borderColor =
    type === 'trigger' ? 'border-yellow-400' :
    type === 'agent' ? 'border-primary' :
    'border-blue-400';

  return (
    <Card className={`min-w-[200px] p-3 border-l-4 ${borderColor} glass-card shadow-lg hover:shadow-xl transition-shadow`}>
      {children}
    </Card>
  );
};

export const TriggerNode = ({ data }: NodeProps<any>) => {
  return (
    <NodeWrapper type="trigger">
      <Handle type="source" position={Position.Right} className="!bg-yellow-400 w-3 h-3" />
      <div className="flex items-center gap-2 mb-2">
        <Lightning size={16} weight="fill" className="text-yellow-400" />
        <span className="font-mono text-xs uppercase font-bold tracking-wider text-yellow-400">TRIGGER</span>
      </div>
      <div className="text-sm font-bold">{data.label}</div>
    </NodeWrapper>
  );
};

export const AgentNode = ({ data }: NodeProps<any>) => {
  return (
    <NodeWrapper type="agent">
      <Handle type="target" position={Position.Left} className="!bg-primary w-3 h-3" />
      <Handle type="source" position={Position.Right} className="!bg-primary w-3 h-3" />
      <div className="flex items-center gap-2 mb-2">
        <Robot size={16} weight="fill" className="text-primary" />
        <span className="font-mono text-xs uppercase font-bold tracking-wider text-primary">AGENT</span>
      </div>
      <div className="text-sm font-bold">{data.label}</div>
      <Badge variant="outline" className="mt-2 text-[10px] font-mono">GPT-4o</Badge>
    </NodeWrapper>
  );
};

export const ToolNode = ({ data }: NodeProps<any>) => {
  return (
    <NodeWrapper type="tool">
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
