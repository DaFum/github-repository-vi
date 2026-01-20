export type PollinationsMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type PollinationsOptions = {
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
  seed?: number;
};

class PollinationsClient {
  private apiKey: string | null = null;
  private baseUrl = 'https://gen.pollinations.ai';

  constructor() {
    // Try to load API key from local storage on initialization
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('pollinations_api_key');
    }
  }

  setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pollinations_api_key', key);
    }
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async chat(messages: PollinationsMessage[], options: PollinationsOptions = {}): Promise<string> {
    const { model = 'openai', temperature = 0.7, jsonMode = false, seed } = options;

    // Construct headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Construct body
    const body: any = {
      model,
      messages,
      temperature,
      stream: false,
    };

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    if (seed !== undefined) {
      body.seed = seed;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pollinations API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Pollinations Chat Error:', error);
      throw error;
    }
  }

  /**
   * Generates an image using Pollinations.ai
   * @param prompt The image description
   * @param options Additional options like model, width, height
   */
  async generateImage(prompt: string, options: { model?: string; width?: number; height?: number } = {}): Promise<string> {
    const { model = 'flux', width = 1024, height = 1024 } = options;
    const encodedPrompt = encodeURIComponent(prompt);

    // Construct URL with query params
    let url = `${this.baseUrl}/image/${encodedPrompt}?model=${model}&width=${width}&height=${height}&nologo=true`;

    if (this.apiKey) {
      // The docs mention using Authorization header for image generation too
      // But for simple GET requests, usually query param is easier if we want to use it in an <img> tag
      // However, for fetching the image blob or URL, we can use fetch.
      // If we just want the URL string, we can append the key if permitted.
      // Docs say: "Auth methods: 2. Query param: ?key=YOUR_API_KEY"
      url += `&key=${this.apiKey}`;
    }

    return url;
  }
}

export const pollinations = new PollinationsClient();
