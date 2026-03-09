import { useState } from 'react';
import { Download, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/calendar';
import { mockDentists } from '@/data/mockData';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

const DENTIST_REPORTS = [
  { id: 'resumo', label: 'Resumo geral' },
  { id: 'confirmacoes', label: 'Confirmações' },
  { id: 'espera', label: 'Lista de espera' },
  { id: 'historico', label: 'Histórico de consultas' },
  { id: 'pontuacao', label: 'Pontuação e XP' },
];

const CLINIC_REPORTS = [
  { id: 'resumo', label: 'Resumo geral' },
  { id: 'confirmacoes', label: 'Confirmações' },
  { id: 'espera', label: 'Lista de espera' },
  { id: 'historico', label: 'Histórico de consultas' },
  { id: 'pontuacao', label: 'Pontuação e XP' },
  { id: 'equipa', label: 'Estatísticas da equipa' },
  { id: 'rankings', label: 'Rankings dos dentistas' },
];

const PATIENT_REPORTS = [
  { id: 'historico', label: 'Histórico de consultas' },
  { id: 'pontuacao', label: 'Pontuação e XP' },
];

const PERIOD_OPTIONS = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mês' },
  { id: 'trimestre', label: 'Este trimestre' },
  { id: 'ano', label: 'Este ano' },
  { id: 'personalizado', label: 'Personalizado' },
];

function generateMockPDFContent(selectedLabels: string[], period: string, userRole: UserRole) {
  const now = new Date().toLocaleString('pt-PT');
  const periodLabel = PERIOD_OPTIONS.find(p => p.id === period)?.label || period;
  
  let content = `
╔══════════════════════════════════════════╗
║           SMILECHECK - RELATÓRIO          ║
╚══════════════════════════════════════════╝

Data de geração: ${now}
Período: ${periodLabel}
Tipo de conta: ${userRole === 'patient' ? 'Paciente' : userRole === 'dentist' ? 'Dentista' : 'Clínica'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

  if (selectedLabels.includes('Resumo geral')) {
    content += `
📊 RESUMO GERAL
─────────────────
Total de consultas: 47
Consultas confirmadas: 42 (89%)
Consultas canceladas: 3 (6%)
Faltas: 2 (4%)
Rating médio: 4.7/5
XP acumulado: 2.450
Pontos de recompensa: 890

`;
  }

  if (selectedLabels.includes('Confirmações')) {
    content += `
✅ CONFIRMAÇÕES
─────────────────
Pendentes: 5
Confirmadas hoje: 12
Taxa de confirmação: 89%

Nome                  | Data       | Estado
─────────────────────|────────────|──────────
João Silva           | 09/03/2026 | ✅ Confirmado
Maria Costa          | 09/03/2026 | ⏳ Pendente
Pedro Santos         | 10/03/2026 | ✅ Confirmado
Ana Ferreira         | 10/03/2026 | ❌ Cancelado

`;
  }

  if (selectedLabels.includes('Histórico de consultas')) {
    content += `
📋 HISTÓRICO DE CONSULTAS
─────────────────────────
Data       | Paciente/Dentista    | Tipo        | Estado
───────────|─────────────────────|─────────────|──────────
05/03/2026 | Dr. Alexandre Silva  | Limpeza     | ✅ Concluída
01/03/2026 | Dr. Gil Oliveira     | Ortodoncia  | ✅ Concluída
25/02/2026 | Dr. Gonçalo Costa    | Check-up    | ✅ Concluída
20/02/2026 | Dr. Alexandre Silva  | Emergência  | ✅ Concluída

`;
  }

  if (selectedLabels.includes('Pontuação e XP')) {
    content += `
🏆 PONTUAÇÃO E XP
──────────────────
XP Total: 2.450
Nível atual: 12 (Ouro)
Pontos de recompensa: 890
Streak atual: 7 dias
Melhor streak: 15 dias

Últimas atividades:
  +15 XP  | Consulta concluída (05/03)
  +10 XP  | Feedback enviado (05/03)
  +5 XP   | Login diário (04/03)
  +20 XP  | Convite aceite (01/03)

`;
  }

  if (selectedLabels.includes('Lista de espera')) {
    content += `
⏳ LISTA DE ESPERA
──────────────────
Posição | Nome              | Data entrada | Motivo
────────|──────────────────|──────────────|────────
1       | Carlos Mendes     | 07/03/2026   | Limpeza
2       | Sofia Rodrigues   | 08/03/2026   | Check-up

`;
  }

  content += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gerado automaticamente por SmileCheck
© 2026 SmileCheck. Todos os direitos reservados.
`;

  return content;
}

