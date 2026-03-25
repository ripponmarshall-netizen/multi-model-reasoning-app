/**
 * Model Configuration
 * 
 * Defines all available models for both browser-local (WebLLM) and API-based (OpenRouter) inference.
 * Models are categorized by provider and type (reasoning vs summarizer).
 */

export interface ModelDefinition {
  id: string;                              // Unique identifier
  name: string;                            // Display name
  provider: 'webllm' | 'openrouter';      // Provider type
  type: 'reasoning' | 'summarizer';        // Model purpose
  modelId: string;                         // Provider-specific model ID
  vramMb?: number;                         // VRAM requirement (WebLLM only)
  contextWindow?: number;                  // Max context length
  description?: string;                    // Brief description
  enabled: boolean;                        // Available by default
}

// WebLLM Models - Run directly in browser
export const WEBLLM_MODELS: ModelDefinition[] = [
  // Small reasoning models (fast, low resource)
  {
    id: 'llama-3.2-1b',
    name: 'Llama 3.2 1B',
    provider: 'webllm',
    type: 'reasoning',
    modelId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    vramMb: 879,
    contextWindow: 4096,
    description: 'Fast, lightweight reasoning model',
    enabled: true,
  },
  {
    id: 'phi-3.5-mini',
    name: 'Phi 3.5 Mini',
    provider: 'webllm',
    type: 'reasoning',
    modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    vramMb: 3672,
    contextWindow: 4096,
    description: 'Efficient reasoning with good quality',
    enabled: true,
  },
  {
    id: 'smollm2-360m',
    name: 'SmolLM2 360M',
    provider: 'webllm',
    type: 'reasoning',
    modelId: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    vramMb: 376,
    contextWindow: 4096,
    description: 'Ultra-lightweight reasoning',
    enabled: true,
  },
  {
    id: 'qwen2.5-0.5b',
    name: 'Qwen 2.5 0.5B',
    provider: 'webllm',
    type: 'reasoning',
    modelId: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    vramMb: 945,
    contextWindow: 4096,
    description: 'Very small, fast reasoning',
    enabled: true,
  },

  // Summarizer models (larger, better reasoning)
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B (Summarizer)',
    provider: 'webllm',
    type: 'summarizer',
    modelId: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    vramMb: 5001,
    contextWindow: 4096,
    description: 'Best reasoning model for synthesis',
    enabled: true,
  },
  {
    id: 'phi-3.5-mini-summarizer',
    name: 'Phi 3.5 Mini (Summarizer)',
    provider: 'webllm',
    type: 'summarizer',
    modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    vramMb: 3672,
    contextWindow: 4096,
    description: 'Good balance for summarization',
    enabled: true,
  },
];

// OpenRouter Models - API-based inference
export const OPENROUTER_MODELS: ModelDefinition[] = [
  // Reasoning models
  {
    id: 'deepseek-r1-qwen-7b',
    name: 'DeepSeek R1 Distill Qwen 7B',
    provider: 'openrouter',
    type: 'reasoning',
    modelId: 'deepseek/deepseek-r1-distill-qwen-7b',
    contextWindow: 4096,
    description: 'Reasoning-focused model',
    enabled: true,
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B Instruct',
    provider: 'openrouter',
    type: 'reasoning',
    modelId: 'mistralai/mistral-7b-instruct',
    contextWindow: 4096,
    description: 'Fast, capable reasoning',
    enabled: true,
  },
  {
    id: 'qwen2.5-7b',
    name: 'Qwen 2.5 7B',
    provider: 'openrouter',
    type: 'reasoning',
    modelId: 'qwen/qwen-2.5-7b-instruct',
    contextWindow: 4096,
    description: 'Balanced reasoning model',
    enabled: true,
  },

  // Summarizer models (larger variants)
  {
    id: 'deepseek-r1-qwen-14b',
    name: 'DeepSeek R1 Distill Qwen 14B (Summarizer)',
    provider: 'openrouter',
    type: 'summarizer',
    modelId: 'deepseek/deepseek-r1-distill-qwen-14b',
    contextWindow: 4096,
    description: 'Better reasoning for synthesis',
    enabled: true,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large (Summarizer)',
    provider: 'openrouter',
    type: 'summarizer',
    modelId: 'mistralai/mistral-large',
    contextWindow: 8000,
    description: 'High-quality summarization',
    enabled: true,
  },
];

// All available models
export const ALL_MODELS = [...WEBLLM_MODELS, ...OPENROUTER_MODELS];

/**
 * Get model definition by ID
 */
export function getModelById(id: string): ModelDefinition | undefined {
  return ALL_MODELS.find((m) => m.id === id);
}

/**
 * Get all reasoning models
 */
export function getReasoningModels(): ModelDefinition[] {
  return ALL_MODELS.filter((m) => m.type === 'reasoning');
}

/**
 * Get all summarizer models
 */
export function getSummarizerModels(): ModelDefinition[] {
  return ALL_MODELS.filter((m) => m.type === 'summarizer');
}

/**
 * Get models by provider
 */
export function getModelsByProvider(
  provider: 'webllm' | 'openrouter'
): ModelDefinition[] {
  return ALL_MODELS.filter((m) => m.provider === provider);
}

/**
 * Check if user has API key for OpenRouter models
 */
export function hasOpenRouterKey(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('openrouter_api_key');
}

/**
 * Get available models based on API key availability
 */
export function getAvailableModels(): ModelDefinition[] {
  const hasApiKey = hasOpenRouterKey();
  return ALL_MODELS.filter((m) => {
    if (m.provider === 'openrouter' && !hasApiKey) return false;
    return m.enabled;
  });
}
