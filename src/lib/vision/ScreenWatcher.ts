import { Lifecycle } from '../interfaces'
import { pollinations } from '@/lib/pollinations'

/**
 * Service that captures screen content and sends it for AI analysis.
 */
export class ScreenWatcher implements Lifecycle {
  private stream: MediaStream | null = null
  private intervalId: NodeJS.Timeout | null = null
  private onAnalysisCallback?: (analysis: string) => void

  /**
   * Initializes the screen watcher by starting capture.
   */
  async initialize() {
    await this.startCapture()
  }

  /**
   * Disposes of the screen watcher, stopping capture and analysis loop.
   */
  dispose() {
    this.stopCapture()
  }

  /**
   * Requests screen capture permission and starts the analysis loop.
   */
  async startCapture() {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      })

      console.log('Ocular Cortex: Stream Active')

      // Start analysis loop (every 5s)
      this.intervalId = setInterval(() => this.analyzeFrame(), 5000)
    } catch (err) {
      console.error('Ocular Cortex Error:', err)
    }
  }

  /**
   * Stops screen capture and clears the interval.
   */
  stopCapture() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * Registers a callback for analysis results.
   * @param cb Callback function receiving the analysis text.
   */
  onAnalysis(cb: (analysis: string) => void) {
    this.onAnalysisCallback = cb
  }

  /**
   * Captures a frame from the stream and sends it to the vision model.
   */
  private async analyzeFrame() {
    if (!this.stream) return

    // Capture frame to canvas
    const track = this.stream.getVideoTracks()[0]
    const imageCapture = new ImageCapture(track)
    const bitmap = await imageCapture.grabFrame()

    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(bitmap, 0, 0)
    const base64Image = canvas.toDataURL('image/jpeg', 0.5) // Compress

    // Send to Vision Model
    try {
      // Pollinations/OpenAI compatible vision request
      // Note: Currently we use pollinations.chat with image_url structure
      const analysis = await pollinations.chat(
        [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this screen state. Identify active applications, errors, or significant status changes.',
              },
              { type: 'image_url', image_url: { url: base64Image } },
            ],
          } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        ],
        { model: 'openai' }
      ) // Vision capable model

      if (this.onAnalysisCallback) {
        this.onAnalysisCallback(analysis)
      }
    } catch (e) {
      console.error('Vision Analysis Failed', e)
    }
  }
}

/**
 * Factory function to create a new ScreenWatcher instance.
 */
export const createScreenWatcher = () => new ScreenWatcher()
