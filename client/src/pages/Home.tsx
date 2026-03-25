import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Settings, AlertCircle } from 'lucide-react';

import PromptInput from '@/components/PromptInput';
import ModelSelector from '@/components/ModelSelector';
import ModelResponse from '@/components/ModelResponse';
import SummaryPanel from '@/components/SummaryPanel';
import SettingsPanel from '@/components/SettingsPanel';

import {
  getReasoningModels,
  getSummarizerModels,
  getAvailableModels,
  hasOpenRouterKey,
} from '@/lib/modelConfig';
import {
  executeReasoningFlow,
  validateModelSelection,
  formatDuration,
} from '@/lib/reasoningFlow';
import { ModelResponse as ModelResponseType } from '@/lib/modelAbstraction';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [selectedReasoningModels, setSelectedReasoningModels] = useState<
    string[]
  >(['llama-3.2-1b', 'phi-3.5-mini']);
  const [selectedSummarizerModel, setSelectedSummarizerModel] = useState(
    'llama-3.1-8b'
  );
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<ModelResponseType[]>([]);
  const [summary, setSummary] = useState<ModelResponseType | null>(null);
  const [parallelMode, setParallelMode] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedParallel = localStorage.getItem('parallel_mode');
    if (savedParallel !== null) {
      setParallelMode(JSON.parse(savedParallel));
    }
    setHasApiKey(hasOpenRouterKey());
  }, []);

  const availableModels = getAvailableModels();
  const reasoningModels = getReasoningModels().filter((m) =>
    availableModels.some((am) => am.id === m.id)
  );
  const summarizerModels = getSummarizerModels().filter((m) =>
    availableModels.some((am) => am.id === m.id)
  );

  const handleRunModels = async () => {
    // Validate selection
    const validation = validateModelSelection(
      selectedReasoningModels,
      selectedSummarizerModel,
      availableModels.map((m) => m.id)
    );

    if (!validation.valid) {
      validation.errors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    setLoading(true);
    setResponses([]);
    setSummary(null);

    try {
      const result = await executeReasoningFlow(
        prompt,
        selectedReasoningModels,
        selectedSummarizerModel,
        parallelMode,
        (update) => {
          console.log(update);
        }
      );

      setResponses(result.responses);
      setSummary(result.summary);

      toast.success(
        `Completed in ${formatDuration(result.totalDuration)}!`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = responses.length > 0 || summary;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Multi-Model Reasoning</h1>
              <p className="text-sm text-muted-foreground">
                Send prompts to multiple models in parallel, then synthesize
                results
              </p>
            </div>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <SettingsPanel onClose={() => setSettingsOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Sidebar - Input & Configuration */}
          <div className="space-y-4 lg:col-span-1">
            {/* Warning for API models without key */}
            {!hasApiKey && (
              <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">API models not available</p>
                  <p className="text-xs">
                    Add OpenRouter API key in settings to use remote models
                  </p>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <h2 className="mb-3 text-sm font-semibold">Your Prompt</h2>
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleRunModels}
                disabled={loading}
                loading={loading}
              />
            </div>

            {/* Model Selection */}
            <div>
              <h2 className="mb-3 text-sm font-semibold">Models</h2>
              <ModelSelector
                reasoningModels={reasoningModels}
                summarizerModels={summarizerModels}
                selectedReasoningModels={selectedReasoningModels}
                selectedSummarizerModel={selectedSummarizerModel}
                onReasoningModelsChange={setSelectedReasoningModels}
                onSummarizerModelChange={setSelectedSummarizerModel}
                disabled={loading}
              />
            </div>
          </div>

          {/* Right Content - Results */}
          <div className="space-y-4 lg:col-span-2">
            {!hasResults ? (
              <div className="flex h-96 items-center justify-center rounded-lg border border-dashed bg-muted/50">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Enter a prompt and click "Run All Models" to see results
                  </p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="responses" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="responses">
                    Responses ({responses.length})
                  </TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="responses" className="space-y-3">
                  {responses.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        No responses yet
                      </p>
                    </div>
                  ) : (
                    responses.map((response) => (
                      <ModelResponse
                        key={response.modelId}
                        response={response}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="summary">
                  {summary ? (
                    <SummaryPanel summary={summary} />
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Summary will appear here
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-4 text-center text-xs text-muted-foreground">
        <p>
          Multi-Model Reasoning App • Browser-local and API-based model
          inference
        </p>
      </footer>
    </div>
  );
}
