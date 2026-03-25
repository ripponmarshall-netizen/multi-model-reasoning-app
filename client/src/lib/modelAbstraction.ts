/**
 * Model Abstraction Layer
 * 
 * Provides a unified interface for calling both WebLLM (local) and OpenRouter (API) models.
 * This abstraction allows seamless switching between providers and model types.
 */

import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import { getModelById } from './modelConfig';

export interface ModelResponse {
  modelId: string;
  modelName: string;
  status: 'pending' | 'complete' | 'error';
  output: string;
  error?: string;
  duration: number; // milliseconds
}

// Global WebLLM engine instance
let webllmEngine: MLCEngine | null = null;
let currentWebLLMModel: string | null = null;

/**
 * Initialize WebLLM engine (singleton)
 */
export async function initializeWebLLMEngine(
  onProgress?: (progress: any) => void
): Promise<MLCEngine> {
  if (webllmEngine) {
    return webllmEngine;
  }

  const initProgressCallback = (progress: any) => {
    if (onProgress) {
      onProgress(progress);
    }
  };

  webllmEngine = new MLCEngine({
    initProgressCallback,
  });

  return webllmEngine;
}

/**
 * Load a WebLLM model
 */
export async function loadWebLLMModel(
  modelId: string,
  onProgress?: (progress: any) => void
): Promise<void> {
  const engine = await initializeWebLLMEngine(onProgress);

  if (currentWebLLMModel === modelId) {
    // Model already loaded
    return;
  }

  const initProgressCallback = (progress: any) => {
    if (onProgress) {
      onProgress(progress);
    }
  };

  // Create new engine instance for model loading
  const tempEngine = new MLCEngine({
    initProgressCallback,
  });

  await tempEngine.reload(modelId);
  webllmEngine = tempEngine;
  currentWebLLMModel = modelId;
}

/**
 * Call a WebLLM model
 */
export async function callWebLLMModel(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  timeout: number = 60000
): Promise<ModelResponse> {
  const startTime = Date.now();
  const model = getModelById(modelId);

  if (!model || model.provider !== 'webllm') {
    throw new Error(`Invalid WebLLM model: ${modelId}`);
  }

  try {
    // Load model if not already loaded
    if (currentWebLLMModel !== model.modelId) {
      await loadWebLLMModel(model.modelId);
    }

    if (!webllmEngine) {
      throw new Error('WebLLM engine not initialized');
    }

    // Create messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    // Call model with timeout
    const responsePromise = webllmEngine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Model timeout')), timeout)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]);

    const output =
      (response as any).choices?.[0]?.message?.content || 'No response';

    return {
      modelId,
      modelName: model.name,
      status: 'complete',
      output,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      modelId,
      modelName: model?.name || modelId,
      status: 'error',
      output: '',
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Call an OpenRouter model via API
 */
export async function callOpenRouterModel(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  timeout: number = 60000
): Promise<ModelResponse> {
  const startTime = Date.now();
  const model = getModelById(modelId);

  if (!model || model.provider !== 'openrouter') {
    throw new Error(`Invalid OpenRouter model: ${modelId}`);
  }

  const apiKey = localStorage.getItem('openrouter_api_key');
  if (!apiKey) {
    return {
      modelId,
      modelName: model.name,
      status: 'error',
      output: '',
      error: 'OpenRouter API key not configured',
      duration: Date.now() - startTime,
    };
  }

  try {
    // Create messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.modelId,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.error?.message || `API error: ${response.status}`;

      return {
        modelId,
        modelName: model.name,
        status: 'error',
        output: '',
        error: errorMessage,
        duration: Date.now() - startTime,
      };
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || 'No response';

    return {
      modelId,
      modelName: model.name,
      status: 'complete',
      output,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      modelId,
      modelName: model.name,
      status: 'error',
      output: '',
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Unified model call interface
 */
export async function callModel(
  modelId: string,
  prompt: string,
  systemPrompt?: string,
  timeout?: number
): Promise<ModelResponse> {
  const model = getModelById(modelId);

  if (!model) {
    throw new Error(`Model not found: ${modelId}`);
  }

  if (model.provider === 'webllm') {
    return callWebLLMModel(modelId, prompt, systemPrompt, timeout);
  } else if (model.provider === 'openrouter') {
    return callOpenRouterModel(modelId, prompt, systemPrompt, timeout);
  } else {
    throw new Error(`Unknown provider: ${model.provider}`);
  }
}

/**
 * Get WebLLM engine status
 */
export function getWebLLMStatus(): {
  initialized: boolean;
  currentModel: string | null;
} {
  return {
    initialized: webllmEngine !== null,
    currentModel: currentWebLLMModel,
  };
}

/**
 * Clear WebLLM engine (for memory cleanup)
 */
export function clearWebLLMEngine(): void {
  webllmEngine = null;
  currentWebLLMModel = null;
}
