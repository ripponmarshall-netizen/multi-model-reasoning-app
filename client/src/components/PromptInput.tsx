import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
}: PromptInputProps) {
  const characterCount = value.length;
  const maxCharacters = 5000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="prompt" className="text-sm font-medium">
          Your Prompt
        </label>
        <span
          className={`text-xs ${
            isOverLimit ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {characterCount} / {maxCharacters}
        </span>
      </div>

      <Textarea
        id="prompt"
        placeholder="Enter your prompt here. It will be sent to all selected models..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className="min-h-32 resize-none"
        maxLength={maxCharacters}
      />

      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={disabled || loading || !value.trim() || isOverLimit}
          className="flex-1"
        >
          {loading ? 'Running Models...' : 'Run All Models'}
        </Button>

        <Button
          onClick={() => onChange('')}
          variant="outline"
          size="icon"
          disabled={disabled || loading || !value}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
