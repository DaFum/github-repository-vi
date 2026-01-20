type AgentTask = {
  id: string
  type: 'categorize' | 'health-check' | 'optimize' | 'analyze' | 'predict' | 'audit' | 'refine'
  payload: unknown
  priority: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: number
  completedAt?: number
  result?: unknown
  error?: string
}

type AgentMetrics = {
  tasksCompleted: number
  tasksFaileds: number
  averageTaskTime: number
  successRate: number
  lastOptimization: number
}

/**
 * HyperSmolAgents
 *
 * The biological heart of the HyperSmol ecosystem. This kernel orchestrates
 * asynchronous micro-intelligences to perform tasks without blocking the
 * main thread, mimicking a living organism's autonomic nervous system.
 *
 * Capabilities:
 * - Swarm Logic: Manages concurrent specialized agents
 * - Self-Healing: Automatically adjusts concurrency based on system load
 * - Asynchronous Mastery: Prioritizes user-facing tasks over background analysis
 * - Cognitive Mesh: Implements recursive refinement and audit loops
 */
class HyperSmolAgents {
  private taskQueue: AgentTask[] = []
  private runningTasks: Map<string, AgentTask> = new Map()
  private metrics: AgentMetrics = {
    tasksCompleted: 0,
    tasksFaileds: 0,
    averageTaskTime: 0,
    successRate: 100,
    lastOptimization: Date.now()
  }
  private maxConcurrent = 3
  private isProcessing = false

  async enqueueTask(type: AgentTask['type'], payload: unknown, priority = 5): Promise<string> {
    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      priority,
      status: 'pending',
      createdAt: Date.now()
    }

    this.taskQueue.push(task)
    this.taskQueue.sort((a, b) => b.priority - a.priority)

    if (!this.isProcessing) {
      this.processQueue()
    }

