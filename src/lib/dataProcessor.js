import { format, parseISO, isValid, subDays, differenceInCalendarMonths } from 'date-fns';
import Papa from 'papaparse';

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ25AYPgZEudDjhakxxgPNt4IjVlrKWmXzrjgcp7M95YPV23Iib4C7bQ8VAXi_AE49cIfg59Ie9z42X/pub?gid=0&single=true&output=csv';

// Parse CSV data to JSON using the robust PapaParse library
function parseCSV(csvText) {
  console.log("LOG: Iniciando o parser de CSV com a biblioteca Papa Parse (versão corrigida).");
  
  const results = Papa.parse(csvText, {
    header: true,        // Trata a primeira linha como cabeçalho
    skipEmptyLines: true,  // Pula linhas vazias
    dynamicTyping: false   // GARANTE que todos os dados sejam lidos como texto (string)
  });

  if (results.errors.length > 0) {
    console.error("LOG: Erros encontrados durante o parse do CSV:", results.errors);
  }

  console.log(`LOG: Processados ${results.data.length} registros válidos com Papa Parse.`);
  return results.data;
}

// Fetch data from Google Sheets or fallback to local JSON
export async function fetchData() {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${GOOGLE_SHEETS_URL}&t=${timestamp}`, {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (response.ok) {
      const csvData = await response.text();
      const jsonData = parseCSV(csvData);
      if (jsonData.length > 0) {
        console.log(`Loaded ${jsonData.length} records from Google Sheets`);
        return jsonData;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch from Google Sheets:', error);
  }
  
  try {
    const response = await fetch('/data.json');
    const data = await response.json();
    console.log(`Loaded ${data.length} records from local fallback`);
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    return [];
  }
}

// Parse date with multiple formats
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'Não Solicitado' || dateStr === 'Não encontrado') {
    return null;
  }
  
  const ddmmyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const date = new Date(ddmmyyyy[3], ddmmyyyy[2] - 1, ddmmyyyy[1]);
    return isValid(date) ? date : null;
  }
  
  const date = parseISO(dateStr);
  return isValid(date) ? date : null;
}

// Convert status to numeric (OK=1, X=0, other=NA)
function normalizeStatus(status) {
  if (!status) return 'NA';
  const normalized = status.toLowerCase().trim();
  if (normalized === 'ok') return 1;
  if (normalized === 'x') return 0;
  return 'NA';
}

// Parse fraction format (X/Y) to percentage
function parsePercentage(fraction) {
  if (!fraction || typeof fraction !== 'string') return 'NA';
  
  const match = fraction.match(/^(\d+)\/(\d+)$/);
  if (!match) return 'NA';
  
  const numerator = parseInt(match[1]);
  const denominator = parseInt(match[2]);
  
  if (denominator === 0) return 0; // Se o total for 0, o progresso é 0%
  return (numerator / denominator) * 100;
}

// Normalize raw data
export function normalizeData(rawData) {
  return rawData.map(row => {
    const normalized = { ...row };
    
    normalized.Data_Inicio_Parsed = parseDate(row['Data Início']);
    normalized.Data_Solic_Digital_Parsed = parseDate(row['Data Solic. Digital']);
    normalized.Data_Solic_Impresso_Parsed = parseDate(row['Data Solic. Impresso']);
    
    normalized.Financeiro_Normalized = normalizeStatus(row.Financeiro);
    normalized.Avaliacao_Normalized = normalizeStatus(row.Avaliação);
    normalized.Tempo_Minimo_Normalized = normalizeStatus(row['Tempo mínimo']);
    normalized.Documentos_Normalized = normalizeStatus(row.Documentos);
    
    normalized.Disciplinas_Percentual = parsePercentage(row.Disciplinas);
    normalized.Cobrancas_Percentual = parsePercentage(row.Cobranças);
    
    return normalized;
  });
}

// Calculate metrics for status fields
export function calculateStatusMetrics(data, field) {
  const counts = { ok: 0, error: 0, na: 0 };
  const total = data.length;
  
  data.forEach(row => {
    const value = row[`${field}_Normalized`];
    if (value === 1) counts.ok++;
    else if (value === 0) counts.error++;
    else counts.na++;
  });
  
  return {
    counts,
    percentages: {
      ok: total > 0 ? (counts.ok / total) * 100 : 0,
      error: total > 0 ? (counts.error / total) * 100 : 0,
      na: total > 0 ? (counts.na / total) * 100 : 0
    }
  };
}

// Calculate discipline progress metrics
export function calculateDisciplineProgress(data) {
  const validData = data.filter(row => typeof row.Disciplinas_Percentual === 'number' && !isNaN(row.Disciplinas_Percentual));
  if (validData.length === 0) return { average: 0, byCourseTurma: {} };
  
  const average = validData.reduce((sum, row) => sum + row.Disciplinas_Percentual, 0) / validData.length;
  
  const byCourseTurma = {};
  validData.forEach(row => {
    const key = `${row.Curso} - ${row.Turma}`;
    if (!byCourseTurma[key]) {
      byCourseTurma[key] = { sum: 0, count: 0 };
    }
    byCourseTurma[key].sum += row.Disciplinas_Percentual;
    byCourseTurma[key].count++;
  });
  
  Object.keys(byCourseTurma).forEach(key => {
    byCourseTurma[key].average = byCourseTurma[key].sum / byCourseTurma[key].count;
  });
  
  return { average, byCourseTurma };
}

// Calculate financial status (delinquency)
export function calculateFinancialStatus(data) {
  const categories = {
    emDia: 0,
    inadimplente: 0,
    quitado: 0,
    na: 0
  };

  data.forEach(student => {
    const situation = getFinancialSituation(student);
    if (situation === 'Em dia') categories.emDia++;
    else if (situation === 'Inadimplente') categories.inadimplente++;
    else if (situation === 'Quitado') categories.quitado++;
    else categories.na++;
  });

  const total = data.length;
  const totalValid = categories.emDia + categories.inadimplente + categories.quitado;
  
  return {
    categories,
    percentages: {
      emDia: totalValid > 0 ? ((categories.emDia + categories.quitado) / totalValid) * 100 : 0,
      inadimplentes: totalValid > 0 ? (categories.inadimplente / totalValid) * 100 : 0
    },
    totalValid
  };
}

// Calculate certificate requests in time periods
export function calculateCertificateRequests(data) {
  const now = new Date();
  const dates = {
    7: subDays(now, 7),
    30: subDays(now, 30),
    90: subDays(now, 90)
  };
  
  const counts = { 7: 0, 30: 0, 90: 0 };
  
  data.forEach(row => {
    [row.Data_Solic_Digital_Parsed, row.Data_Solic_Impresso_Parsed].forEach(date => {
      if (date) {
        if (date >= dates[7]) counts[7]++;
        if (date >= dates[30]) counts[30]++;
        if (date >= dates[90]) counts[90]++;
      }
    });
  });
  
  return counts;
}

// Calculate main KPIs
export function calculateKPIs(data) {
  const financial = calculateFinancialStatus(data);
  const disciplineProgress = calculateDisciplineProgress(data);
  const documentMetrics = calculateStatusMetrics(data, 'Documentos');
  const certificateRequests = calculateCertificateRequests(data);
  
  return {
    totalStudents: data.length,
    percentEmDia: financial.percentages.emDia,
    percentInadimplentes: financial.percentages.inadimplentes,
    avgDisciplineProgress: disciplineProgress.average,
    percentDocsOK: documentMetrics.percentages.ok,
    totalCertRequests7d: certificateRequests[7],
    totalCertRequests30d: certificateRequests[30],
    totalCertRequests90d: certificateRequests[90]
  };
}

// Get financial situation label based on time
export function getFinancialSituation(student) {
  const { Cobranças, Data_Inicio_Parsed } = student;

  if (!Cobranças || typeof Cobranças !== 'string' || !Data_Inicio_Parsed || !isValid(Data_Inicio_Parsed)) {
    return 'N/A';
  }

  const match = Cobranças.match(/^(\d+)\/(\d+)$/);
  if (!match) {
    return 'N/A';
  }

  const paidInstallments = parseInt(match[1], 10);
  const totalInstallments = parseInt(match[2], 10);

  if (totalInstallments > 0 && paidInstallments >= totalInstallments) {
    return 'Quitado';
  }

  const today = new Date();
  const startDate = Data_Inicio_Parsed;

  if (startDate > today) {
    return 'Em dia';
  }
  
  const monthsPassed = differenceInCalendarMonths(today, startDate);
  const expectedPayments = monthsPassed;

  if (paidInstallments >= expectedPayments) {
    return 'Em dia';
  } else {
    return 'Inadimplente';
  }
}

// Apply global filters
export function applyFilters(data, filters) {
  let filtered = [...data];
  
  if (filters.curso && filters.curso !== 'all') {
    filtered = filtered.filter(row => row.Curso === filters.curso);
  }
  
  if (filters.turma && filters.turma !== 'all') {
    filtered = filtered.filter(row => row.Turma === filters.turma);
  }
  
  if (filters.statusInscricao && filters.statusInscricao !== 'all') {
    filtered = filtered.filter(row => row['Status Inscrição'] === filters.statusInscricao);
  }
  
  if (filters.tipoCertificado && filters.tipoCertificado !== 'all') {
    filtered = filtered.filter(row => {
      return row['Tipo Cert. Digital'] === filters.tipoCertificado || 
             row['Tipo Cert. Impresso'] === filters.tipoCertificado;
    });
  }
  
  if (filters.dataInicio && filters.dataInicio.start && filters.dataInicio.end) {
    filtered = filtered.filter(row => {
      if (!row.Data_Inicio_Parsed) return false;
      return row.Data_Inicio_Parsed >= filters.dataInicio.start && 
             row.Data_Inicio_Parsed <= filters.dataInicio.end;
    });
  }
  
  return filtered;
}

// Get unique values for filter options
export function getFilterOptions(data) {
  const cursos = [...new Set(data.map(row => row.Curso))].filter(Boolean).sort();
  const turmas = [...new Set(data.map(row => row.Turma))].filter(Boolean).sort();
  const statusInscricao = [...new Set(data.map(row => row['Status Inscrição']))].filter(Boolean).sort();
  const tiposCertificado = [...new Set([
    ...data.map(row => row['Tipo Cert. Digital']),
    ...data.map(row => row['Tipo Cert. Impresso'])
  ])].filter(tipo => tipo && tipo !== 'Não Solicitado').sort();
  
  return { cursos, turmas, statusInscricao, tiposCertificado };
}