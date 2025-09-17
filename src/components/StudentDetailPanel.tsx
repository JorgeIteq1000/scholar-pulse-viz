import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertCircle, Calendar, User, GraduationCap, FileText, Award } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getFinancialSituation } from "@/lib/dataProcessor";

interface Student {
  Nome: string;
  CPF: string;
  Curso: string;
  Turma: string;
  'Status Inscrição': string;
  'Data Início': string;
  Data_Inicio_Parsed: Date | null;
  
  // Status fields
  Financeiro_Normalized: number | string;
  Avaliacao_Normalized: number | string;
  Tempo_Minimo_Normalized: number | string;
  Documentos_Normalized: number | string;
  
  // Progress
  Disciplinas_Percentual: number | string;
  Cobrancas_Percentual: number | string;
  
  // Certificates
  'Data Solic. Digital': string;
  'Tipo Cert. Digital': string;
  'Status Cert. Digital': string;
  Data_Solic_Digital_Parsed: Date | null;
  
  'Data Solic. Impresso': string;
  'Tipo Cert. Impresso': string;
  'Status Cert. Impresso': string;
  Data_Solic_Impresso_Parsed: Date | null;
  
  [key: string]: any;
}

interface StudentDetailPanelProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentDetailPanel({ student, isOpen, onClose }: StudentDetailPanelProps) {
  if (!student) return null;

  const StatusIcon = ({ status }: { status: number | string }) => {
    if (status === 1) return <CheckCircle className="h-4 w-4 text-status-ok" />;
    if (status === 0) return <XCircle className="h-4 w-4 text-status-error" />;
    return <AlertCircle className="h-4 w-4 text-status-na" />;
  };

  const getStatusLabel = (status: number | string) => {
    if (status === 1) return 'OK';
    if (status === 0) return 'Pendente';
    return 'N/A';
  };

  const formatDate = (date: Date | null, fallback: string = 'N/A') => {
    if (!date) return fallback;
    try {
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return fallback;
    }
  };

  const getProgressValue = (value: number | string) => {
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  const statusItems = [
    { label: 'Financeiro', value: student.Financeiro_Normalized },
    { label: 'Avaliação', value: student.Avaliacao_Normalized },
    { label: 'Tempo Mínimo', value: student.Tempo_Minimo_Normalized },
    { label: 'Documentos', value: student.Documentos_Normalized },
  ];

  const disciplineProgress = getProgressValue(student.Disciplinas_Percentual);
  const paymentProgress = getProgressValue(student.Cobrancas_Percentual);
  const financialSituation = getFinancialSituation(student.Cobrancas_Percentual);

  return (
    <Sheet open={isOpen} onOpenChange={() => onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Estudante
          </SheetTitle>
          <SheetDescription>
            Informações completas e atualizadas
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                <p className="font-medium">{student.Nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">CPF</label>
                <p className="font-mono">{student.CPF}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Curso</label>
                  <p className="font-medium">{student.Curso}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Turma</label>
                  <p className="font-medium">{student.Turma}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className="mt-1">{student['Status Inscrição']}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Início</label>
                  <p className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(student.Data_Inicio_Parsed, student['Data Início'])}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Pillars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-4 w-4" />
                Status dos Pilares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {statusItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={item.value} />
                      <span className="text-sm font-medium">{getStatusLabel(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4" />
                Progresso Acadêmico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Disciplinas</label>
                  <span className="text-sm font-bold">{disciplineProgress.toFixed(1)}%</span>
                </div>
                <Progress value={disciplineProgress} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Pagamentos</label>
                  <span className="text-sm font-bold">{paymentProgress.toFixed(1)}%</span>
                </div>
                <Progress value={paymentProgress} className="h-2" />
                <div className="mt-1">
                  <Badge variant={financialSituation === 'Em dia' ? 'default' : 'destructive'}>
                    {financialSituation}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4" />
                Certificados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Digital Certificate */}
              <div className="p-4 rounded-lg border bg-card/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Certificado Digital
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Tipo</label>
                    <p className="font-medium">{student['Tipo Cert. Digital']}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Status</label>
                    <Badge variant="outline">{student['Status Cert. Digital']}</Badge>
                  </div>
                  <div className="col-span-2">
                    <label className="text-muted-foreground">Data Solicitação</label>
                    <p className="font-medium">
                      {formatDate(student.Data_Solic_Digital_Parsed, student['Data Solic. Digital'])}
                    </p>
                  </div>
                </div>
              </div>

              {/* Printed Certificate */}
              <div className="p-4 rounded-lg border bg-card/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Certificado Impresso
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Tipo</label>
                    <p className="font-medium">{student['Tipo Cert. Impresso']}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Status</label>
                    <Badge variant="outline">{student['Status Cert. Impresso']}</Badge>
                  </div>
                  <div className="col-span-2">
                    <label className="text-muted-foreground">Data Solicitação</label>
                    <p className="font-medium">
                      {formatDate(student.Data_Solic_Impresso_Parsed, student['Data Solic. Impresso'])}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}