    return task.id
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.taskQueue.length > 0 || this.runningTasks.size > 0) {
      while (this.runningTasks.size < this.maxConcurrent && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift()!
        task.status = 'running'
        this.runningTasks.set(task.id, task)
        this.executeTask(task)
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.isProcessing = false
  }

  private async executeTask(task: AgentTask): Promise<void> {
    const startTime = Date.now()

    try {
      let result: unknown

      switch (task.type) {
        case 'categorize':
          result = await this.categorizeUrl(task.payload as string)
          break
        case 'health-check':
          result = await this.checkHealth(task.payload as string)
          break
        case 'optimize':
          result = await this.optimizeLinks(task.payload as Array<{ id: string; originalUrl: string; clicks: number }>)
          break
        case 'analyze':
          result = await this.analyzePattern(task.payload as Array<{ originalUrl: string; category?: string; clicks: number }>)
          break
        case 'predict':
          result = await this.predictPopularity(task.payload as string)
          break
        case 'audit':
          result = await this.auditContent(task.payload as string)
          break
        case 'refine':
          result = await this.refineContent(task.payload as { content: string; context: string })
          break
        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      task.status = 'completed'
      task.result = result
      task.completedAt = Date.now()
      this.metrics.tasksCompleted++

      // Self-optimize every 10 tasks to prevent oscillation
      if (this.metrics.tasksCompleted % 10 === 0) {
        await this.selfOptimize()
      }
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      task.completedAt = Date.now()
      this.metrics.tasksFaileds++
    } finally {
      const duration = Date.now() - startTime
      this.updateMetrics(duration)
      this.runningTasks.delete(task.id)
    }
  }

  // --- Specialized Agents ---

  private async categorizeUrl(url: string): Promise<string> {
    const promptText = `Analyze this URL and categorize it into ONE of these categories: Social Media, E-commerce, News, Documentation, Entertainment, Business, Education, Technology, Health, Finance, Travel, Food, Sports, Gaming, Government, or Other.

URL: ${url}

Return ONLY the category name, nothing else.`
    
    try {
      const { pollinations } = await import('./pollinations');
      const category = await pollinations.chat([
        { role: 'system', content: 'You are a precise URL categorization agent.' },
        { role: 'user', content: promptText }
      ], { model: 'openai', temperature: 0.1 });

      return category.trim();
    } catch (e) {
      console.warn('Agent Cortex failed, falling back to heuristic', e);
      return 'Uncategorized';
    }
  }

  private async checkHealth(url: string): Promise<{ status: 'healthy' | 'unknown'; timestamp: number }> {
    try {
      await fetch(url, { method: 'HEAD', mode: 'no-cors' })
      return { status: 'healthy', timestamp: Date.now() }
    } catch {
      return { status: 'unknown', timestamp: Date.now() }
    }
  }

  private async optimizeLinks(links: Array<{ id: string; originalUrl: string; clicks: number }>): Promise<{ recommendations: string[]; optimizationScore: number }> {
    const promptText = `You are an AI optimization agent. Analyze these shortened links and provide strategic recommendations.

Links data:
${JSON.stringify(links.map(l => ({ url: l.originalUrl, clicks: l.clicks })), null, 2)}

Provide 3-5 actionable recommendations to improve link management, categorization, or usage patterns. Return as a JSON object with this structure:
{
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "optimizationScore": 85
}

The optimizationScore should be 0-100 based on current link organization quality.`;

    const { pollinations } = await import('./pollinations');
    const response = await pollinations.chat([
      { role: 'system', content: 'You are a strategic optimization expert. Return strictly valid JSON.' },
      { role: 'user', content: promptText }
    ], { model: 'openai', jsonMode: true });

    return JSON.parse(response);
  }

  private async analyzePattern(links: Array<{ originalUrl: string; category?: string; clicks: number }>): Promise<{ insights: string[]; trends: string[] }> {
    const promptText = `You are an AI analytics agent. Analyze these link usage patterns and extract insights.

Links data:
${JSON.stringify(links.map(l => ({ url: l.originalUrl, category: l.category, clicks: l.clicks })), null, 2)}

Identify patterns, trends, and insights about the user's link usage. Return as JSON:
{
  "insights": ["insight 1", "insight 2", ...],
  "trends": ["trend 1", "trend 2", ...]
}

Focus on actionable intelligence like most used categories, engagement patterns, or content preferences.`;

    const { pollinations } = await import('./pollinations');
    const response = await pollinations.chat([
      { role: 'system', content: 'You are a data analytics expert. Return strictly valid JSON.' },
      { role: 'user', content: promptText }
    ], { model: 'openai', jsonMode: true });

    return JSON.parse(response);
  }

  private async predictPopularity(url: string): Promise<{ score: number; reasoning: string }> {
    const promptText = `You are a predictive AI agent. Analyze this URL and predict its potential popularity/click-through rate.

URL: ${url}

Consider factors like domain authority, content type, URL structure, and typical engagement patterns. Return as JSON:
{
  "score": 75,
  "reasoning": "Brief explanation of the prediction"
}

Score should be 0-100 (higher = more likely to be popular).`;

    const { pollinations } = await import('./pollinations');
    const response = await pollinations.chat([
      { role: 'system', content: 'You are a viral trend prediction expert. Return strictly valid JSON.' },
      { role: 'user', content: promptText }
    ], { model: 'openai', jsonMode: true });

    return JSON.parse(response);
  }

  /**
   * The "Devil's Advocate" (Logic Auditor)
   * Challenges assumptions and finds flaws.
   */
  private async auditContent(content: string): Promise<{ flaws: string[]; riskLevel: 'low' | 'medium' | 'high'; critique: string }> {
    const { pollinations } = await import('./pollinations');
    const prompt = `Audit the following content/plan for logical fallacies, safety risks, and hidden assumptions. Be ruthless.

Content: "${content}"

Return JSON:
{
  "flaws": ["flaw 1", "flaw 2"],
  "riskLevel": "low" | "medium" | "high",
  "critique": "Overall assessment..."
}`;

    const response = await pollinations.chat([
      { role: 'system', content: 'You are the Devil\'s Advocate. You challenge assumptions and find critical flaws. You are not polite; you are accurate.' },
      { role: 'user', content: prompt }
    ], { model: 'claude', jsonMode: true }); // Prefer reasoning model

    return JSON.parse(response);
  }

  /**
   * The "Recursive Refinement" Loop
   * Generates, Criticizes, and Refines content in a loop.
   */
  private async refineContent({ content, context }: { content: string; context: string }): Promise<{ finalContent: string; iterations: number; confidence: number }> {
    const { pollinations } = await import('./pollinations');
    let currentDraft = content;
    let confidence = 0;
    let iterations = 0;
    const MAX_ITERATIONS = 3;

    while (iterations < MAX_ITERATIONS && confidence < 90) {
        iterations++;

        // 1. Criticize
        const critiqueResponse = await pollinations.chat([
            { role: 'system', content: 'You are a strict critic. Rate confidence (0-100) and provide specific feedback.' },
            { role: 'user', content: `Context: ${context}\n\nDraft: ${currentDraft}\n\nProvide JSON: { "confidence": number, "feedback": "string" }` }
        ], { model: 'openai', jsonMode: true });

        const critique = JSON.parse(critiqueResponse);
        confidence = critique.confidence;

        if (confidence >= 90) break;

        // 2. Refine
        const refineResponse = await pollinations.chat([
            { role: 'system', content: 'You are an expert editor. Improve the draft based on feedback.' },
            { role: 'user', content: `Original: ${currentDraft}\nFeedback: ${critique.feedback}\n\nRewrite the draft.` }
        ], { model: 'openai' }); // Fast model for rewrite

        currentDraft = refineResponse;
    }

    return { finalContent: currentDraft, iterations, confidence };
  }

  private updateMetrics(taskDuration: number): void {
    const totalTasks = this.metrics.tasksCompleted + this.metrics.tasksFaileds
    this.metrics.averageTaskTime = 
      (this.metrics.averageTaskTime * (totalTasks - 1) + taskDuration) / totalTasks
    this.metrics.successRate = 
      (this.metrics.tasksCompleted / totalTasks) * 100
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics }
  }

  getQueueStatus(): { pending: number; running: number } {
    return {
      pending: this.taskQueue.length,
      running: this.runningTasks.size
    }
  }

  async selfOptimize(): Promise<void> {
    const metrics = this.getMetrics()
    
    if (metrics.averageTaskTime > 3000 && this.maxConcurrent > 1) {
      this.maxConcurrent = Math.max(1, this.maxConcurrent - 1)
    }
    else if (metrics.averageTaskTime < 1000 && this.maxConcurrent < 5) {
      this.maxConcurrent = Math.min(5, this.maxConcurrent + 1)
    }

    this.metrics.lastOptimization = Date.now()
  }
}

export const hyperSmolAgents = new HyperSmolAgents()
export type { AgentTask, AgentMetrics }
