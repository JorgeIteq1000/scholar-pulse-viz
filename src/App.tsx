import { useState, useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  fetchData, 
  normalizeData, 
  calculateKPIs, 
  calculateStatusMetrics,
  applyFilters,
  getFilterOptions 
} from "@/lib/dataProcessor";
import { KPICards } from "@/components/KPICards";
import { StatusCounters } from "@/components/StatusCounters";
import { FilterPanel } from "@/components/FilterPanel";
import { StudentTable } from "@/components/StudentTable";
import { StudentDetailPanel } from "@/components/StudentDetailPanel";
import { ExportControls } from "@/components/ExportControls";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

// Initial filter state
const initialFilters = {
  curso: 'all',
  turma: 'all',
  statusInscricao: 'all',
  tipoCertificado: 'all',
  dataInicio: {
    start: null,
    end: null
  }
};

function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const { toast } = useToast();

  // Load data function
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData();
      const normalized = normalizeData(data);
      
      setRawData(data);
      setNormalizedData(normalized);
      setLastUpdate(new Date());
      
      toast({
        title: "Dados atualizados com sucesso!",
        description: `${data.length} registros carregados.`,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, []);

  // Apply filters to data
  const filteredData = useMemo(() => {
    return applyFilters(normalizedData, filters);
  }, [normalizedData, filters]);

  // Calculate metrics for filtered data
  const kpis = useMemo(() => {
    return calculateKPIs(filteredData);
  }, [filteredData]);

  const statusMetrics = useMemo(() => {
    return {
      financeiro: calculateStatusMetrics(filteredData, 'Financeiro'),
      avaliacao: calculateStatusMetrics(filteredData, 'Avaliacao'),
      tempoMinimo: calculateStatusMetrics(filteredData, 'Tempo_Minimo'),
      documentos: calculateStatusMetrics(filteredData, 'Documentos'),
    };
  }, [filteredData]);

  // Get filter options from all data (not filtered)
  const filterOptions = useMemo(() => {
    return getFilterOptions(normalizedData);
  }, [normalizedData]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  // Handle student selection
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedStudent(null);
  };

  if (isLoading && normalizedData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
        <div className="h-40 bg-muted rounded-lg mb-8"></div>
        <div className="h-96 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard de Estudantes
          </h1>
          <p className="text-muted-foreground">
            Análise completa e métricas em tempo real dos dados acadêmicos
          </p>
        </div>

        {/* Export Controls */}
        <div className="mb-6">
          <ExportControls
            data={filteredData}
            kpis={kpis}
            onRefresh={loadData}
            isLoading={isLoading}
            lastUpdate={lastUpdate}
          />
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* KPI Cards */}
        <KPICards kpis={kpis} />

        {/* Status Counters */}
        <StatusCounters metrics={statusMetrics} />

        {/* Student Table */}
        <div className="mb-6">
          <StudentTable
            students={filteredData}
            onViewStudent={handleViewStudent}
          />
        </div>

        {/* Student Detail Panel */}
        <StudentDetailPanel
          student={selectedStudent}
          isOpen={isDetailPanelOpen}
          onClose={handleCloseDetailPanel}
        />
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Dashboard />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
