import { useState } from 'react';
import { ArrowLeft, X, Search, User, Check, Star, MapPin, FileText, Send, Download, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MOCK_DENTIST_RESULTS, LEVEL_CONFIG, DentistSearchResult } from '@/data/mockDentistSearch';
import { mockDentists, mockClinics } from '@/data/mockData';
import { toast } from 'sonner';

interface ReferralLetterFlowProps {
  onClose: () => void;
  onGoHome?: () => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  inline?: boolean;
}

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Maria Silva', age: 34, lastConsultation: '15 Jan 2026' },
  { id: 'p2', name: 'João Costa', age: 28, lastConsultation: '10 Jan 2026' },
  { id: 'p3', name: 'Ana Ferreira', age: 51, lastConsultation: '8 Jan 2026' },
  { id: 'p4', name: 'Carlos Santos', age: 39, lastConsultation: '5 Jan 2026' },
  { id: 'p5', name: 'Pedro Almeida', age: 34, lastConsultation: '3 Jan 2026' },
];

const SPECIALTIES = [
  'Dentisteria Generalista', 'Dentisteria Estética', 'Cirurgia Oral', 'Endodontia',
  'Implantologia', 'Odontopediatria', 'Ortodontia', 'Periodontologia',
  'Prostodontia Fixa', 'Prostodontia Removível',
];