function generateMockExcelContent(selectedLabels: string[], period: string) {
  const periodLabel = PERIOD_OPTIONS.find(p => p.id === period)?.label || period;
  let csv = 'SmileCheck Relatório\n';
  csv += `Período: ${periodLabel}\n`;
  csv += `Gerado: ${new Date().toLocaleString('pt-PT')}\n\n`;

  if (selectedLabels.includes('Histórico de consultas')) {
    csv += 'Data,Paciente/Dentista,Tipo,Estado\n';
    csv += '05/03/2026,Dr. Alexandre Silva,Limpeza,Concluída\n';
    csv += '01/03/2026,Dr. Gil Oliveira,Ortodoncia,Concluída\n';
    csv += '25/02/2026,Dr. Gonçalo Costa,Check-up,Concluída\n';
    csv += '20/02/2026,Dr. Alexandre Silva,Emergência,Concluída\n\n';
  }

  if (selectedLabels.includes('Pontuação e XP')) {
    csv += 'Métrica,Valor\n';
    csv += 'XP Total,2450\n';
    csv += 'Nível,12\n';
    csv += 'Pontos Recompensa,890\n';
    csv += 'Streak Atual,7\n\n';
  }

  return csv;
}

export function ExportReportModal({ isOpen, onClose, userRole }: ExportReportModalProps) {
  const reports = userRole === 'clinic' ? CLINIC_REPORTS : userRole === 'patient' ? PATIENT_REPORTS : DENTIST_REPORTS;
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [period, setPeriod] = useState('mes');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dentistFilter, setDentistFilter] = useState('todos');
  const [format, setFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [generatedFilename, setGeneratedFilename] = useState('');

  const toggleReport = (id: string) => {
    setSelectedReports(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (selectedReports.length === 0) {
      toast.error('Selecione pelo menos um tipo de relatório.');
      return;
    }
    
    setExporting(true);
    
    // Mock delay
    await new Promise(r => setTimeout(r, 2000));
    
    const selectedLabels = selectedReports.map(id => reports.find(r => r.id === id)?.label || '');
    const ext = format === 'pdf' ? '.txt' : '.csv'; // .txt simulates PDF content
    const filename = `relatorio-smilecheck-${new Date().toISOString().slice(0, 10)}${ext}`;
    
    let content: string;
    let mimeType: string;
    
    if (format === 'pdf') {
      content = generateMockPDFContent(selectedLabels, period, userRole);
      mimeType = 'text/plain';
    } else {
      content = generateMockExcelContent(selectedLabels, period);
      mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    setGeneratedBlob(blob);
    setGeneratedFilename(filename);
    setExporting(false);
    setExportDone(true);
  };

  const handleDownload = () => {
    if (!generatedBlob) return;
    const url = URL.createObjectURL(generatedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generatedFilename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório descarregado!');
  };

  const handleClose = () => {
    setExporting(false);
    setExportDone(false);
    setGeneratedBlob(null);
    setSelectedReports([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </DialogTitle>
        </DialogHeader>

        {/* Export success state */}
        {exportDone ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Relatório gerado com sucesso!</h3>
            <p className="text-sm text-muted-foreground text-center">{generatedFilename}</p>
            <Button onClick={handleDownload} className="gap-2">
              📥 Descarregar
            </Button>
            <Button variant="ghost" onClick={handleClose} className="text-sm">
              Fechar
            </Button>
          </div>
        ) : exporting ? (
          /* Loading state */
          <div className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">A gerar relatório...</p>
          </div>
        ) : (
          /* Form */
          <div className="space-y-5 pt-2">
            {/* Report Types */}
            <div>
              <p className="text-sm font-medium mb-2">Tipo de Relatório</p>
              <div className="space-y-2">
                {reports.map(report => (
                  <label key={report.id} className="flex items-center gap-3 cursor-pointer py-1 hover:bg-accent/30 rounded px-2 -mx-2 transition-colors">
                    <Checkbox checked={selectedReports.includes(report.id)} onCheckedChange={() => toggleReport(report.id)} />
                    <span className="text-sm text-foreground">{report.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Period */}
            <div>
              <p className="text-sm font-medium mb-2">Período</p>
              <RadioGroup value={period} onValueChange={setPeriod} className="space-y-1.5">
                {PERIOD_OPTIONS.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.id} id={`modal-period-${opt.id}`} />
                    <Label htmlFor={`modal-period-${opt.id}`} className="text-sm cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {period === 'personalizado' && (
                <div className="flex items-center gap-3 mt-2">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground" />
                  <span className="text-sm text-muted-foreground">a</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground" />
                </div>
              )}
            </div>

            {/* Dentist filter (clinic only) */}
            {userRole === 'clinic' && (
              <div>
                <p className="text-sm font-medium mb-2">Dentista</p>
                <Select value={dentistFilter} onValueChange={setDentistFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {mockDentists.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Format */}
            <div>
              <p className="text-sm font-medium mb-2">Formato</p>
              <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="pdf" id="modal-fmt-pdf" />
                  <Label htmlFor="modal-fmt-pdf" className="text-sm cursor-pointer">PDF</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="excel" id="modal-fmt-excel" />
                  <Label htmlFor="modal-fmt-excel" className="text-sm cursor-pointer">Excel (.csv)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleExport} className="flex-1 gap-2" disabled={selectedReports.length === 0}>
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
