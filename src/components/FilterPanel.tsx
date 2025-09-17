import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, RotateCcw } from "lucide-react";

interface FilterOptions {
  cursos: string[];
  turmas: string[];
  statusInscricao: string[];
  tiposCertificado: string[];
}

interface Filters {
  curso: string;
  turma: string;
  statusInscricao: string;
  tipoCertificado: string;
  dataInicio: {
    start: Date | null;
    end: Date | null;
  };
}

interface FilterPanelProps {
  filters: Filters;
  filterOptions: FilterOptions;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

export function FilterPanel({ 
  filters, 
  filterOptions, 
  onFiltersChange, 
  onClearFilters 
}: FilterPanelProps) {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : null;
    updateFilter('dataInicio', {
      ...filters.dataInicio,
      [type]: date
    });
  };

  const hasActiveFilters = 
    filters.curso !== 'all' ||
    filters.turma !== 'all' ||
    filters.statusInscricao !== 'all' ||
    filters.tipoCertificado !== 'all' ||
    filters.dataInicio.start ||
    filters.dataInicio.end;

  return (
    <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-8 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="curso" className="text-sm font-medium text-foreground">
              Curso
            </Label>
            <Select value={filters.curso} onValueChange={(value) => updateFilter('curso', value)}>
              <SelectTrigger id="curso">
                <SelectValue placeholder="Todos os cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {filterOptions.cursos.map(curso => (
                  <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="turma" className="text-sm font-medium text-foreground">
              Turma
            </Label>
            <Select value={filters.turma} onValueChange={(value) => updateFilter('turma', value)}>
              <SelectTrigger id="turma">
                <SelectValue placeholder="Todas as turmas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {filterOptions.turmas.map(turma => (
                  <SelectItem key={turma} value={turma}>{turma}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-foreground">
              Status
            </Label>
            <Select value={filters.statusInscricao} onValueChange={(value) => updateFilter('statusInscricao', value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {filterOptions.statusInscricao.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificado" className="text-sm font-medium text-foreground">
              Certificado
            </Label>
            <Select value={filters.tipoCertificado} onValueChange={(value) => updateFilter('tipoCertificado', value)}>
              <SelectTrigger id="certificado">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {filterOptions.tiposCertificado.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Período de Início
            </Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={formatDateForInput(filters.dataInicio.start)}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="text-xs"
                placeholder="Início"
              />
              <Input
                type="date"
                value={formatDateForInput(filters.dataInicio.end)}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="text-xs"
                placeholder="Fim"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}