import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModelResponse as ModelResponseType } from '@/lib/modelAbstraction';
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';

interface ModelResponseProps {
  response: ModelResponseType;
}

export default function ModelResponse({ response }: ModelResponseProps) {
  const getStatusIcon = () => {
    switch (response.status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (response.status) {
      case 'pending':
        return 'secondary';
      case 'complete':
        return 'default';
      case 'error':
        return 'destructive';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{response.modelName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant() as any}>
              {response.status}
            </Badge>
            {response.duration > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {(response.duration / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        {response.status === 'error' ? (
          <div className="text-sm text-destructive">
            <p className="font-medium">Error:</p>
            <p className="mt-1">{response.error}</p>
          </div>
        ) : response.status === 'pending' ? (
          <div className="text-sm text-muted-foreground">
            Loading response...
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="whitespace-pre-wrap text-foreground">
              {response.output}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
