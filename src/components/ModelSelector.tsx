import { useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAetherStore } from '@/lib/store/useAetherStore'
import type { ModelCapability } from '@/lib/pollinations'
import { Eye, SpeakerHigh, VideoCamera, Code, MagnifyingGlass, Brain } from '@phosphor-icons/react'

type ModelSelectorProps = {
  type: 'text' | 'image'
  value?: string
  onChange: (modelName: string) => void
  label?: string
  placeholder?: string
}

const CapabilityIcon = ({ capability }: { capability: ModelCapability }) => {
  const iconProps = { size: 10, weight: 'bold' as const }

  switch (capability) {
    case 'vision':
      return <Eye {...iconProps} />
    case 'audio':
      return <SpeakerHigh {...iconProps} />
    case 'video':
      return <VideoCamera {...iconProps} />
    case 'code':
      return <Code {...iconProps} />
    case 'search':
      return <MagnifyingGlass {...iconProps} />
    case 'reasoning':
      return <Brain {...iconProps} />
    default:
      return null
  }
}

const CapabilityBadges = ({ capabilities }: { capabilities?: ModelCapability[] }) => {
  if (!capabilities || capabilities.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      {capabilities.map((cap) => (
        <Badge
          key={cap}
          variant="outline"
          className="border-primary/30 bg-primary/10 flex h-4 items-center gap-0.5 px-1 font-mono text-[8px] uppercase"
        >
          <CapabilityIcon capability={cap} />
          <span>{cap}</span>
        </Badge>
      ))}
    </div>
  )
}

export function ModelSelector({ type, value, onChange, label, placeholder }: ModelSelectorProps) {
  const { textModels, imageModels, isLoadingModels } = useAetherStore()

  const models = useMemo(() => {
    return type === 'text' ? textModels : imageModels
  }, [type, textModels, imageModels])

  const selectedModel = useMemo(() => {
    return models.find((m) => m.name === value)
  }, [models, value])

  if (isLoadingModels) {
    return (
      <div className="border-border bg-input flex h-10 items-center justify-center rounded-md border px-3 font-mono text-sm">
        <span className="text-muted-foreground">LOADING_MODELS...</span>
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <div className="border-destructive/50 bg-destructive/10 flex h-10 items-center justify-center rounded-md border px-3 font-mono text-sm">
        <span className="text-destructive">NO_MODELS_AVAILABLE</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="font-mono text-xs uppercase">{label}</label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-border bg-input h-10 font-mono text-sm">
          <SelectValue placeholder={placeholder || 'SELECT_MODEL'}>
            {selectedModel && (
              <div className="flex items-center gap-2">
                <span className="font-bold">{selectedModel.description || selectedModel.name}</span>
                {'capabilities' in selectedModel && (
                  <CapabilityBadges capabilities={selectedModel.capabilities} />
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="border-primary/30 bg-card max-h-80">
          <SelectGroup>
            {models.map((model) => (
              <SelectItem
                key={model.name}
                value={model.name}
                className="hover:bg-primary/10 font-mono text-xs"
              >
                <div className="flex flex-col gap-1 py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{model.description || model.name}</span>
                    {'capabilities' in model && (
                      <CapabilityBadges capabilities={model.capabilities} />
                    )}
                  </div>
                  <span className="text-muted-foreground text-[10px]">{model.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
