import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/calendar';
import { mockDentists } from '@/data/mockData';
import { toast } from 'sonner';

interface ExportReportsViewProps {
  userRole: UserRole;
}

export function ExportReportsView({ userRole }: ExportReportsViewProps) {
  const { t } = useTranslation();

  const DENTIST_REPORTS = [
    { id: 'agenda', label: t('export.agendaReport') },
    { id: 'historico', label: t('export.historyReport') },
    { id: 'estatisticas', label: t('export.personalStats') },
    { id: 'receitas', label: t('export.prescriptionsReport') },
    { id: 'cartas', label: t('export.referralLetters') },
  ];

  const CLINIC_REPORTS = [
    { id: 'agenda_completa', label: t('export.fullAgenda') },
    { id: 'estatisticas_equipa', label: t('export.teamStats') },
    { id: 'taxa_confirmacao', label: t('export.confirmationRate') },
    { id: 'rankings', label: t('export.dentistRankings') },
    { id: 'relatorio_dentista', label: t('export.dentistReport') },
  ];

  const PERIOD_OPTIONS = [
    { id: 'hoje', label: t('export.today') },
    { id: 'semana', label: t('export.thisWeek') },
    { id: 'mes', label: t('export.thisMonth') },
    { id: 'personalizado', label: t('export.custom') },
  ];

  const reports = userRole === 'clinic' ? CLINIC_REPORTS : DENTIST_REPORTS;
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [period, setPeriod] = useState('mes');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dentistFilter, setDentistFilter] = useState('todos');
  const [format, setFormat] = useState('pdf');

  const toggleReport = (id: string) => {
    setSelectedReports(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleExport = () => {
    if (selectedReports.length === 0) {
      toast.error(t('export.selectAtLeast'));
      return;
    }
    const ext = format === 'pdf' ? '.pdf' : format === 'excel' ? '.xlsx' : '.csv';
    const filename = `relatorio-smilecheck${ext}`;
    const content = `SmileCheck Report\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('export.exportSuccess'), {
      icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
    });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{t('export.title')}</h1>
        </div>

        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('export.reportType')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reports.map(report => (
              <label key={report.id} className="flex items-center gap-3 cursor-pointer py-1 hover:bg-accent/30 rounded px-2 -mx-2 transition-colors">
                <Checkbox checked={selectedReports.includes(report.id)} onCheckedChange={() => toggleReport(report.id)} />
                <span className="text-sm text-foreground">{report.label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('export.filters')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t('export.period')}</label>
              <RadioGroup value={period} onValueChange={setPeriod} className="space-y-2">
                {PERIOD_OPTIONS.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.id} id={`period-${opt.id}`} />
                    <Label htmlFor={`period-${opt.id}`} className="text-sm cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {period === 'personalizado' && (
                <div className="flex items-center gap-3 mt-2">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground" />
                  <span className="text-sm text-muted-foreground">—</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground" />
                </div>
              )}
            </div>
            {userRole === 'clinic' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t('common.dentist')}</label>
                <Select value={dentistFilter} onValueChange={setDentistFilter}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">{t('export.allDentists')}</SelectItem>
                    {mockDentists.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('export.format')}</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup value={format} onValueChange={setFormat} className="space-y-2">
              <div className="flex items-center gap-2"><RadioGroupItem value="pdf" id="fmt-pdf" /><Label htmlFor="fmt-pdf" className="text-sm cursor-pointer">PDF</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="excel" id="fmt-excel" /><Label htmlFor="fmt-excel" className="text-sm cursor-pointer">Excel (.xlsx)</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="csv" id="fmt-csv" /><Label htmlFor="fmt-csv" className="text-sm cursor-pointer">CSV</Label></div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Button onClick={handleExport} className="w-full gap-2 h-12" disabled={selectedReports.length === 0}>
          <Download className="w-4 h-4" /> {t('export.exportButton')}
        </Button>
      </div>
    </ScrollArea>
  );
}
