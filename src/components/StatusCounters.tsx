import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface StatusMetric {
  counts: {
    ok: number;
    error: number;
    na: number;
  };
  percentages: {
    ok: number;
    error: number;
    na: number;
  };
}

interface StatusCountersProps {
  metrics: {
    financeiro: StatusMetric;
    avaliacao: StatusMetric;
    tempoMinimo: StatusMetric;
    documentos: StatusMetric;
  };
}

export function StatusCounters({ metrics }: StatusCountersProps) {
  const counters = [
    {
      title: "Situação Financeira",
      data: metrics.financeiro,
      key: "financeiro"
    },
    {
      title: "Avaliação",
      data: metrics.avaliacao,
      key: "avaliacao"
    },
    {
      title: "Tempo Mínimo",
      data: metrics.tempoMinimo,
      key: "tempoMinimo"
    },
    {
      title: "Documentos",
      data: metrics.documentos,
      key: "documentos"
    }
  ];

  const StatusIndicator = ({ type, count, percentage }: { 
    type: 'ok' | 'error' | 'na'; 
    count: number; 
    percentage: number; 
  }) => {
    const getIcon = () => {
      switch (type) {
        case 'ok':
          return <CheckCircle className="h-4 w-4 text-status-ok" />;
        case 'error':
          return <XCircle className="h-4 w-4 text-status-error" />;
        case 'na':
          return <AlertCircle className="h-4 w-4 text-status-na" />;
      }
    };

    const getLabel = () => {
      switch (type) {
        case 'ok':
          return 'OK';
        case 'error':
          return 'Pendente';
        case 'na':
          return 'N/A';
      }
    };

    const getBgColor = () => {
      switch (type) {
        case 'ok':
          return 'bg-status-ok/10 border-status-ok/20';
        case 'error':
          return 'bg-status-error/10 border-status-error/20';
        case 'na':
          return 'bg-status-na/10 border-status-na/20';
      }
    };

    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${getBgColor()}`}>
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-medium text-foreground">{getLabel()}</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">{count}</div>
          <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {counters.map((counter) => (
        <Card key={counter.key} className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              {counter.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusIndicator
              type="ok"
              count={counter.data.counts.ok}
              percentage={counter.data.percentages.ok}
            />
            <StatusIndicator
              type="error"
              count={counter.data.counts.error}
              percentage={counter.data.percentages.error}
            />
            <StatusIndicator
              type="na"
              count={counter.data.counts.na}
              percentage={counter.data.percentages.na}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}