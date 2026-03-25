import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ModelDefinition } from '@/lib/modelConfig';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ModelSelectorProps {
  reasoningModels: ModelDefinition[];
  summarizerModels: ModelDefinition[];
  selectedReasoningModels: string[];
  selectedSummarizerModel: string;
  onReasoningModelsChange: (modelIds: string[]) => void;
  onSummarizerModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  reasoningModels,
  summarizerModels,
  selectedReasoningModels,
  selectedSummarizerModel,
  onReasoningModelsChange,
  onSummarizerModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const [expandedProvider, setExpandedProvider] = useState<
    'webllm' | 'openrouter' | null
  >('webllm');

  // Group models by provider
  const webllmReasoningModels = reasoningModels.filter(
    (m) => m.provider === 'webllm'
  );
  const openrouterReasoningModels = reasoningModels.filter(
    (m) => m.provider === 'openrouter'
  );

  const webllmSummarizerModels = summarizerModels.filter(
    (m) => m.provider === 'webllm'
  );
  const openrouterSummarizerModels = summarizerModels.filter(
    (m) => m.provider === 'openrouter'
  );

  const toggleReasoningModel = (modelId: string) => {
    if (selectedReasoningModels.includes(modelId)) {
      onReasoningModelsChange(
        selectedReasoningModels.filter((id) => id !== modelId)
      );
    } else {
      onReasoningModelsChange([...selectedReasoningModels, modelId]);
    }
  };

  const ModelGroup = ({
    title,
    models,
    isReasoningGroup,
    provider,
  }: {
    title: string;
    models: ModelDefinition[];
    isReasoningGroup: boolean;
    provider: 'webllm' | 'openrouter';
  }) => {
    const isExpanded = expandedProvider === provider;

    if (models.length === 0) return null;

    return (
      <div className="space-y-2">
        <button
          onClick={() =>
            setExpandedProvider(isExpanded ? null : provider)
          }
          className="flex w-full items-center gap-2 rounded-md bg-muted px-3 py-2 hover:bg-muted/80"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <span className="text-sm font-medium">{title}</span>
          <Badge variant="secondary" className="ml-auto">
            {models.length}
          </Badge>
        </button>

        {isExpanded && (
          <div className="space-y-2 pl-2">
            {models.map((model) => (
              <div key={model.id} className="flex items-start gap-3">
                {isReasoningGroup ? (
                  <>
                    <Checkbox
                      id={model.id}
                      checked={selectedReasoningModels.includes(model.id)}
                      onCheckedChange={() => toggleReasoningModel(model.id)}
                      disabled={disabled}
                    />
                    <label
                      htmlFor={model.id}
                      className="flex flex-1 cursor-pointer flex-col gap-1"
                    >
                      <span className="text-sm font-medium">{model.name}</span>
                      {model.description && (
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      )}
                      {model.vramMb && (
                        <span className="text-xs text-muted-foreground">
                          VRAM: {model.vramMb}MB
                        </span>
                      )}
                    </label>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="space-y-4 p-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Reasoning Models</h3>
        <div className="space-y-3">
          {webllmReasoningModels.length > 0 && (
            <ModelGroup
              title="Browser (WebLLM)"
              models={webllmReasoningModels}
              isReasoningGroup={true}
              provider="webllm"
            />
          )}
          {openrouterReasoningModels.length > 0 && (
            <ModelGroup
              title="API (OpenRouter)"
              models={openrouterReasoningModels}
              isReasoningGroup={true}
              provider="openrouter"
            />
          )}
        </div>

        {selectedReasoningModels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {selectedReasoningModels.map((modelId) => {
              const model = reasoningModels.find((m) => m.id === modelId);
              return (
                <Badge key={modelId} variant="outline">
                  {model?.name}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-3 text-sm font-semibold">Summarizer Model</h3>
        <Select
          value={selectedSummarizerModel}
          onValueChange={onSummarizerModelChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select summarizer model..." />
          </SelectTrigger>
          <SelectContent>
            {webllmSummarizerModels.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Browser (WebLLM)
                </div>
                {webllmSummarizerModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </>
            )}
            {openrouterSummarizerModels.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  API (OpenRouter)
                </div>
                {openrouterSummarizerModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>

        {selectedSummarizerModel && (
          <div className="mt-2">
            <Badge variant="outline">
              {summarizerModels.find((m) => m.id === selectedSummarizerModel)
                ?.name}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
