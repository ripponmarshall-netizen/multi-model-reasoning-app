/**
 * Reasoning Flow
 * 
 * Orchestrates parallel execution of multiple reasoning models and synthesis via summarizer.
 */

import { callModel, ModelResponse } from './modelAbstraction';

export interface ReasoningFlowResult {
  responses: ModelResponse[];
  summary: ModelResponse;
  totalDuration: number;
}

/**
 * Execute the full reasoning flow:
 * 1. Run all selected reasoning models in parallel
 * 2. Collect their outputs
 * 3. Send outputs to summarizer model
 * 4. Return all results
 */
export async function executeReasoningFlow(
  userPrompt: string,
  selectedReasoningModels: string[],
  summarizerModelId: string,
  parallel: boolean = true,
  onStatusUpdate?: (update: string) => void
): Promise<ReasoningFlowResult> {
  const flowStartTime = Date.now();

  if (selectedReasoningModels.length === 0) {
    throw new Error('No reasoning models selected');
  }

  // Emit status
  if (onStatusUpdate) {
    onStatusUpdate('Starting reasoning models...');
  }

  // Step 1: Run reasoning models
  let responses: ModelResponse[];

  if (parallel) {
    // Run all models in parallel
    const promises = selectedReasoningModels.map((modelId) =>
      callModel(modelId, userPrompt)
    );

    responses = await Promise.all(promises);
  } else {
    // Run models sequentially
    responses = [];
    for (const modelId of selectedReasoningModels) {
      const response = await callModel(modelId, userPrompt);
      responses.push(response);
    }
  }

  // Emit status
  if (onStatusUpdate) {
    onStatusUpdate('All reasoning models complete. Running summarizer...');
  }

  // Step 2: Prepare context for summarizer
  const reasoningContext = responses
    .map((r) => {
      if (r.status === 'error') {
        return `[${r.modelName}] ERROR: ${r.error}`;
      }
      return `[${r.modelName}]:\n${r.output}`;
    })
    .join('\n\n---\n\n');

  const summarizerPrompt = `You are an expert reasoning synthesizer. You have been given the following responses from multiple AI models to the user's original prompt.

Original User Prompt:
${userPrompt}

---

Model Responses:
${reasoningContext}

---

Your Task:
Analyze all the responses above. Identify common themes, resolve any conflicts, and produce a concise, well-structured summary that:
1. Synthesizes the best insights from all models
2. Resolves any contradictions between models
3. Provides clear, actionable recommendations
4. Highlights areas of strong agreement and areas of disagreement

Format your response with clear sections and bullet points where appropriate.`;

  // Step 3: Call summarizer model
  const summarizerSystemPrompt =
    'You are an expert at synthesizing multiple perspectives into clear, actionable insights.';

  const summary = await callModel(
    summarizerModelId,
    summarizerPrompt,
    summarizerSystemPrompt
  );

  // Emit final status
  if (onStatusUpdate) {
    onStatusUpdate('Reasoning flow complete!');
  }

  return {
    responses,
    summary,
    totalDuration: Date.now() - flowStartTime,
  };
}

/**
 * Validate that selected models are available
 */
export function validateModelSelection(
  reasoningModels: string[],
  summarizerModel: string,
  availableModels: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (reasoningModels.length === 0) {
    errors.push('At least one reasoning model must be selected');
  }

  for (const modelId of reasoningModels) {
    if (!availableModels.includes(modelId)) {
      errors.push(`Reasoning model not available: ${modelId}`);
    }
  }

  if (!summarizerModel) {
    errors.push('Summarizer model must be selected');
  } else if (!availableModels.includes(summarizerModel)) {
    errors.push(`Summarizer model not available: ${summarizerModel}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    return `${(ms / 60000).toFixed(1)}m`;
  }
}
