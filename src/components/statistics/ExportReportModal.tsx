import { useState } from 'react';
import { Glyph } from '@/components/ui/glyph';
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
import { useTranslation } from 'react-i18next';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

const REPORT_KEYS = {
  dentist: ['summary', 'confirmations', 'waitingList', 'history', 'scoring'],
  clinic: ['summary', 'confirmations', 'waitingList', 'history', 'scoring', 'teamStats', 'rankings'],
  patient: ['history', 'scoring'],
};

const PERIOD_KEYS = ['today', 'thisWeek', 'thisMonth', 'thisQuarter', 'thisYear', 'custom'];

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

export function ExportReportModal({ isOpen, onClose, userRole }: ExportReportModalProps) {
  const { t } = useTranslation();
  const reportKeys = REPORT_KEYS[userRole] || REPORT_KEYS.dentist;
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [period, setPeriod] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dentistFilter, setDentistFilter] = useState('all');
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
      toast.error(t('export.selectAtLeast'));
      return;
    }
    
    setExporting(true);
    await new Promise(r => setTimeout(r, 2000));
    
    const ext = format === 'pdf' ? '.txt' : '.csv';
    const filename = `relatorio-smilecheck-${new Date().toISOString().slice(0, 10)}${ext}`;
    
    const content = `SmileCheck Report - ${new Date().toLocaleString()}`;
    const mimeType = format === 'pdf' ? 'text/plain' : 'text/csv';
    
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
    toast.success(t('export.downloaded'));
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
            {t('statistics.exportReport')}
          </DialogTitle>
        </DialogHeader>

        {exportDone ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('export.generatedSuccess')}</h3>
            <p className="text-sm text-muted-foreground text-center">{generatedFilename}</p>
            <Button onClick={handleDownload} className="gap-2">
<Glyph emoji="📥" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('export.download')}
            </Button>
            <Button variant="ghost" onClick={handleClose} className="text-sm">
              {t('common.close')}
            </Button>
          </div>
        ) : exporting ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">{t('export.generating')}</p>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div>
              <p className="text-sm font-medium mb-2">{t('export.reportType')}</p>
              <div className="space-y-2">
                {reportKeys.map(key => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer py-1 hover:bg-accent/30 rounded px-2 -mx-2 transition-colors press">
                    <Checkbox checked={selectedReports.includes(key)} onCheckedChange={() => toggleReport(key)} />
                    <span className="text-sm text-foreground">{t(`export.report_${key}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{t('export.period')}</p>
              <RadioGroup value={period} onValueChange={setPeriod} className="space-y-1.5">
                {PERIOD_KEYS.map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <RadioGroupItem value={key} id={`modal-period-${key}`} />
                    <Label htmlFor={`modal-period-${key}`} className="text-sm cursor-pointer press">{t(`export.period_${key}`)}</Label>
                  </div>
                ))}
              </RadioGroup>
              {period === 'custom' && (
                <div className="flex items-center gap-3 mt-2">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground" />
                  <span className="text-sm text-muted-foreground">{t('export.to')}</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground" />
                </div>
              )}
            </div>

            {userRole === 'clinic' && (
              <div>
                <p className="text-sm font-medium mb-2">{t('statistics.dentist')}</p>
                <Select value={dentistFilter} onValueChange={setDentistFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('statistics.allDentists')}</SelectItem>
                    {mockDentists.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">{t('export.format')}</p>
              <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="pdf" id="modal-fmt-pdf" />
                  <Label htmlFor="modal-fmt-pdf" className="text-sm cursor-pointer press">PDF</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="excel" id="modal-fmt-excel" />
                  <Label htmlFor="modal-fmt-excel" className="text-sm cursor-pointer press">Excel (.csv)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button onClick={handleExport} className="flex-1 gap-2" disabled={selectedReports.length === 0}>
                <Download className="w-4 h-4" />
                {t('export.exportBtn')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
