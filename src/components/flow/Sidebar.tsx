import { useDraggable } from '@dnd-kit/core'
import { Card } from '@/components/ui/card'
import { Lightning, Robot, Wrench } from '@phosphor-icons/react'

type SidebarItemProps = {
  type: 'agent' | 'tool' | 'trigger'
  label: string
}

const SidebarItem = ({ type, label }: SidebarItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `new-${type}`,
    data: { type, label },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const Icon = type === 'trigger' ? Lightning : type === 'agent' ? Robot : Wrench
  const color =
    type === 'trigger' ? 'text-yellow-400' : type === 'agent' ? 'text-primary' : 'text-blue-400'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-3 cursor-grab active:cursor-grabbing"
    >
      <Card className="glass-card hover:bg-accent/5 border-border/50 flex items-center gap-3 border p-3 transition-colors">
        <Icon size={20} weight="fill" className={color} />
        <div>
          <div className="font-mono text-xs tracking-wider uppercase opacity-70">{type}</div>
          <div className="text-sm font-bold">{label}</div>
        </div>
      </Card>
    </div>
  )
}

export const Sidebar = () => {
  return (
    <aside className="border-border bg-background/50 z-10 h-full w-64 border-r p-4 backdrop-blur-md">
      <h3 className="mb-4 text-sm font-black tracking-wider uppercase">Component_Library</h3>

      <div className="space-y-1">
        <div className="text-muted-foreground mt-4 mb-2 font-mono text-xs uppercase">Triggers</div>
        <SidebarItem type="trigger" label="User Input" />
        <SidebarItem type="trigger" label="Webhook" />

        <div className="text-muted-foreground mt-4 mb-2 font-mono text-xs uppercase">Agents</div>
        <SidebarItem type="agent" label="LLM Agent" />
        <SidebarItem type="agent" label="Classifier" />

        <div className="text-muted-foreground mt-4 mb-2 font-mono text-xs uppercase">Tools</div>
        <SidebarItem type="tool" label="File Reader" />
        <SidebarItem type="tool" label="API Call" />
      </div>
    </aside>
  )
}
