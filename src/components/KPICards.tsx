import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, FileCheck, Award, DollarSign } from "lucide-react";

interface KPI {
  totalStudents: number;
  percentEmDia: number;
  percentInadimplentes: number;
  avgDisciplineProgress: number;
  percentDocsOK: number;
  totalCertRequests30d: number;
}

interface KPICardsProps {
  kpis: KPI;
}

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      title: "Total de Alunos",
      value: kpis.totalStudents.toLocaleString(),
      icon: Users,
      variant: "primary" as const
    },
    {
      title: "% Em Dia",
      value: `${kpis.percentEmDia.toFixed(1)}%`,
      icon: DollarSign,
      variant: "success" as const
    },
    {
      title: "Progresso Médio",
      value: `${kpis.avgDisciplineProgress.toFixed(1)}%`,
      icon: TrendingUp,
      variant: "primary" as const
    },
    {
      title: "Docs Completos",
      value: `${kpis.percentDocsOK.toFixed(1)}%`,
      icon: FileCheck,
      variant: "warning" as const
    },
    {
      title: "Certificados (30d)",
      value: kpis.totalCertRequests30d.toString(),
      icon: Award,
      variant: "accent" as const
    }
  ];

  const getCardStyles = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'border-success/20 bg-gradient-to-br from-success/5 to-success/10';
      case 'warning':
        return 'border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10';
      case 'accent':
        return 'border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10';
      default:
        return 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10';
    }
  };

  const getIconStyles = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'accent':
        return 'text-accent';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index} 
            className={`transition-all duration-200 hover:shadow-lg ${getCardStyles(card.variant)}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${getIconStyles(card.variant)}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}