import { useState, useMemo } from 'react';
import { Glyph } from '@/components/ui/glyph';
import { X, Search, Pill, FileText, Check, Plus, QrCode, Download, Mail, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { mockConsultations, mockDentists, mockClinics } from '@/data/mockData';
import { MEDICATIONS_WITH_TAGS, getMedicationAllergyBlock, getMedicationInteractions, type MedicationDef } from
'@/data/drugSafetyData';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { awardPointsSilently } from '@/data/pointsWrites';

interface PrescriptionFlowProps {
  onClose: () => void;
  onGoHome?: () => void;
  preSelectedPatient?: {id: string;name: string;age: number;};
  inline?: boolean;
}

type PrescriptionStep = 'patient' | 'medications' | 'preview' | 'success';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  posology: string;
}

// Mock patient health data
const PATIENT_HEALTH: Record<string, {
  allergies: string[];
  medications: {name: string;dosage: string;}[];
}> = {
  'fm1': {
    allergies: ['Penicilina', 'Látex'],
    medications: [{ name: 'Ibuprofeno', dosage: '400mg' }, { name: 'Omeprazol', dosage: '20mg' }]
  },
  'fm2': {
    allergies: ['Aspirina'],
    medications: []
  },
  'gp-p2': {
    allergies: ['Penicilina'],
    medications: [{ name: 'Varfarina', dosage: '5mg' }]
  },
  'gp-p4': {
    allergies: ['Anti-inflamatórios não esteróides (AINEs)'],
    medications: [{ name: 'Losartan', dosage: '50mg' }]
  },
  'ab-p4': {
    allergies: [],
    medications: [{ name: 'Sertralina', dosage: '50mg' }]
  }
};

const getPatientHealth = (patientId: string) =>
PATIENT_HEALTH[patientId] || { allergies: [], medications: [] };

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