export function ReferralLetterFlow({ onClose, onGoHome, favorites = [], onToggleFavorite }: ReferralLetterFlowProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof MOCK_PATIENTS[0] | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDentist, setSelectedDentist] = useState<DentistSearchResult | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [sendToHealth, setSendToHealth] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [dentistFilter, setDentistFilter] = useState<'all' | 'favorites'>('all');

  const filteredPatients = MOCK_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredDentists = MOCK_DENTIST_RESULTS
    .filter(d => {
      if (dentistFilter === 'favorites') return favorites.includes(d.id);
      return true;
    })
    .sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 0 : 1;
      const bFav = favorites.includes(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return a.distance - b.distance;
    });

  const handleSend = () => {
    setCompleted(true);
    toast.success('Carta de Referência enviada com sucesso!');
  };

  if (completed) {
    return (
      <div className="fixed inset-0 bg-background z-[70] flex items-center justify-center">
        <div className="text-center space-y-4 p-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Carta de Referência enviada!</h2>
          <p className="text-sm text-muted-foreground">
            O paciente {selectedPatient?.name} foi notificado.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => {
              setStep(1); setSelectedPatient(null); setSelectedSpecialty('');
              setSelectedDentist(null); setReason(''); setNotes('');
              setCompleted(false);
            }}>
              Nova Referência
            </Button>
            <Button className="flex-1" onClick={() => { onClose(); onGoHome?.(); }}>
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1: // Select Patient
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Para quem é a referência?</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                placeholder="Pesquisar paciente..."
                className="pl-10"
              />
            </div>
            <div className="space-y-1">
              {filteredPatients.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                    selectedPatient?.id === p.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary/50'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.age} anos · Última consulta: {p.lastConsultation}</p>
                  </div>
                  {selectedPatient?.id === p.id && <Check className="w-5 h-5 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 2: // Select Specialty
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Qual a especialidade necessária?</h3>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALTIES.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSpecialty(s)}
                  className={cn(
                    'p-3 rounded-lg border text-sm text-left transition-colors',
                    selectedSpecialty === s
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // Select Dentist
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Escolha o dentista para referenciar</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setDentistFilter('all')}
                className={cn('px-3 py-1.5 text-xs rounded-full', dentistFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}
              >Todos</button>
              <button
                onClick={() => setDentistFilter('favorites')}
                className={cn('px-3 py-1.5 text-xs rounded-full', dentistFilter === 'favorites' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}
              >⭐ Só Favoritos</button>
            </div>
            <div className="space-y-1">
              {filteredDentists.map(d => {
                const levelCfg = LEVEL_CONFIG[d.level];
                const isFav = favorites.includes(d.id);
                const initials = d.name.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).map(n => n[0]).join('');
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDentist(d)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                      selectedDentist?.id === d.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary/50'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {isFav && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                        <span className="text-sm font-medium truncate">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className={cn('text-xs font-medium', levelCfg.color)}>{d.rating}</span>
                        <span className="text-xs text-muted-foreground">· {d.clinics[0]?.name}</span>
                        <span className="text-xs text-muted-foreground">· {d.distance} km</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] mt-1 h-4">Aceita novos pacientes</Badge>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {selectedDentist?.id === d.id && <Check className="w-5 h-5 text-primary" />}
                      <button onClick={e => { e.stopPropagation(); onToggleFavorite?.(d.id); }} className="p-1">
                        <Star className={cn('w-4 h-4', isFav ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 4: // Reason
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Detalhes da referência</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Motivo da Referência *</label>
              <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} placeholder="Descreva o motivo da referência..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Observações Clínicas (opcional)</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Observações adicionais..." />
            </div>
          </div>
        );

      case 5: // Preview
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Pré-visualizar Carta</h3>
            {/* PDF Preview */}
            <div className="border border-border rounded-xl bg-card p-5 space-y-4 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-base">CARTA DE REFERÊNCIA</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="font-semibold">{mockDentists[0].name}</p>
                <p className="text-muted-foreground text-xs">{mockClinics[0].name}</p>
                <p className="text-muted-foreground text-xs">{mockClinics[0].address}</p>
                <p className="text-muted-foreground text-xs">Nº Ordem: OMD-12345</p>
                <p className="text-muted-foreground text-xs">Data: {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Paciente:</p>
                <p>{selectedPatient?.name}, {selectedPatient?.age} anos</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Referencio Para:</p>
                <p className="font-medium">{selectedDentist?.name}</p>
                <p className="text-xs text-muted-foreground">Especialidade: {selectedSpecialty}</p>
                <p className="text-xs text-muted-foreground">{selectedDentist?.clinics[0]?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Motivo:</p>
                <p className="text-muted-foreground">{reason}</p>
              </div>
              {notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Observações:</p>
                  <p className="text-muted-foreground">{notes}</p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-end">
                <p className="text-xs text-muted-foreground">Assinatura: _______________</p>
                <div className="w-16 h-16 border border-dashed border-muted-foreground rounded flex items-center justify-center">
                  <span className="text-[8px] text-muted-foreground">QR Code</span>
                </div>
              </div>
            </div>

            {/* Send Options */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">Opções de envio:</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={sendToHealth} onCheckedChange={v => setSendToHealth(!!v)} />
                <span className="text-sm">Enviar para a área Saúde do paciente</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={sendEmail} onCheckedChange={v => setSendEmail(!!v)} />
                <span className="text-sm">Enviar por Email</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={downloadPdf} onCheckedChange={v => setDownloadPdf(!!v)} />
                <span className="text-sm">Download PDF</span>
              </label>
            </div>
          </div>
        );
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedPatient;
      case 2: return !!selectedSpecialty;
      case 3: return !!selectedDentist;
      case 4: return reason.trim().length > 0;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[70] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          {step > 1 ? (
            <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="text-base font-semibold">Carta de Referência</h2>
            <p className="text-xs text-muted-foreground">Passo {step} de 5</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={cn('h-1.5 w-8 rounded-full', s <= step ? 'bg-primary' : 'bg-secondary')} />
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          {renderStep()}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-4 flex gap-3 flex-shrink-0">
        <Button variant="outline" className="flex-1" onClick={() => step > 1 ? setStep(step - 1) : onClose()}>
          {step > 1 ? 'Anterior' : 'Cancelar'}
        </Button>
        <Button
          className="flex-1"
          disabled={!canProceed()}
          onClick={() => {
            if (step === 5) handleSend();
            else setStep(step + 1);
          }}
        >
          {step === 5 ? (
            <>
              <Send className="w-4 h-4 mr-1" />
              Assinar e Enviar
            </>
          ) : step === 4 ? 'Pré-visualizar' : 'Seguinte'}
        </Button>
      </div>
    </div>
  );
}
