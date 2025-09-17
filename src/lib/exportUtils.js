import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Export data to PDF
export function exportToPDF(data, kpis, title = 'Relatório de Estudantes') {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;
  
  // Header
  doc.setFontSize(18);
  doc.text(title, 20, yPosition);
  yPosition += 15;
  
  // Date
  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, yPosition);
  yPosition += 20;
  
  // KPIs Section
  doc.setFontSize(14);
  doc.text('Indicadores Principais (KPIs)', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  const kpiText = [
    `Total de Estudantes: ${kpis.totalStudents}`,
    `% Em Dia: ${kpis.percentEmDia.toFixed(1)}%`,
    `Progresso Médio: ${kpis.avgDisciplineProgress.toFixed(1)}%`,
    `Docs Completos: ${kpis.percentDocsOK.toFixed(1)}%`,
    `Certificados (30d): ${kpis.totalCertRequests30d}`
  ];
  
  kpiText.forEach(text => {
    doc.text(text, 20, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Students Table Header
  if (data.length > 0) {
    doc.setFontSize(14);
    doc.text('Lista de Estudantes', 20, yPosition);
    yPosition += 10;
    
    // Table headers
    doc.setFontSize(8);
    doc.text('Nome', 20, yPosition);
    doc.text('CPF', 80, yPosition);
    doc.text('Curso', 120, yPosition);
    doc.text('Status', 160, yPosition);
    yPosition += 8;
    
    // Line under headers
    doc.line(20, yPosition - 2, 190, yPosition - 2);
    
    // Students data
    data.slice(0, 50).forEach(student => { // Limit to 50 students for PDF
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(student.Nome?.substring(0, 25) || '', 20, yPosition);
      doc.text(student.CPF || '', 80, yPosition);
      doc.text(student.Curso?.substring(0, 15) || '', 120, yPosition);
      doc.text(student['Status Inscrição']?.substring(0, 12) || '', 160, yPosition);
      yPosition += 6;
    });
    
    if (data.length > 50) {
      yPosition += 5;
      doc.text(`... e mais ${data.length - 50} estudantes`, 20, yPosition);
    }
  }
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
}

// Export data to Excel
export function exportToExcel(data, kpis, filename = 'relatorio_estudantes') {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // KPIs Sheet
  const kpisData = [
    ['Indicador', 'Valor'],
    ['Total de Estudantes', kpis.totalStudents],
    ['% Em Dia', `${kpis.percentEmDia.toFixed(1)}%`],
    ['% Inadimplentes', `${kpis.percentInadimplentes.toFixed(1)}%`],
    ['Progresso Médio Disciplinas', `${kpis.avgDisciplineProgress.toFixed(1)}%`],
    ['% Documentos OK', `${kpis.percentDocsOK.toFixed(1)}%`],
    ['Certificados Solicitados (7d)', kpis.totalCertRequests7d],
    ['Certificados Solicitados (30d)', kpis.totalCertRequests30d],
    ['Certificados Solicitados (90d)', kpis.totalCertRequests90d],
    [''],
    ['Relatório gerado em:', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })]
  ];
  
  const kpisWs = XLSX.utils.aoa_to_sheet(kpisData);
  XLSX.utils.book_append_sheet(wb, kpisWs, 'KPIs');
  
  // Students Sheet
  if (data.length > 0) {
    // Prepare students data for export
    const studentsData = data.map(student => ({
      'Nome': student.Nome,
      'CPF': student.CPF,
      'Curso': student.Curso,
      'Turma': student.Turma,
      'Status Inscrição': student['Status Inscrição'],
      'Data Início': student['Data Início'],
      'Financeiro': student.Financeiro,
      'Avaliação': student.Avaliação,
      'Tempo Mínimo': student['Tempo mínimo'],
      'Documentos': student.Documentos,
      'Disciplinas': student.Disciplinas,
      'Cobranças': student.Cobranças,
      'Progresso Disciplinas (%)': typeof student.Disciplinas_Percentual === 'number' 
        ? student.Disciplinas_Percentual.toFixed(1) : 'N/A',
      'Progresso Pagamentos (%)': typeof student.Cobrancas_Percentual === 'number' 
        ? student.Cobrancas_Percentual.toFixed(1) : 'N/A',
      'Certificado Digital - Tipo': student['Tipo Cert. Digital'],
      'Certificado Digital - Status': student['Status Cert. Digital'],
      'Certificado Digital - Data Solicitação': student['Data Solic. Digital'],
      'Certificado Impresso - Tipo': student['Tipo Cert. Impresso'],
      'Certificado Impresso - Status': student['Status Cert. Impresso'],
      'Certificado Impresso - Data Solicitação': student['Data Solic. Impresso']
    }));
    
    const studentsWs = XLSX.utils.json_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(wb, studentsWs, 'Estudantes');
  }
  
  // Save the Excel file
  const timestamp = format(new Date(), 'yyyyMMdd_HHmm');
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
}

// Generate summary report data
export function generateSummaryReport(data, kpis) {
  const summary = {
    timestamp: new Date(),
    totalStudents: data.length,
    kpis,
    statusSummary: {
      formado: data.filter(s => s['Status Inscrição'] === 'Formado').length,
      cursando: data.filter(s => s['Status Inscrição'] === 'Cursando').length,
      cancelada: data.filter(s => s['Status Inscrição'] === 'Cancelada').length,
      bloqueada: data.filter(s => s['Status Inscrição'] === 'Bloqueada').length,
      outros: data.filter(s => !['Formado', 'Cursando', 'Cancelada', 'Bloqueada'].includes(s['Status Inscrição'])).length
    },
    courseDistribution: {},
    turmaDistribution: {}
  };
  
  // Course distribution
  data.forEach(student => {
    const course = student.Curso;
    if (course) {
      summary.courseDistribution[course] = (summary.courseDistribution[course] || 0) + 1;
    }
  });
  
  // Turma distribution
  data.forEach(student => {
    const turma = student.Turma;
    if (turma) {
      summary.turmaDistribution[turma] = (summary.turmaDistribution[turma] || 0) + 1;
    }
  });
  
  return summary;
}