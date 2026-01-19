type AgentTask = {
  id: string
  type: 'categorize' | 'health-check' | 'optimize' | 'analyze' | 'predict'
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

class AgentKernel {
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
        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      task.status = 'completed'
      task.result = result
      task.completedAt = Date.now()
      this.metrics.tasksCompleted++
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

  private async categorizeUrl(url: string): Promise<string> {
    const promptText = `Analyze this URL and categorize it into ONE of these categories: Social Media, E-commerce, News, Documentation, Entertainment, Business, Education, Technology, Health, Finance, Travel, Food, Sports, Gaming, Government, or Other.

URL: ${url}

Return ONLY the category name, nothing else.`
    
    const category = await window.spark.llm(promptText, 'gpt-4o-mini')
    return category.trim()
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

The optimizationScore should be 0-100 based on current link organization quality.`

    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    return JSON.parse(response)
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

Focus on actionable intelligence like most used categories, engagement patterns, or content preferences.`

    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    return JSON.parse(response)
  }

  private async predictPopularity(url: string): Promise<{ score: number; reasoning: string }> {
    const promptText = `You are a predictive AI agent. Analyze this URL and predict its potential popularity/click-through rate.

URL: ${url}

Consider factors like domain authority, content type, URL structure, and typical engagement patterns. Return as JSON:
{
  "score": 75,
  "reasoning": "Brief explanation of the prediction"
}

Score should be 0-100 (higher = more likely to be popular).`

    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    return JSON.parse(response)
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
    
    if (metrics.averageTaskTime > 3000) {
      this.maxConcurrent = Math.min(5, this.maxConcurrent + 1)
    } else if (metrics.averageTaskTime < 1000 && this.maxConcurrent > 2) {
      this.maxConcurrent = Math.max(2, this.maxConcurrent - 1)
    }

    this.metrics.lastOptimization = Date.now()
  }
}

export const agentKernel = new AgentKernel()
export type { AgentTask, AgentMetrics }
