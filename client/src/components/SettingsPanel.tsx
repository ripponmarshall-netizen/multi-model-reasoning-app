import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';

interface SettingsPanelProps {
  onClose?: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [parallelMode, setParallelMode] = useState(true);

  useEffect(() => {
    // Load API key from localStorage
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
      setHasApiKey(true);
      setApiKey(savedKey);
    }

    // Load parallel mode preference
    const savedParallel = localStorage.getItem('parallel_mode');
    if (savedParallel !== null) {
      setParallelMode(JSON.parse(savedParallel));
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openrouter_api_key', apiKey);
      setHasApiKey(true);
      // Show success toast
      alert('API key saved successfully!');
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('openrouter_api_key');
    setApiKey('');
    setHasApiKey(false);
    alert('API key cleared');
  };

  const handleParallelModeChange = (enabled: boolean) => {
    setParallelMode(enabled);
    localStorage.setItem('parallel_mode', JSON.stringify(enabled));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure API keys and preferences
        </p>
      </div>

      {/* OpenRouter API Key Section */}
      <Card className="space-y-4 p-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="font-semibold">OpenRouter API Key</Label>
            {hasApiKey && <Badge variant="outline">Configured</Badge>}
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Optional. Add your OpenRouter API key to use remote models.{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Get API Key
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>

        <div className="relative">
          <Input
            type={showApiKey ? 'text' : 'password'}
            placeholder="sk-or-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pr-10"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showApiKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSaveApiKey}
            disabled={!apiKey.trim()}
            className="flex-1"
          >
            Save API Key
          </Button>
          {hasApiKey && (
            <Button
              onClick={handleClearApiKey}
              variant="outline"
              size="icon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
          <p>
            <strong>Privacy:</strong> Your API key is stored only in your
            browser's localStorage and never sent to our servers.
          </p>
        </div>
      </Card>

      {/* Execution Mode Section */}
      <Card className="space-y-4 p-4">
        <div>
          <Label className="font-semibold">Execution Mode</Label>
          <p className="text-xs text-muted-foreground">
            How to run selected models
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Run models in parallel</p>
            <p className="text-xs text-muted-foreground">
              Faster, but uses more resources
            </p>
          </div>
          <Switch
            checked={parallelMode}
            onCheckedChange={handleParallelModeChange}
          />
        </div>
      </Card>

      {/* Browser Models Info */}
      <Card className="space-y-3 p-4">
        <div>
          <h3 className="font-semibold">Browser Models (WebLLM)</h3>
          <p className="text-xs text-muted-foreground">
            Run directly in your browser, no API key needed
          </p>
        </div>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>First load:</strong> Models are downloaded and cached
              (30-60 seconds)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Subsequent loads:</strong> Instant from browser cache
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Privacy:</strong> All processing happens locally, no data
              sent to servers
            </span>
          </li>
        </ul>
      </Card>

      {/* API Models Info */}
      <Card className="space-y-3 p-4">
        <div>
          <h3 className="font-semibold">API Models (OpenRouter)</h3>
          <p className="text-xs text-muted-foreground">
            Requires OpenRouter API key
          </p>
        </div>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>More models:</strong> Access to 400+ models from various
              providers
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Better reasoning:</strong> Larger models with advanced
              capabilities
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Cost:</strong> Pay-as-you-go pricing (free tier available)
            </span>
          </li>
        </ul>
      </Card>

      {onClose && (
        <Button onClick={onClose} variant="outline" className="w-full">
          Close Settings
        </Button>
      )}
    </div>
  );
}
