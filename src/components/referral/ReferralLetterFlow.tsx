import { useState } from 'react';
import { ArrowLeft, X, Search, User, Check, Star, MapPin, FileText, Send, Download, Mail, ChevronRight, Paperclip, Upload, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MOCK_DENTIST_RESULTS, LEVEL_CONFIG, DentistSearchResult } from '@/data/mockDentistSearch';
import { mockDentists, mockClinics, mockConsultations } from '@/data/mockData';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ReferralLetterFlowProps {
  onClose: () => void;
  onGoHome?: () => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  inline?: boolean;
  preSelectedDentist?: DentistSearchResult;
}

const getRecentPatients = () => {
  const seen = new Map<string, {id: string;name: string;age: number;lastDate: Date;}>();
  mockConsultations.forEach((c) => {
    if (!seen.has(c.patient.id) || c.date > seen.get(c.patient.id)!.lastDate) {
      seen.set(c.patient.id, {
        id: c.patient.id,
        name: c.patient.name,
        age: c.patient.age || 30,
        lastDate: c.date
      });
    }
  });
  return Array.from(seen.values()).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
};

const RECENT_PATIENTS = getRecentPatients();

interface MockAttachment {
  id: string;
  name: string;
  size: string;
}

const SPECIALTIES = [
'Dentisteria Generalista', 'Dentisteria Estética', 'Cirurgia Oral', 'Endodontia',
'Implantologia', 'Odontopediatria', 'Ortodontia', 'Periodontologia',
'Prostodontia Fixa', 'Prostodontia Removível'];

const SPECIALTY_KEYS: Record<string, string> = {
  'Dentisteria Generalista': 'generalDentistry',
  'Dentisteria Estética': 'cosmeticDentistry',
  'Cirurgia Oral': 'oralSurgery',
  'Endodontia': 'endodontics',
  'Implantologia': 'implantology',
  'Odontopediatria': 'pediatricDentistry',
  'Ortodontia': 'orthodontics',
  'Periodontologia': 'periodontics',
  'Prostodontia Fixa': 'fixedProsthodontics',
  'Prostodontia Removível': 'removableProsthodontics',
};

