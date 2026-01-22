import { DragEndEvent } from '@dnd-kit/core'
import { useFlowStore } from '@/store/flowStore'

export const useFlowDragDrop = () => {
  const { addNode } = useFlowStore()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event
    if (active.data.current) {
      const type = active.data.current.type
      const label = active.data.current.label
      const position = { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 }
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label, type },
      }
      addNode(newNode)
    }
  }

  return { handleDragEnd }
}
