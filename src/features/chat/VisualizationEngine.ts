import type { VisualizationCommand } from './HoloChat'

/**
 * Visualization Engine
 *
 * Parses AI responses for visualization commands:
 * - [IMAGE: prompt] → Generate image
 * - [PLOT: data] → Generate plot (future)
 * - [DIAGRAM: structure] → Generate diagram (future)
 */

/**
 * Parse visualization commands from AI response
 */
export function parseVisualizationCommands(content: string): VisualizationCommand[] {
  const commands: VisualizationCommand[] = []

  // Match [IMAGE: prompt]
  const imageRegex = /\[IMAGE:\s*([^\]]+)\]/gi
  let match

  while ((match = imageRegex.exec(content)) !== null) {
    commands.push({
      type: 'image',
      data: match[1].trim(),
    })
  }

  // Match [PLOT: data]
  const plotRegex = /\[PLOT:\s*([^\]]+)\]/gi
  while ((match = plotRegex.exec(content)) !== null) {
    commands.push({
      type: 'plot',
      data: match[1].trim(),
    })
  }

  // Match [DIAGRAM: structure]
  const diagramRegex = /\[DIAGRAM:\s*([^\]]+)\]/gi
  while ((match = diagramRegex.exec(content)) !== null) {
    commands.push({
      type: 'diagram',
      data: match[1].trim(),
    })
  }

  return commands
}

/**
 * Remove visualization commands from content (for display)
 */
export function stripVisualizationCommands(content: string): string {
  return content
    .replace(/\[IMAGE:\s*[^\]]+\]/gi, '')
    .replace(/\[PLOT:\s*[^\]]+\]/gi, '')
    .replace(/\[DIAGRAM:\s*[^\]]+\]/gi, '')
    .replace(/\n\n+/g, '\n\n') // Clean up extra newlines
    .trim()
}
