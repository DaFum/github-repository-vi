import { NodeProcessor, ExecutionContext } from './types';
import { pollinations } from '@/lib/pollinations';
// import { compileExpression } from 'filtrex'; // Uncomment when implemented

export class AgentProcessor implements NodeProcessor {
  isReady(inputs: Record<string, any>, config: any): boolean {
    // Agents generally need a prompt or user input
    return true;
  }

  async execute(inputs: Record<string, any>, config: any, context: ExecutionContext): Promise<any> {
    const prompt = config.prompt || "Explain quantum computing";
    // Interpolate inputs into prompt here (future step)

    // Call Pollinations
    const response = await pollinations.chat([
        { role: 'system', content: config.systemPrompt || 'You are a helpful agent.' },
        { role: 'user', content: prompt }
    ], { model: config.model || 'openai' });

    return { text: response };
  }
}

export class LogicProcessor implements NodeProcessor {
  isReady(inputs: Record<string, any>, config: any): boolean {
    return true;
  }

  async execute(inputs: Record<string, any>, config: any, context: ExecutionContext): Promise<any> {
    // Placeholder for Filtrex logic
    // const myFilter = compileExpression(config.expression);
    // return myFilter(inputs);
    return inputs; // Pass-through for now
  }
}

export class NodeRegistry {
  private static processors: Map<string, NodeProcessor> = new Map();

  static register(type: string, processor: NodeProcessor) {
    this.processors.set(type, processor);
  }

  static get(type: string): NodeProcessor {
    return this.processors.get(type) || new LogicProcessor(); // Default
  }
}

// Register default processors
NodeRegistry.register('agent', new AgentProcessor());
NodeRegistry.register('trigger', new LogicProcessor()); // Triggers act as pass-throughs usually
NodeRegistry.register('tool', new LogicProcessor()); // Mock for now