export function ReferralLetterFlow({ onClose, onGoHome, favorites = [], onToggleFavorite, preSelectedDentist }: ReferralLetterFlowProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{id: string;name: string;age: number;lastDate: Date;} | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDentist, setSelectedDentist] = useState<DentistSearchResult | null>(preSelectedDentist || null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [sendToHealth, setSendToHealth] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [dentistFilter, setDentistFilter] = useState<'all' | 'favorites'>('all');
  const [attachments, setAttachments] = useState<MockAttachment[]>([
  { id: 'a1', name: 'Radiografia_panoramica.jpg', size: '2.3 MB' },
  { id: 'a2', name: 'Foto_intraoral_36.png', size: '1.1 MB' }]
  );

  const filteredPatients = (() => {
    const patients = RECENT_PATIENTS.slice(0, 10);
    if (!patientSearch) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(q));
  })();

  const filteredDentists = MOCK_DENTIST_RESULTS.
  filter((d) => {
    if (dentistFilter === 'favorites') return favorites.includes(d.id);
    return true;
  }).
  sort((a, b) => {
    const aFav = favorites.includes(a.id) ? 0 : 1;
    const bFav = favorites.includes(b.id) ? 0 : 1;
    if (aFav !== bFav) return aFav - bFav;
    if (a.rating !== b.rating) return b.rating - a.rating;
    return a.distance - b.distance;
  });

  const handleSend = () => {
    setCompleted(true);
    toast.success(t('referral.referralSuccess'));
  };

  if (completed) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('referral.success')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('referral.patientNotified', { name: selectedPatient?.name })}
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => {
              setStep(1);setSelectedPatient(null);setSelectedSpecialty('');
              setSelectedDentist(null);setReason('');setNotes('');
              setCompleted(false);
            }}>
              {t('referral.newReferral')}
            </Button>
            <Button className="flex-1" onClick={() => {onClose();onGoHome?.();}}>
              {t('referral.goHome')}
            </Button>
          </div>
        </div>
      </div>);
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-center">{t('referral.forWhom')}</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder={t('referral.searchPatient')}
                className="pl-10" />
            </div>
            <div className="space-y-2">
              {filteredPatients.map((p) =>
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={cn("w-full flex items-center p-3 rounded-lg border transition-all hover:border-primary hover:bg-primary/5 px-[10px] py-[5px] gap-[10px]",
                selectedPatient?.id === p.id ? 'border-primary bg-primary/10' : 'border-border'
                )}>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.age} {t('profile.years')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {p.lastDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                    {selectedPatient?.id === p.id && <Check className="w-5 h-5 text-primary" />}
                  </div>
                </button>
              )}
            </div>
          </div>);

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">{t('referral.whichSpecialty')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALTIES.map((s) =>
              <button
                key={s}
                onClick={() => setSelectedSpecialty(s)}
                className={cn(
                  'p-3 rounded-lg border text-sm text-left transition-colors',
                  selectedSpecialty === s ?
                  'border-primary bg-primary/10 text-primary font-medium' :
                  'border-border hover:border-primary/50'
                )}>
                  {t(`specialties.${SPECIALTY_KEYS[s] || s}`)}
                </button>
              )}
            </div>
          </div>);

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">{t('referral.chooseDentist')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setDentistFilter('all')}
                className={cn('px-3 py-1.5 text-xs rounded-full', dentistFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
                {t('referral.allDentists')}</button>
              <button
                onClick={() => setDentistFilter('favorites')}
                className={cn('px-3 py-1.5 text-xs rounded-full', dentistFilter === 'favorites' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
                ⭐ {t('referral.onlyFavorites')}</button>
            </div>
            <div className="space-y-2">
              {filteredDentists.map((d) => {
                const levelCfg = LEVEL_CONFIG[d.level];
                const isFav = favorites.includes(d.id);
                const nameParts = d.name.split(' ').filter((n) => n.toLowerCase() !== 'dr.' && n.toLowerCase() !== 'dr' && n.toLowerCase() !== 'dra.' && n.toLowerCase() !== 'dra');
                const initials = nameParts.filter((_, i, a) => i === 0 || i === a.length - 1).map((n) => n[0]).join('');
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDentist(d)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                      selectedDentist?.id === d.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}>
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
                      <Badge variant="outline" className="text-[11px] mt-1 h-4">{t('profile.acceptsNewPatients')}</Badge>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {selectedDentist?.id === d.id && <Check className="w-5 h-5 text-primary" />}
                      <button onClick={(e) => {e.stopPropagation();onToggleFavorite?.(d.id);}} className="p-1">
                        <Star className={cn('w-4 h-4', isFav ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                      </button>
                    </div>
                  </button>);
              })}
            </div>
          </div>);

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">{t('referral.referralDetails')}</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{t('referral.referralReason')} *</label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder={t('referral.referralReasonPlaceholder')} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{t('referral.clinicalObs')}</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={t('referral.clinicalObsPlaceholder')} />
            </div>

            <Separator />
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">{t('referral.attachments')}</h4>
                <p className="text-xs text-muted-foreground">{t('referral.attachmentsDesc')}</p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('referral.dropFiles')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('referral.fileTypes')}</p>
              </div>

              {attachments.length > 0 &&
              <div className="space-y-2">
                  {attachments.map((file) =>
                <div key={file.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card">
                      <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.size}</span>
                      <button
                    onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== file.id))}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                )}
                </div>
              }

              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                const newId = `a${Date.now()}`;
                setAttachments((prev) => [...prev, { id: newId, name: `Documento_${prev.length + 1}.pdf`, size: '0.5 MB' }]);
              }}>
                <Plus className="w-4 h-4" /> {t('referral.addFile')}
              </Button>
            </div>
          </div>);

      case 5:
        return (
          <div className="space-y-4">
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-sm font-semibold text-amber-600">{t('referral.omdMissing')}</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                {t('referral.omdMissingDesc')}
                <button className="block mt-1 text-xs font-medium text-primary hover:underline">
                  {t('referral.completeProfile')}
                </button>
              </AlertDescription>
            </Alert>

            <h3 className="text-base font-semibold">{t('referral.previewLetter')}</h3>
            <div className="border border-border rounded-xl bg-card p-5 space-y-4 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-base">{t('referral.referralLetter')}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="font-semibold">{mockDentists[0].name}</p>
                <p className="text-muted-foreground text-xs">{mockClinics[0].name}</p>
                <p className="text-muted-foreground text-xs">{mockClinics[0].address}</p>
                <p className="text-muted-foreground text-xs">{t('prescription.orderNumber')}: OMD-12345</p>
                <p className="text-muted-foreground text-xs">{t('prescription.dateLabel')}: {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{t('prescription.patientLabel')}:</p>
                <p>{selectedPatient?.name}, {selectedPatient?.age} {t('profile.years')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{t('referral.referTo')}:</p>
                <p className="font-medium">{selectedDentist?.name}</p>
                <p className="text-xs text-muted-foreground">{t('referral.specialty')}: {selectedSpecialty ? t(`specialties.${SPECIALTY_KEYS[selectedSpecialty] || selectedSpecialty}`) : ''}</p>
                <p className="text-xs text-muted-foreground">{selectedDentist?.clinics[0]?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{t('referral.reasonLabel')}:</p>
                <p className="text-muted-foreground">{reason}</p>
              </div>
              {notes &&
              <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">{t('referral.observations')}:</p>
                  <p className="text-muted-foreground">{notes}</p>
                </div>
              }
              <Separator />
              <div className="flex justify-between items-end">
                <p className="text-xs text-muted-foreground">{t('referral.signature')}: _______________</p>
                <div className="w-16 h-16 border border-dashed border-muted-foreground rounded flex items-center justify-center">
                  <span className="text-[11px] text-muted-foreground">QR Code</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">{t('referral.sendOptions')}:</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={sendToHealth} onCheckedChange={(v) => setSendToHealth(!!v)} />
                <span className="text-sm">{t('referral.sendToHealth')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={sendEmail} onCheckedChange={(v) => setSendEmail(!!v)} />
                <span className="text-sm">{t('referral.sendByEmail')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={downloadPdf} onCheckedChange={(v) => setDownloadPdf(!!v)} />
                <span className="text-sm">{t('referral.downloadPdf')}</span>
              </label>
            </div>
          </div>);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:return !!selectedPatient;
      case 2:return !!selectedSpecialty;
      case 3:return !!selectedDentist;
      case 4:return reason.trim().length > 0;
      case 5:return true;
      default:return false;
    }
  };

  return (
    <div className={cn(
      'flex flex-col bg-background',
      isMobile ?
      'fixed inset-0 z-[55]' :
      'flex-1'
    )}>
    <div className={cn(
        'flex flex-col bg-background overflow-hidden gap-0',
        isMobile ?
        'w-full h-full pb-[60px]' :
        'w-full h-full max-w-2xl mx-auto'
      )}>
      <div className="flex items-center justify-center p-4 border-b border-border flex-shrink-0">
        <div className="w-full max-w-[600px]">
          <h1 className="font-bold text-lg text-center">{t('referral.title')}</h1>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto w-full">
        <div className="space-y-2 py-[10px] px-[15px]">
          <p className="text-xs text-muted-foreground text-center">{t('referral.step', { step })}</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) =>
              <div key={s} className="flex-1">
              <div className={cn('h-1.5 rounded-full transition-all', s <= step ? 'bg-primary' : 'bg-muted')} />
            </div>
              )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-0 pl-[20px]">
        <div className="p-4 md:p-6 max-w-[600px] pb-[5px] px-0 mx-0 pt-0 py-[5px]">
          {renderStep()}
        </div>
      </div>

      <div className={cn("border-t border-border flex-shrink-0 flex items-start justify-center border mr-[30px] px-0",
        isMobile ? 'fixed bottom-[60px] left-0 right-0 z-[60] p-4 bg-card' : 'p-3'
        )}>
        <div className="flex gap-2 w-full max-w-[600px]">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => step > 1 ? setStep(step - 1) : onClose()}>
            {step > 1 ? t('referral.previous') : t('referral.cancel')}
          </Button>
          <Button
              size="sm"
              className="flex-1"
              disabled={!canProceed()}
              onClick={() => {
                if (step === 5) handleSend();else
                setStep(step + 1);
              }}>
            {step === 5 ?
              <>
                <Send className="w-4 h-4 mr-1" />
                {t('referral.signAndSend')}
              </> :
              step === 4 ? t('referral.previewBtn') : t('referral.next')}
          </Button>
        </div>
      </div>
    </div>
    </div>);
}
