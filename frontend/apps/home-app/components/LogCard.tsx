'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

export interface LogEntry {
  id: string;
  timestamp: string;
  level?: string | null;
  message?: string | null;
  messageTemplate?: string | null;
  renderedMessage?: string | null;
  exception?: string | null;
  service?: string | null;
  correlationId?: string | null;
  userId?: string | null;
  properties?: Record<string, unknown> | null;
  additionalData?: Record<string, unknown> | null;
}

interface LogCardProps {
  log: LogEntry;
}

export function LogCard({ log }: LogCardProps) {
  const level = log.level ?? 'Unknown';

  const message =
    log.renderedMessage ||
    log.message ||
    log.messageTemplate ||
    'No message';

  const sourceContext: any =
    log.properties?.SourceContext ||
    log.properties?.sourceContext;

  const endpoint =
    log.properties?.Endpoint ||
    log.properties?.endpoint;

  const consumerType =
    log.properties?.ConsumerType ||
    log.properties?.consumerType;

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-sm font-semibold">
            {level}
          </CardTitle>

          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {new Date(log.timestamp).toLocaleString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <p className="wrap-break-word">{message}</p>

        <div className="grid gap-1 text-xs text-muted-foreground">
          {log.service && (
            <span>
              <strong>Service:</strong> {log.service}
            </span>
          )}

          {sourceContext && (
            <span>
              <strong>Source:</strong> {String(sourceContext)}
            </span>
          )}

          {endpoint && (
            <span>
              <strong>Endpoint:</strong> {String(endpoint)}
            </span>
          )}

          {consumerType && (
            <span>
              <strong>Consumer:</strong> {String(consumerType)}
            </span>
          )}

          {log.correlationId && (
            <span>
              <strong>CorrelationId:</strong> {log.correlationId}
            </span>
          )}

          {log.userId && (
            <span>
              <strong>UserId:</strong> {log.userId}
            </span>
          )}
        </div>

        {log.exception && (
          <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-red-50 p-3 text-xs text-red-700">
            {log.exception}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}