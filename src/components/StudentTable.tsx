import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { getFinancialSituation } from "@/lib/dataProcessor";

interface Student {
  Nome: string;
  CPF: string;
  Curso: string;
  'Status Inscrição': string;
  Turma: string;
  Cobrancas_Percentual: number | string;
  [key: string]: any;
}

interface StudentTableProps {
  students: Student[];
  onViewStudent: (student: Student) => void;
}

const ITEMS_PER_PAGE = 10;

export function StudentTable({ students, onViewStudent }: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    
    const search = searchTerm.toLowerCase();
    return students.filter(student => 
      student.Nome?.toLowerCase().includes(search) ||
      student.CPF?.toLowerCase().includes(search)
    );
  }, [students, searchTerm]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'formado':
        return 'default';
      case 'cursando':
        return 'secondary';
      case 'cancelada':
      case 'bloqueada':
        return 'destructive';
      case 'aguardando taxa de inscrição':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getFinancialBadgeVariant = (situation: string) => {
    switch (situation) {
      case 'Em dia':
        return 'default';
      case 'Atraso leve':
        return 'secondary';
      case 'Atraso médio':
        return 'outline';
      case 'Inadimplente grave':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset to first page when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            Estudantes ({filteredStudents.length})
          </CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Situação Financeira</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student, index) => {
                const financialSituation = getFinancialSituation(student.Cobrancas_Percentual);
                
                return (
                  <TableRow key={`${student.CPF}-${index}`} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {student.Nome}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {student.CPF}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.Curso}</div>
                        <div className="text-xs text-muted-foreground">{student.Turma}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(student['Status Inscrição'])}>
                        {student['Status Inscrição']}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getFinancialBadgeVariant(financialSituation)}>
                        {financialSituation}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewStudent(student)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredStudents.length)} de {filteredStudents.length} estudantes
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}