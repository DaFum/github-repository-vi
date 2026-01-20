import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Lightning, Robot, Wrench } from '@phosphor-icons/react';

type SidebarItemProps = {
  type: 'agent' | 'tool' | 'trigger';
  label: string;
};

const SidebarItem = ({ type, label }: SidebarItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `new-${type}`,
    data: { type, label },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const Icon = type === 'trigger' ? Lightning : type === 'agent' ? Robot : Wrench;
  const color = type === 'trigger' ? 'text-yellow-400' : type === 'agent' ? 'text-primary' : 'text-blue-400';

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing mb-3">
      <Card className="p-3 glass-card hover:bg-accent/5 transition-colors border border-border/50 flex items-center gap-3">
        <Icon size={20} weight="fill" className={color} />
        <div>
          <div className="font-mono text-xs uppercase tracking-wider opacity-70">{type}</div>
          <div className="font-bold text-sm">{label}</div>
        </div>
      </Card>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <aside className="w-64 h-full border-r border-border bg-background/50 backdrop-blur-md p-4 z-10">
      <h3 className="font-black uppercase tracking-wider text-sm mb-4">Component_Library</h3>

      <div className="space-y-1">
        <div className="text-xs font-mono uppercase text-muted-foreground mb-2 mt-4">Triggers</div>
        <SidebarItem type="trigger" label="User Input" />
        <SidebarItem type="trigger" label="Webhook" />

        <div className="text-xs font-mono uppercase text-muted-foreground mb-2 mt-4">Agents</div>
        <SidebarItem type="agent" label="LLM Agent" />
        <SidebarItem type="agent" label="Classifier" />

        <div className="text-xs font-mono uppercase text-muted-foreground mb-2 mt-4">Tools</div>
        <SidebarItem type="tool" label="File Reader" />
        <SidebarItem type="tool" label="API Call" />
      </div>
    </aside>
  );
};
