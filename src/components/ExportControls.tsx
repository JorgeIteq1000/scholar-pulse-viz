import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, FileSpreadsheet, RefreshCw } from "lucide-react";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportControlsProps {
  data: any[];
  kpis: any;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdate: Date | null;
}

export function ExportControls({ 
  data, 
  kpis, 
  onRefresh, 
  isLoading, 
  lastUpdate 
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(data, kpis, 'Relatório Dashboard Estudantes');
      toast({
        title: "PDF exportado com sucesso!",
        description: "O arquivo foi baixado para sua pasta de downloads.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro durante a exportação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(data, kpis, 'dashboard_estudantes');
      toast({
        title: "Excel exportado com sucesso!",
        description: "O arquivo foi baixado para sua pasta de downloads.",
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: "Erro ao exportar Excel",
        description: "Ocorreu um erro durante a exportação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes === 1) return 'Há 1 minuto';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return 'Há 1 hora';
    if (diffInHours < 24) return `Há ${diffInHours} horas`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5" />
          Controles e Exportação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              Última atualização: <span className="font-medium text-foreground">{formatLastUpdate(lastUpdate)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Total de registros: <span className="font-medium text-foreground">{data.length}</span>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Atualizando...' : 'Atualizar Dados'}
            </Button>
            
            <Button
              onClick={handleExportPDF}
              disabled={isExporting || data.length === 0}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Exportar PDF
            </Button>
            
            <Button
              onClick={handleExportExcel}
              disabled={isExporting || data.length === 0}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}