export function PrescriptionFlow({ onClose, onGoHome, preSelectedPatient }: PrescriptionFlowProps) {
  const { t } = useTranslation();
  const { demoMode, user } = useAuth();
  const isMobile = useIsMobile();
  const skipPatient = !!preSelectedPatient;

  const [currentStep, setCurrentStep] = useState<PrescriptionStep>(skipPatient ? 'medications' : 'patient');
  const [selectedPatient, setSelectedPatient] = useState<{id: string;name: string;age: number;} | null>(preSelectedPatient || null);
  const [patientSearch, setPatientSearch] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualDosage, setManualDosage] = useState('');
  const [manualPosology, setManualPosology] = useState('');
  const [sendToHealth, setSendToHealth] = useState(true);
  const [sendByEmail, setSendByEmail] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState(false);

  const recentPatients = useMemo(() => getRecentPatients(), []);
  const filteredPatients = useMemo(() => {
    if (!patientSearch) return recentPatients.slice(0, 10);
    const q = patientSearch.toLowerCase();
    return recentPatients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patientSearch, recentPatients]);

  const patientHealth = useMemo(() => {
    if (!selectedPatient) return { allergies: [], medications: [] };
    return getPatientHealth(selectedPatient.id);
  }, [selectedPatient]);

  const filteredMeds = useMemo(() => {
    if (!medSearch) return MEDICATIONS_WITH_TAGS;
    const q = medSearch.toLowerCase();
    return MEDICATIONS_WITH_TAGS.filter((m) => m.name.toLowerCase().includes(q) || m.dosage.toLowerCase().includes(q));
  }, [medSearch]);

  const steps: PrescriptionStep[] = skipPatient ?
  ['medications', 'preview', 'success'] :
  ['patient', 'medications', 'preview', 'success'];

  const stepIndex = steps.indexOf(currentStep);

  const addMedication = (name: string, dosage: string) => {
    setMedications((prev) => [...prev, {
      id: `med-${Date.now()}-${Math.random()}`,
      name,
      dosage,
      posology: ''
    }]);
  };

  const removeMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const updatePosology = (id: string, posology: string) => {
    setMedications((prev) => prev.map((m) => m.id === id ? { ...m, posology } : m));
  };

  const addManualMedication = () => {
    if (manualName.trim()) {
      addMedication(manualName, manualDosage);
      setManualName('');
      setManualDosage('');
      setManualPosology('');
      setManualMode(false);
    }
  };

  const goNext = () => {
    const next = steps[stepIndex + 1];
    if (next) setCurrentStep(next);
    // Prescription issued → dentist points (server-side, real users only).
    if (next === 'success' && !demoMode && user) {
      awardPointsSilently(user.id, 'emitir_receita');
    }
  };

  const goPrev = () => {
    const prev = steps[stepIndex - 1];
    if (prev) setCurrentStep(prev);
  };

  const today = new Date();
  const rxCode = `RX${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const totalVisibleSteps = steps.filter((s) => s !== 'success').length;
  const currentStepNumber = Math.min(stepIndex + 1, totalVisibleSteps);

  const ProgressBar = () =>
  <div className="space-y-2 px-[15px] py-[10px]">
      <p className="text-xs text-muted-foreground text-center">{t('prescription.step', { current: currentStepNumber, total: totalVisibleSteps })}</p>
      <div className="flex items-center gap-2">
        {steps.filter((s) => s !== 'success').map((step, i) =>
      <div key={step} className="flex-1">
            <div className={cn(
          'h-1.5 rounded-full transition-colors',
          i <= stepIndex && currentStep !== 'success' ? 'bg-primary' : 'bg-muted'
        )} />
          </div>
      )}
      </div>
    </div>;

  // Step 1: Patient Selection
  const renderPatientStep = () =>
  <div className="flex-1 overflow-y-auto p-4 space-y-4 py-[15px] px-[15px]">
      <h2 className="text-lg font-bold text-center">{t('prescription.forWhom')}</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
        placeholder={t('prescription.searchPatient')}
        value={patientSearch}
        onChange={(e) => setPatientSearch(e.target.value)}
        className="pl-9" />
      </div>
      <div className="space-y-2">
        {filteredPatients.map((patient) =>
      <button
        key={patient.id}
        onClick={() => setSelectedPatient(patient)}
        className={cn("w-full flex items-center p-3 rounded-lg border transition-colors hover:border-primary hover:bg-primary/5 px-[10px] py-[5px] gap-[10px]",
        selectedPatient?.id === patient.id ? 'border-primary bg-primary/10' : 'border-border'
        )}>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left flex-1">
              <p className="text-sm font-medium">{patient.name}</p>
              <p className="text-xs text-muted-foreground">{patient.age} {t('profile.years')}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {patient.lastDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
              {selectedPatient?.id === patient.id && <Check className="w-5 h-5 text-primary" />}
            </div>
          </button>
      )}
      </div>
    </div>;

  // Medication item with allergy/interaction checks
  const MedicationListItem = ({ med }: {med: MedicationDef;}) => {
    const alreadyAdded = medications.some((m) => m.name === med.name && m.dosage === med.dosage);
    const allergyBlock = getMedicationAllergyBlock(med, patientHealth.allergies);
    const interactions = getMedicationInteractions(med, patientHealth.medications);
    const isBlocked = !!allergyBlock;
    const hasInteraction = interactions.length > 0;

    const content =
    <button
      key={`${med.name}-${med.dosage}`}
      onClick={() => !alreadyAdded && !isBlocked && addMedication(med.name, med.dosage)}
      disabled={alreadyAdded || isBlocked}
      className={cn(
        'w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors',
        isBlocked ?
        'opacity-50 cursor-not-allowed bg-muted/30' :
        alreadyAdded ?
        'bg-primary/10 text-primary cursor-default' :
        hasInteraction ?
        'hover:bg-muted/50 border border-amber-500/30 bg-amber-500/5 press' :
        'hover:bg-muted/50 border border-transparent hover:border-border press'
      )}>
        <div className="flex items-center gap-2">
          {isBlocked ?
        <AlertTriangle className="w-4 h-4 text-destructive" /> :
        hasInteraction ?
        <AlertTriangle className="w-4 h-4 text-amber-500" /> :
        <Pill className="w-4 h-4 text-muted-foreground" />
        }
          <span className={cn(isBlocked && 'line-through text-muted-foreground')}>{med.name} {med.dosage}</span>
        </div>
        {isBlocked ?
      <span className="text-[11px] font-medium text-destructive">{t('prescription.blocked')}</span> :
      hasInteraction ?
      <span className="text-[11px] font-medium text-amber-500">{t('prescription.interaction')}</span> :
      alreadyAdded ?
      <Check className="w-4 h-4 text-primary" /> :
      <Plus className="w-4 h-4 text-muted-foreground" />
      }
      </button>;

    if (isBlocked) {
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs p-3 space-y-1">
              <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('prescription.allergyDetected')}
              </p>
              <p className="text-xs">{t('prescription.allergyPatient')}: <strong>{allergyBlock!.matchedAllergy}</strong></p>
              <p className="text-xs">{t('prescription.medContains')} <strong>{allergyBlock!.matchedTag}</strong></p>
              <p className="text-xs text-muted-foreground mt-1">{t('prescription.prescriptionBlocked')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>);
    }

    if (hasInteraction && !alreadyAdded) {
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs p-3 space-y-1">
              <p className="text-sm font-semibold text-amber-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('prescription.drugInteraction')}
              </p>
              {interactions.map((w, i) =>
              <div key={i} className="text-xs space-y-0.5">
                  <p>{t('prescription.patientTakes')}: <strong>{w.currentMedName}</strong></p>
                  <p>{t('prescription.interactionWith')}: <strong>{w.prescribedMedName}</strong></p>
                  <p className="text-muted-foreground">{t('prescription.risk')}: {w.risk}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{t('prescription.prescribeWithCaution')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>);
    }

    return content;
  };

  // Step 2: Medications
  const renderMedicationsStep = () =>
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-lg font-bold">{t('prescription.prescribeMeds')}</h2>

      {selectedPatient &&
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {selectedPatient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{selectedPatient.name}</p>
            <p className="text-xs text-muted-foreground">{selectedPatient.age} {t('profile.years')}</p>
          </div>
          {patientHealth.allergies.length > 0 &&
      <div className="flex flex-wrap gap-1">
              {patientHealth.allergies.map((a) =>
        <span key={a} className="text-[11px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
<Glyph emoji="⚠️" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{a}
                </span>
        )}
            </div>
      }
        </div>
    }

      {patientHealth.medications.length > 0 &&
    <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <p className="text-xs font-medium text-warning mb-1">{t('prescription.currentPatientMeds')}:</p>
          <div className="flex flex-wrap gap-1">
            {patientHealth.medications.map((m) =>
        <span key={m.name} className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/10 text-warning">
                {m.name} {m.dosage}
              </span>
        )}
          </div>
        </div>
    }

      <div className={cn('gap-4', isMobile ? 'flex flex-col' : 'grid grid-cols-2')}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
            placeholder={t('prescription.searchMed')}
            value={medSearch}
            onChange={(e) => setMedSearch(e.target.value)}
            className="pl-9" />
          </div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {filteredMeds.map((med) =>
          <MedicationListItem key={`${med.name}-${med.dosage}`} med={med} />
          )}
          </div>

          {manualMode ?
        <div className="space-y-2 p-3 rounded-lg border border-border bg-card">
              <Input placeholder={t('prescription.medName')} value={manualName} onChange={(e) => setManualName(e.target.value)} />
              <Input placeholder={t('prescription.dosagePlaceholder')} value={manualDosage} onChange={(e) => setManualDosage(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={addManualMedication} disabled={!manualName.trim()}>{t('prescription.add')}</Button>
                <Button size="sm" variant="outline" onClick={() => setManualMode(false)}>{t('common.cancel')}</Button>
              </div>
            </div> :
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setManualMode(true)}>
              <Plus className="w-4 h-4" /> {t('prescription.addManually')}
            </Button>
        }
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" /> {t('prescription.currentPrescription')} ({medications.length})
          </h3>
          {medications.length === 0 ?
        <div className="p-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              {t('prescription.addMedsToRx')}
            </div> :
        <div className="space-y-3">
              {medications.map((med) => {
            const medDef = MEDICATIONS_WITH_TAGS.find((m) => m.name === med.name);
            const interactions = medDef ? getMedicationInteractions(medDef, patientHealth.medications) : [];
            return (
              <div key={med.id} className={cn(
                'p-3 rounded-lg border bg-card space-y-2',
                interactions.length > 0 ? 'border-amber-500/50' : 'border-border'
              )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {interactions.length > 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        <span className="text-sm font-medium">{med.name} {med.dosage}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMedication(med.id)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {interactions.length > 0 &&
                <p className="text-[11px] text-amber-500 font-medium">
<Glyph emoji="⚠️" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('prescription.interactionWith')} {interactions.map((w) => w.currentMedName).join(', ')} — {interactions[0].risk}
                      </p>
                }
                    <Input
                  placeholder={t('prescription.posologyPlaceholder')}
                  value={med.posology}
                  onChange={(e) => updatePosology(med.id, e.target.value)}
                  className="text-xs h-8" />
                  </div>);
          })}
            </div>
        }
        </div>
      </div>
    </div>;

  // Step 3: Preview
  const renderPreviewStep = () =>
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-lg font-bold">{t('prescription.preview')}</h2>

      <div className="bg-white text-gray-900 rounded-lg border-2 border-gray-200 p-6 space-y-4 shadow-sm max-w-lg mx-auto">
        <div className="border-b border-gray-300 pb-3 space-y-1">
          <h3 className="text-base font-bold text-gray-900">{mockDentists[0].name}</h3>
          <p className="text-xs text-gray-600">{mockDentists[0].specialty}</p>
          <p className="text-xs text-gray-600">{mockClinics[0].name} • {mockClinics[0].address}</p>
          <p className="text-xs text-gray-600">{t('prescription.orderNumber')}: OMD-12345</p>
        </div>

        <div className="text-xs text-gray-500">
          {t('prescription.dateLabel')}: {today.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <p className="text-sm"><span className="font-semibold">{t('prescription.patientLabel')}:</span> {selectedPatient?.name}</p>
          <p className="text-xs text-gray-600">{selectedPatient?.age} {t('profile.years')}</p>
          {patientHealth.allergies.length > 0 &&
        <p className="text-xs text-red-600 mt-1">
<Glyph emoji="⚠️" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('prescription.allergiesWarning')}: {patientHealth.allergies.join(', ')}</p>
        }
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{t('prescription.medications')}:</h4>
          {medications.map((med, i) =>
        <div key={med.id} className="pl-3 border-l-2 border-primary space-y-0.5">
              <p className="text-sm font-medium">{i + 1}. {med.name} {med.dosage}</p>
              {med.posology && <p className="text-xs text-gray-600 italic">{med.posology}</p>}
            </div>
        )}
        </div>

        <div className="pt-6 border-t border-gray-200 flex items-end justify-between">
          <div>
            <div className="w-40 border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-600">{t('prescription.dentistSignature')}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <QrCode className="w-12 h-12 text-gray-400" />
            <p className="text-[11px] text-gray-400">smilecheck.app/rx/{rxCode}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-w-lg mx-auto">
        <h3 className="text-sm font-semibold">{t('prescription.sendOptions')}:</h3>
        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer press">
          <Checkbox checked={sendToHealth} onCheckedChange={(v) => setSendToHealth(!!v)} />
          <Send className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{t('prescription.sendToHealth')}</span>
        </label>
        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer press">
          <Checkbox checked={sendByEmail} onCheckedChange={(v) => setSendByEmail(!!v)} />
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{t('prescription.sendByEmail')}</span>
        </label>
        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer press">
          <Checkbox checked={downloadPdf} onCheckedChange={(v) => setDownloadPdf(!!v)} />
          <Download className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{t('prescription.downloadPdf')}</span>
        </label>
      </div>
    </div>;

  // Success
  const renderSuccessStep = () =>
  <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold">{t('prescription.success')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('prescription.patientNotified', { name: selectedPatient?.name })}
        </p>
        <div className="text-left bg-muted/30 rounded-lg p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground mb-2">{t('prescription.prescribedMeds')}:</p>
          {medications.map((med) =>
        <p key={med.id} className="text-sm">• {med.name} {med.dosage}</p>
        )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => {
          setCurrentStep(skipPatient ? 'medications' : 'patient');
          setSelectedPatient(preSelectedPatient || null);
          setMedications([]);
        }}>
            {t('prescription.newPrescription')}
          </Button>
          <Button className="flex-1" onClick={() => {
          if (onGoHome) onGoHome();else
          onClose();
        }}>
            {t('prescription.goHome')}
          </Button>
        </div>
      </div>
    </div>;

  // Bottom buttons
  const renderBottomButtons = () => {
    if (currentStep === 'success') return null;

    return (
      <div className={cn(
        'border-t border-border bg-card flex justify-center',
        isMobile ? 'fixed bottom-[60px] left-0 right-0 z-[60] p-4' : 'p-3'
      )}>
        <div className="flex gap-2 w-full max-w-[600px]">
          {currentStep === steps[0] ?
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>{t('common.cancel')}</Button> :
          <Button variant="outline" size="sm" className="flex-1" onClick={goPrev}>{t('prescription.previous')}</Button>
          }
          {currentStep === 'patient' ?
          <Button size="sm" className="flex-1" disabled={!selectedPatient} onClick={goNext}>{t('prescription.next')}</Button> :
          currentStep === 'medications' ?
          <Button size="sm" className="flex-1" disabled={medications.length === 0} onClick={goNext}>{t('prescription.previewBtn')}</Button> :
          currentStep === 'preview' ?
          <Button size="sm" className="flex-1" onClick={goNext}>{t('prescription.signAndSend')}</Button> :
          null}
        </div>
      </div>);
  };

  return (
    <div className={cn(
      'flex flex-col bg-background',
      isMobile ?
      'fixed inset-0 z-[55]' :
      'flex-1'
    )}>
      <div className={cn(
        'flex flex-col bg-background overflow-hidden',
        isMobile ?
        'w-full h-full pb-[60px]' :
        'w-full h-full max-w-2xl mx-auto'
      )}>
        <div className="flex items-center justify-center p-4 border-b border-border flex-shrink-0">
          <div className="w-full max-w-[600px]">
            <h1 className="font-bold text-center text-lg">{t('prescription.title')}</h1>
          </div>
        </div>

        <div className="max-w-[600px] mx-auto w-full"><ProgressBar /></div>

        {currentStep === 'patient' && renderPatientStep()}
        {currentStep === 'medications' && renderMedicationsStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'success' && renderSuccessStep()}

        {renderBottomButtons()}
      </div>
    </div>);
}
