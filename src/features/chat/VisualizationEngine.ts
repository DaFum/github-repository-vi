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
 * Preserves the order of commands as they appear in the text
 */
export function parseVisualizationCommands(content: string): VisualizationCommand[] {
  const commandsWithPosition: Array<{ command: VisualizationCommand; position: number }> = []

  // Match [IMAGE: prompt]
  const imageRegex = /\[IMAGE:\s*([^\]]+)\]/gi
  let match

  while ((match = imageRegex.exec(content)) !== null) {
    commandsWithPosition.push({
      command: {
        type: 'image',
        data: match[1].trim(),
      },
      position: match.index,
    })
  }

  // Match [PLOT: data]
  const plotRegex = /\[PLOT:\s*([^\]]+)\]/gi
  while ((match = plotRegex.exec(content)) !== null) {
    commandsWithPosition.push({
      command: {
        type: 'plot',
        data: match[1].trim(),
      },
      position: match.index,
    })
  }

  // Match [DIAGRAM: structure]
  const diagramRegex = /\[DIAGRAM:\s*([^\]]+)\]/gi
  while ((match = diagramRegex.exec(content)) !== null) {
    commandsWithPosition.push({
      command: {
        type: 'diagram',
        data: match[1].trim(),
      },
      position: match.index,
    })
  }

  // Sort by position to maintain original order
  return commandsWithPosition.sort((a, b) => a.position - b.position).map((item) => item.command)
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
