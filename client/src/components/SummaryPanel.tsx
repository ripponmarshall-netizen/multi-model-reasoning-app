import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModelResponse } from '@/lib/modelAbstraction';
import { AlertCircle, CheckCircle2, Clock, Loader2, Sparkles } from 'lucide-react';

interface SummaryPanelProps {
  summary: ModelResponse;
}

export default function SummaryPanel({ summary }: SummaryPanelProps) {
  const getStatusIcon = () => {
    switch (summary.status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (summary.status) {
      case 'pending':
        return 'secondary';
      case 'complete':
        return 'default';
      case 'error':
        return 'destructive';
    }
  };

  return (
    <Card className="border-2 border-accent bg-gradient-to-br from-accent/5 to-accent/10 overflow-hidden">
      <div className="border-b bg-accent/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="font-semibold">Summary by {summary.modelName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant() as any}>
              {summary.status}
            </Badge>
            {summary.duration > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {(summary.duration / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {summary.status === 'error' ? (
          <div className="text-sm text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="font-medium">Error generating summary:</p>
            </div>
            <p className="mt-2">{summary.error}</p>
          </div>
        ) : summary.status === 'pending' ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating summary...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {summary.output}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
