import { useState } from 'react';
import { Download, CheckCircle2, X } from 'lucide-react';
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
  { id: 'agenda', label: 'Agenda (dia/semana/mês)' },
  { id: 'historico', label: 'Histórico de consultas' },
  { id: 'estatisticas', label: 'Estatísticas pessoais (consultas, faltas, rating)' },
  { id: 'receitas', label: 'Receitas prescritas' },
  { id: 'cartas', label: 'Cartas de referência emitidas' },
];

const CLINIC_REPORTS = [
  { id: 'agenda_completa', label: 'Agenda completa (todos os dentistas)' },
  { id: 'estatisticas_equipa', label: 'Estatísticas da equipa' },
  { id: 'taxa_confirmacao', label: 'Taxa de confirmação/faltas' },
  { id: 'rankings', label: 'Rankings dos dentistas' },
  { id: 'relatorio_dentista', label: 'Relatório por dentista' },
];

const PERIOD_OPTIONS = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mês' },
  { id: 'personalizado', label: 'Personalizado' },
];

export function ExportReportModal({ isOpen, onClose, userRole }: ExportReportModalProps) {
  const reports = userRole === 'clinic' ? CLINIC_REPORTS : DENTIST_REPORTS;
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [period, setPeriod] = useState('mes');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dentistFilter, setDentistFilter] = useState('todos');
  const [format, setFormat] = useState('pdf');

  const toggleReport = (id: string) => {
    setSelectedReports(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    if (selectedReports.length === 0) {
      toast.error('Selecione pelo menos um tipo de relatório.');
      return;
    }
    const selectedLabels = selectedReports.map(id => reports.find(r => r.id === id)?.label).join(', ');
    const ext = format === 'pdf' ? '.pdf' : '.xlsx';
    const filename = `relatorio-smilecheck${ext}`;
    const content = `SmileCheck Report\n\nRelatórios: ${selectedLabels}\nPeríodo: ${period}\nFormato: ${format}\nGerado em: ${new Date().toLocaleString('pt-PT')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado com sucesso!', {
      icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </DialogTitle>
        </DialogHeader>

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
                <Label htmlFor="modal-fmt-excel" className="text-sm cursor-pointer">Excel (.xlsx)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} className="w-full gap-2" disabled={selectedReports.length === 0}>
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
